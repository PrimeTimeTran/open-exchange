#!/bin/bash

# Configuration
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/open-exchange-dev}"
EXIT_CODE=0

echo "🔍 Auditing Books on $DB_URL"
echo "---------------------------------------------------------------------------------------------------"

# Function to run a check
# Arguments:
# 1. Test Name
# 2. Total Count Query (returns a single number)
# 3. Variance Query (returns rows only on error)
run_check() {
    local test_name="$1"
    local total_query="$2"
    local variance_query="$3"

    # 1. Get Total Count
    local total=$(psql -t -A "$DB_URL" -c "$total_query" 2>/dev/null)
    
    # 2. Get Failure Count
    local failures=$(psql -t -A "$DB_URL" -c "WITH Data AS ($variance_query) SELECT count(*) FROM Data;" 2>/dev/null)

    # 3. Report Status
    if [ "$failures" -eq "0" ]; then
        printf "✅ %-35s | Checked: %-5s | Status: OK\n" "$test_name" "$total"
    else
        printf "🚫 %-35s | Checked: %-5s | Failures: %s\n" "$test_name" "$total" "$failures"
        echo "   -> Details (Top 10):"
        psql "$DB_URL" -c "$variance_query" | head -n 14 | sed 's/^/      /'
        if [ "$failures" -gt "10" ]; then
            echo "      ... and $((failures - 10)) more rows."
        fi
        EXIT_CODE=1
    fi
}

# =================================================================================================
# CHECK 1: SYSTEM SOLVENCY
# =================================================================================================
Q1_TOTAL='SELECT count(*) FROM "Asset"'
Q1_VARIANCE='
WITH WalletSum AS (
    SELECT "assetId", SUM(total) as total_held
    FROM "Wallet"
    GROUP BY "assetId"
),
DepositSum AS (
    SELECT "assetId", SUM(amount) as total_deposited
    FROM "Deposit"
    WHERE status = '"'completed'"'
    GROUP BY "assetId"
),
WithdrawalSum AS (
    SELECT "assetId", SUM(amount) as total_withdrawn
    FROM "Withdrawal"
    WHERE status = '"'completed'"'
    GROUP BY "assetId"
)
SELECT * FROM (
    SELECT 
        a.symbol,
        COALESCE(w.total_held, 0) as wallet_total,
        (COALESCE(d.total_deposited, 0) - COALESCE(wd.total_withdrawn, 0)) as net_flow,
        (COALESCE(w.total_held, 0) - (COALESCE(d.total_deposited, 0) - COALESCE(wd.total_withdrawn, 0))) as variance
    FROM "Asset" a
    LEFT JOIN WalletSum w ON a.id = w."assetId"
    LEFT JOIN DepositSum d ON a.id = d."assetId"
    LEFT JOIN WithdrawalSum wd ON a.id = wd."assetId"
) as SolvencyCheck
WHERE variance != 0
'

run_check "1. System Solvency" "$Q1_TOTAL" "$Q1_VARIANCE"


# =================================================================================================
# CHECK 2: WALLET CONSISTENCY
# =================================================================================================
Q2_TOTAL='SELECT count(*) FROM "Wallet"'
Q2_VARIANCE='
SELECT 
    w."accountId",
    a.symbol,
    w.available,
    w.locked,
    w.total,
    (w.total - (w.available + w.locked)) as variance
FROM "Wallet" w
JOIN "Asset" a ON w."assetId" = a.id
WHERE (w.total - (w.available + w.locked)) != 0
'

run_check "2. Wallet Consistency" "$Q2_TOTAL" "$Q2_VARIANCE"


# =================================================================================================
# CHECK 3: LOCKED FUNDS AUDIT
# =================================================================================================
Q3_TOTAL='SELECT count(*) FROM "Wallet"'
Q3_VARIANCE='
WITH OrderLocks AS (
    -- Buy Orders: Lock Quote Asset
    SELECT 
        o."accountId",
        i."quoteAssetId" as "assetId",
        SUM( FLOOR( (o.quantity - o."quantityFilled") * o.price * POWER(10::numeric, qa.decimals) ) ) as locked_amount
    FROM "Order" o
    JOIN "Instrument" i ON o."instrumentId" = i.id
    JOIN "Asset" qa ON i."quoteAssetId" = qa.id
    WHERE o.side = '"'buy'"' AND o.status = '"'open'"' AND i.type = '"'spot'"'
    GROUP BY o."accountId", i."quoteAssetId"

    UNION ALL

    -- Sell Orders: Lock Base Asset
    SELECT 
        o."accountId",
        i."underlyingAssetId" as "assetId",
        SUM( FLOOR( (o.quantity - o."quantityFilled") * POWER(10::numeric, ba.decimals) ) ) as locked_amount
    FROM "Order" o
    JOIN "Instrument" i ON o."instrumentId" = i.id
    JOIN "Asset" ba ON i."underlyingAssetId" = ba.id
    WHERE o.side = '"'sell'"' AND o.status = '"'open'"' AND i.type = '"'spot'"'
    GROUP BY o."accountId", i."underlyingAssetId"
),
AggregatedLocks AS (
    SELECT "accountId", "assetId", SUM(locked_amount) as expected_locked
    FROM OrderLocks
    GROUP BY "accountId", "assetId"
)
SELECT 
    w."accountId",
    a.symbol,
    w.locked as actual_locked,
    COALESCE(al.expected_locked, 0) as expected_locked,
    (w.locked - COALESCE(al.expected_locked, 0)) as variance
FROM "Wallet" w
JOIN "Asset" a ON w."assetId" = a.id
LEFT JOIN AggregatedLocks al ON w."accountId" = al."accountId" AND w."assetId" = al."assetId"
WHERE (w.locked - COALESCE(al.expected_locked, 0)) != 0
'

run_check "3. Locked Funds Audit" "$Q3_TOTAL" "$Q3_VARIANCE"


# =================================================================================================
# CHECK 4: LEDGER INTEGRITY
# =================================================================================================
Q4_TOTAL='SELECT count(*) FROM "Wallet"'
Q4_VARIANCE='
WITH LedgerWithAsset AS (
    SELECT 
        le.amount, 
        le."accountId",
        COALESCE(d."assetId", wd."assetId", (le.meta->>'\''assetId'\'')::uuid) as "assetId"
    FROM "LedgerEntry" le
    LEFT JOIN "LedgerEvent" ev ON le."eventId" = ev.id
    LEFT JOIN "Deposit" d ON ev."referenceType" = '"'Deposit'"' AND ev."referenceId"::uuid = d.id
    LEFT JOIN "Withdrawal" wd ON ev."referenceType" = '"'Withdrawal'"' AND ev."referenceId"::uuid = wd.id
)
SELECT 
    w."accountId",
    a.symbol,
    w.total as wallet_total,
    COALESCE(SUM(lwa.amount), 0) as ledger_total,
    (w.total - COALESCE(SUM(lwa.amount), 0)) as variance
FROM "Wallet" w
JOIN "Asset" a ON w."assetId" = a.id
LEFT JOIN LedgerWithAsset lwa ON w."accountId" = lwa."accountId"::uuid AND w."assetId" = lwa."assetId"
GROUP BY w."accountId", a.symbol, w.total
HAVING (w.total - COALESCE(SUM(lwa.amount), 0)) != 0
'

run_check "4. Ledger Integrity" "$Q4_TOTAL" "$Q4_VARIANCE"


# =================================================================================================
# CHECK 5: NEGATIVE BALANCE CHECK
# =================================================================================================
Q5_TOTAL='SELECT count(*) FROM "Wallet"'
Q5_VARIANCE='
SELECT 
    w."accountId",
    a.symbol,
    w.available,
    w.locked,
    w.total
FROM "Wallet" w
JOIN "Asset" a ON w."assetId" = a.id
WHERE w.available < 0 OR w.locked < 0 OR w.total < 0
'

run_check "5. Negative Balance Check" "$Q5_TOTAL" "$Q5_VARIANCE"


# =================================================================================================
# CHECK 6: ORDER INTEGRITY
# =================================================================================================
Q6_TOTAL='SELECT count(*) FROM "Order"'
Q6_VARIANCE='
SELECT 
    o.id,
    i.symbol,
    o.quantity,
    o."quantityFilled"
FROM "Order" o
JOIN "Instrument" i ON o."instrumentId" = i.id
WHERE o."quantityFilled" < 0 OR o."quantityFilled" > o.quantity
'

run_check "6. Order Integrity" "$Q6_TOTAL" "$Q6_VARIANCE"


# =================================================================================================
# CHECK 7: ORDER-FILL RECONCILIATION
# =================================================================================================
Q7_TOTAL='SELECT count(*) FROM "Order" WHERE "quantityFilled" > 0'
Q7_VARIANCE='
WITH OrderFills AS (
    SELECT "orderId", SUM(quantity) as total_filled
    FROM "Fill"
    GROUP BY "orderId"
)
SELECT 
    o.id,
    o."quantityFilled",
    COALESCE(of.total_filled, 0) as actual_filled,
    (o."quantityFilled" - COALESCE(of.total_filled, 0)) as variance
FROM "Order" o
LEFT JOIN OrderFills of ON o.id = of."orderId"
WHERE o."quantityFilled" > 0 AND (o."quantityFilled" - COALESCE(of.total_filled, 0)) != 0
'

run_check "7. Order-Fill Reconciliation" "$Q7_TOTAL" "$Q7_VARIANCE"


# =================================================================================================
# CHECK 8: FEE COLLECTION AUDIT
# =================================================================================================
# Assuming fees are collected in USD for now or converted. 
# Simplified check: Ensure Fee Account Balance >= Sum of Fees Collected.
# A strict equality check is hard without knowing exactly when fees are swept or if they are in multiple currencies.
# Let's check per currency.
Q8_TOTAL='SELECT count(*) FROM "Fill" WHERE fee > 0'
Q8_VARIANCE='
WITH FeeSum AS (
    SELECT "feeCurrency", SUM(fee) as total_fees
    FROM "Fill"
    GROUP BY "feeCurrency"
),
FeeAccount AS (
    SELECT a.symbol, w.total
    FROM "Wallet" w
    JOIN "Account" acc ON w."accountId" = acc.id
    JOIN "Asset" a ON w."assetId" = a.id
    WHERE acc.type = '"'fees'"'
)
SELECT 
    fs."feeCurrency",
    fs.total_fees,
    COALESCE(fa.total, 0) as fee_account_balance,
    (COALESCE(fa.total, 0) - fs.total_fees) as variance
FROM FeeSum fs
LEFT JOIN FeeAccount fa ON fs."feeCurrency" = fa.symbol
WHERE (COALESCE(fa.total, 0) - fs.total_fees) < 0
'
# Note: Variance < 0 means we collected more fees than we have in the fee account (money missing).
# Variance > 0 is acceptable if the fee account was pre-seeded or has other funds.

run_check "8. Fee Collection Audit" "$Q8_TOTAL" "$Q8_VARIANCE"


# =================================================================================================
# CHECK 9: TRADE SETTLEMENT AUDIT
# =================================================================================================
# Verifies that for every Trade, there are corresponding LedgerEntries.
# This is complex because a Trade generates multiple Ledger Entries (Buyer Debit Quote, Buyer Credit Base, Seller Credit Quote, Seller Debit Base, Fees).
# We will simplify by checking that the Count of LedgerEvents of type 'trade' matches the Count of Trades * 2 (or similar factor).
# Or better: Find Trades that do NOT have a corresponding LedgerEvent.

Q9_TOTAL='SELECT count(*) FROM "Trade"'
Q9_VARIANCE='
SELECT t.id
FROM "Trade" t
LEFT JOIN "LedgerEvent" le ON t.id::text = le."referenceId" AND le."referenceType" = '"'Trade'"'
WHERE le.id IS NULL
'

run_check "9. Trade Settlement Audit" "$Q9_TOTAL" "$Q9_VARIANCE"


echo "---------------------------------------------------------------------------------------------------"
if [ "$EXIT_CODE" -eq "0" ]; then
    echo "✅  ALL CHECKS PASSED"
else
    echo "🚫  AUDIT FAILED"
fi

exit $EXIT_CODE
