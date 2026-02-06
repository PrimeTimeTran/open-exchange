export const ledgerEventEnumerators = {
  type: {
    trade: 'trade',
    deposit: 'deposit',
    withdrawal: 'withdrawal',
    fee: 'fee',
    settlement: 'settlement',
    adjustment: 'adjustment',
    transfer: 'transfer',
    reversal: 'reversal',
  },

  referenceType: {
    deposit: 'deposit',
    withdrawal: 'withdrawal',
    order: 'order',
    trade: 'trade',
    manual_adjustment: 'manual_adjustment',
  },

  status: {
    pending: 'pending',
    posted: 'posted',
    reversed: 'reversed',
  },
};
