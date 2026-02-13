#!/bin/bash

# Configuration
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/open-exchange-dev}"
EXIT_CODE=0

echo "🔍 Auditing Books on $DB_URL"

# =================================================================================================
# CHECK 1: SYSTEM SOLVENCY (External Flow vs Internal Holdings)
# =================================================================================================
echo ""
echo "📊 CHECK 1: SYSTEM SOLVENCY"
echo "---------------------------------------------------------------------------------------------------"
printf "%-10s | %-25s | %-25s | %-15s | %-10s\n" "Asset" "Total Wallets" "Net In/Out" "Variance" "Status"
echo "---------------------------------------------------------------------------------------------------"

QUERY_SOLVENCY="
WITH WalletSum AS (
    SELECT \"assetId\", SUM(total) as total_held
    FROM \"Wallet\"
    GROUP BY \"assetId\"
),
DepositSum AS (
    SELECT \"assetId\", SUM(amount) as total_deposited
    FROM \"Deposit\"
    WHERE status = 'completed'
    GROUP BY \"assetId\"
),
WithdrawalSum AS (
    SELECT \"assetId\", SUM(amount) as total_withdrawn
    FROM \"Withdrawal\"
    WHERE status = 'completed'
    GROUP BY \"assetId\"
)
SELECT 
    a.symbol,
    COALESCE(w.total_held, 0) as wallet_total,
    (COALESCE(d.total_deposited, 0) - COALESCE(wd.total_withdrawn, 0)) as net_flow,
    (COALESCE(w.total_held, 0) - (COALESCE(d.total_deposited, 0) - COALESCE(wd.total_withdrawn, 0))) as variance
FROM \"Asset\" a
LEFT JOIN WalletSum w ON a.id = w.\"assetId\"
LEFT JOIN DepositSum d ON a.id = d.\"assetId\"
LEFT JOIN WithdrawalSum wd ON a.id = wd.\"assetId\"
ORDER BY a.symbol;
"

psql "$DB_URL" -c "$QUERY_SOLVENCY"

# Check for Variance
CHECK_QUERY_SOLVENCY="
WITH WalletSum AS (
    SELECT \"assetId\", SUM(total) as total_held
    FROM \"Wallet\"
    GROUP BY \"assetId\"
),
DepositSum AS (
    SELECT \"assetId\", SUM(amount) as total_deposited
    FROM \"Deposit\"
    WHERE status = 'completed'
    GROUP BY \"assetId\"
),
WithdrawalSum AS (
    SELECT \"assetId\", SUM(amount) as total_withdrawn
    FROM \"Withdrawal\"
    WHERE status = 'completed'
    GROUP BY \"assetId\"
)
SELECT COUNT(*)
FROM \"Asset\" a
LEFT JOIN WalletSum w ON a.id = w.\"assetId\"
LEFT JOIN DepositSum d ON a.id = d.\"assetId\"
LEFT JOIN WithdrawalSum wd ON a.id = wd.\"assetId\"
WHERE (COALESCE(w.total_held, 0) - (COALESCE(d.total_deposited, 0) - COALESCE(wd.total_withdrawn, 0))) != 0;
"
SOLVENCY_ERRORS=$(psql "$DB_URL" -t -c "$CHECK_QUERY_SOLVENCY" | xargs)

if [ "$SOLVENCY_ERRORS" -ne "0" ]; then
    echo "❌ FAIL: Solvency Imbalance detected in $SOLVENCY_ERRORS assets."
    EXIT_CODE=1
else
    echo "✅ PASS: System Solvency (Wallets match Net Flow)."
fi


# =================================================================================================
# CHECK 2: WALLET INTEGRITY (Internal Consistency)
# =================================================================================================
echo ""
echo "🛡️  CHECK 2: WALLET INTEGRITY (Available + Locked = Total)"
CHECK_QUERY_WALLET="
SELECT COUNT(*) FROM \"Wallet\" WHERE total != (available + locked);
"
WALLET_ERRORS=$(psql "$DB_URL" -t -c "$CHECK_QUERY_WALLET" | xargs)

if [ "$WALLET_ERRORS" -ne "0" ]; then
    echo "❌ FAIL: $WALLET_ERRORS wallets have inconsistent balances (Total != Available + Locked)."
    psql "$DB_URL" -c "SELECT id, \"accountId\", total, available, locked FROM \"Wallet\" WHERE total != (available + locked);"
    EXIT_CODE=1
else
    echo "✅ PASS: All wallets are internally consistent."
fi


# =================================================================================================
# CHECK 3: LEDGER ZERO-SUM (Double Entry Accounting - TRADES ONLY)
# =================================================================================================
echo ""
echo "⚖️  CHECK 3: LEDGER ZERO-SUM (Debits + Credits = 0 per Trade Transaction)"
# We check only 'trade' events. Deposits/Withdrawals are external, so they don't zero-sum internally.
# For trades, we must group by eventId AND assetId to ensure each asset balances to 0.
CHECK_QUERY_LEDGER="
SELECT COUNT(*) FROM (
    SELECT le.\"eventId\", le.meta->>'asset' as asset, SUM(le.amount::numeric) as balance
    FROM \"LedgerEntry\" le
    JOIN \"LedgerEvent\" evt ON le.\"eventId\" = evt.id
    WHERE evt.type = 'trade'
    GROUP BY le.\"eventId\", le.meta->>'asset'
    HAVING SUM(le.amount::numeric) != 0
) as imbalances;
"
LEDGER_ERRORS=$(psql "$DB_URL" -t -c "$CHECK_QUERY_LEDGER" | xargs)

if [ "$LEDGER_ERRORS" -ne "0" ]; then
    echo "❌ FAIL: $LEDGER_ERRORS trade asset groups do not balance to zero."
    psql "$DB_URL" -c "
    SELECT le.\"eventId\", le.meta->>'asset' as asset, SUM(le.amount::numeric) as balance 
    FROM \"LedgerEntry\" le 
    JOIN \"LedgerEvent\" evt ON le.\"eventId\" = evt.id 
    WHERE evt.type = 'trade'
    GROUP BY le.\"eventId\", le.meta->>'asset' 
    HAVING SUM(le.amount::numeric) != 0 
    LIMIT 5;"
    EXIT_CODE=1
else
    echo "✅ PASS: All trade transactions balance to zero per asset."
fi


# =================================================================================================
# CHECK 4: LEDGER VS WALLET RECONCILIATION (History vs State)
# =================================================================================================
echo ""
echo "📜 CHECK 4: LEDGER VS WALLET RECONCILIATION"
CHECK_QUERY_LEDGER_WALLET="
WITH LedgerSums AS (
    SELECT
        le.\"accountId\",
        COALESCE(
            le.meta->>'asset',
            da.symbol,
            wa.symbol
        ) as asset_symbol,
        SUM(le.amount) as ledger_total
    FROM \"LedgerEntry\" le
    JOIN \"LedgerEvent\" evt ON le.\"eventId\" = evt.id
    LEFT JOIN \"Deposit\" d ON evt.type = 'deposit' AND evt.\"referenceId\"::uuid = d.id
    LEFT JOIN \"Asset\" da ON d.\"assetId\" = da.id
    LEFT JOIN \"Withdrawal\" w ON evt.type = 'withdrawal' AND evt.\"referenceId\"::uuid = w.id
    LEFT JOIN \"Asset\" wa ON w.\"assetId\" = wa.id
    GROUP BY le.\"accountId\", asset_symbol
),
WalletSums AS (
    SELECT
        w.\"accountId\",
        a.symbol as asset_symbol,
        w.total as wallet_total
    FROM \"Wallet\" w
    JOIN \"Asset\" a ON w.\"assetId\" = a.id
)
SELECT COUNT(*)
FROM WalletSums ws
FULL OUTER JOIN LedgerSums ls ON ws.\"accountId\" = ls.\"accountId\" AND ws.asset_symbol = ls.asset_symbol
WHERE ws.wallet_total IS DISTINCT FROM ls.ledger_total;
"
LEDGER_WALLET_ERRORS=$(psql "$DB_URL" -t -c "$CHECK_QUERY_LEDGER_WALLET" | xargs)

if [ "$LEDGER_WALLET_ERRORS" -ne "0" ]; then
    echo "❌ FAIL: $LEDGER_WALLET_ERRORS wallets do not match ledger history."
    # Optional: Print detailed diff
    # psql "$DB_URL" -c "..."
    EXIT_CODE=1
else
    echo "✅ PASS: Ledger history matches Wallet state."
fi


# =================================================================================================
# CHECK 5: ORDER BOOK VS WALLET LOCKED BALANCE
# =================================================================================================
echo ""
echo "🔒 CHECK 5: ORDER BOOK VS WALLET LOCKED BALANCE"
CHECK_QUERY_LOCKED="
WITH OrderLocks AS (
    -- Bids: Lock Quote Asset
    SELECT
        o.\"accountId\",
        qa.symbol as asset_symbol,
        SUM((o.quantity - o.\"quantityFilled\") * o.price) as expected_locked
    FROM \"Order\" o
    JOIN \"Instrument\" i ON o.\"instrumentId\" = i.id
    JOIN \"Asset\" qa ON i.\"quoteAssetId\" = qa.id
    WHERE o.side = 'buy' AND o.status = 'open'
    GROUP BY o.\"accountId\", qa.symbol

    UNION ALL

    -- Asks: Lock Base Asset
    SELECT
        o.\"accountId\",
        ba.symbol as asset_symbol,
        SUM(o.quantity - o.\"quantityFilled\") as expected_locked
    FROM \"Order\" o
    JOIN \"Instrument\" i ON o.\"instrumentId\" = i.id
    JOIN \"Asset\" ba ON i.\"underlyingAssetId\" = ba.id
    WHERE o.side = 'sell' AND o.status = 'open'
    GROUP BY o.\"accountId\", ba.symbol
),
AggregatedLocks AS (
    SELECT \"accountId\", asset_symbol, SUM(expected_locked) as total_expected_locked
    FROM OrderLocks
    GROUP BY \"accountId\", asset_symbol
)
SELECT COUNT(*)
FROM \"Wallet\" w
JOIN \"Asset\" a ON w.\"assetId\" = a.id
LEFT JOIN AggregatedLocks al ON w.\"accountId\" = al.\"accountId\" AND a.symbol = al.asset_symbol
WHERE w.locked != COALESCE(al.total_expected_locked, 0);
"
LOCKED_ERRORS=$(psql "$DB_URL" -t -c "$CHECK_QUERY_LOCKED" | xargs)

if [ "$LOCKED_ERRORS" -ne "0" ]; then
    echo "❌ FAIL: $LOCKED_ERRORS wallets have incorrect locked balances."
    EXIT_CODE=1
else
    echo "✅ PASS: Locked balances match Open Orders."
fi


# =================================================================================================
# CHECK 6: NEGATIVE BALANCE CHECK
# =================================================================================================
echo ""
echo "⛔ CHECK 6: NEGATIVE BALANCE CHECK"
CHECK_QUERY_NEGATIVE="
SELECT COUNT(*) FROM \"Wallet\" WHERE total < 0 OR available < 0 OR locked < 0;
"
NEGATIVE_ERRORS=$(psql "$DB_URL" -t -c "$CHECK_QUERY_NEGATIVE" | xargs)

if [ "$NEGATIVE_ERRORS" -ne "0" ]; then
    echo "❌ FAIL: $NEGATIVE_ERRORS wallets have negative balances."
    psql "$DB_URL" -c "SELECT id, \"accountId\", total, available, locked FROM \"Wallet\" WHERE total < 0 OR available < 0 OR locked < 0;"
    EXIT_CODE=1
else
    echo "✅ PASS: No negative balances found."
fi


# =================================================================================================
# CHECK 7: FEE ACCOUNT RECONCILIATION
# =================================================================================================
echo ""
echo "💸 CHECK 7: FEE ACCOUNT RECONCILIATION"
CHECK_QUERY_FEES="
WITH FeeCollected AS (
    SELECT
        f.\"feeCurrency\" as asset_symbol,
        SUM(f.fee) as total_fee
    FROM \"Fill\" f
    GROUP BY f.\"feeCurrency\"
),
InitialBalances AS (
    SELECT
        a.symbol as asset_symbol,
        SUM(d.amount) as initial_amount
    FROM \"Deposit\" d
    JOIN \"Account\" acc ON d.\"accountId\" = acc.id
    JOIN \"Asset\" a ON d.\"assetId\" = a.id
    WHERE acc.name = 'fees_account' AND d.\"txHash\" = 'system_init'
    GROUP BY a.symbol
),
FeeAccountBalance AS (
    SELECT
        a.symbol as asset_symbol,
        w.total as wallet_total
    FROM \"Wallet\" w
    JOIN \"Account\" acc ON w.\"accountId\" = acc.id
    JOIN \"Asset\" a ON w.\"assetId\" = a.id
    WHERE acc.name = 'fees_account'
)
SELECT COUNT(*)
FROM FeeAccountBalance fab
LEFT JOIN FeeCollected fc ON fab.asset_symbol = fc.asset_symbol
LEFT JOIN InitialBalances ib ON fab.asset_symbol = ib.asset_symbol
WHERE fab.wallet_total != (COALESCE(fc.total_fee, 0) + COALESCE(ib.initial_amount, 0));
"
FEE_ERRORS=$(psql "$DB_URL" -t -c "$CHECK_QUERY_FEES" | xargs)

if [ "$FEE_ERRORS" -ne "0" ]; then
    echo "❌ FAIL: Fee account reconciliation failed."
    psql "$DB_URL" -c "
    WITH FeeCollected AS (
        SELECT f.\"feeCurrency\" as asset_symbol, SUM(f.fee) as total_fee FROM \"Fill\" f GROUP BY f.\"feeCurrency\"
    ),
    InitialBalances AS (
        SELECT a.symbol as asset_symbol, SUM(d.amount) as initial_amount FROM \"Deposit\" d JOIN \"Account\" acc ON d.\"accountId\" = acc.id JOIN \"Asset\" a ON d.\"assetId\" = a.id WHERE acc.name = 'fees_account' AND d.\"txHash\" = 'system_init' GROUP BY a.symbol
    ),
    FeeAccountBalance AS (
        SELECT a.symbol as asset_symbol, w.total as wallet_total FROM \"Wallet\" w JOIN \"Account\" acc ON w.\"accountId\" = acc.id JOIN \"Asset\" a ON w.\"assetId\" = a.id WHERE acc.name = 'fees_account'
    )
    SELECT fab.asset_symbol, fab.wallet_total, fc.total_fee, ib.initial_amount 
    FROM FeeAccountBalance fab 
    LEFT JOIN FeeCollected fc ON fab.asset_symbol = fc.asset_symbol 
    LEFT JOIN InitialBalances ib ON fab.asset_symbol = ib.asset_symbol
    WHERE fab.wallet_total != (COALESCE(fc.total_fee, 0) + COALESCE(ib.initial_amount, 0));"
    EXIT_CODE=1
else
    echo "✅ PASS: Fee account balances match collected fees."
fi

echo ""
echo "---------------------------------------------------------------------------------------------------"
if [ "$EXIT_CODE" -eq "0" ]; then
    echo "🎉 AUDIT COMPLETE: ALL SYSTEMS GO."
    exit 0
else
    echo "💥 AUDIT FAILED: INVESTIGATION REQUIRED."
    exit 1
fi
