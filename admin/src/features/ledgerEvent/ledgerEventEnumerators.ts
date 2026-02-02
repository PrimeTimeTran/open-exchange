export const ledgerEventEnumerators = {
  type: {
    trade: 'trade',
    deposit: 'deposit',
    withdrawal: 'withdrawal',
    fee: 'fee',
    settlement: 'settlement',
    adjustment: 'adjustment',
  },

  referenceType: {
    order: 'order',
    trade: 'trade',
    blockchain_tx: 'blockchain_tx',
    admin_action: 'admin_action',
  },
};
