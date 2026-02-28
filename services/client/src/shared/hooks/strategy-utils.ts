import { OptionLeg } from '@/components/widgets/options-chain/OrderPanel';

export function getStrategyName(legs: OptionLeg[]): string {
  if (legs.length === 0) return 'New Order';

  if (legs.length === 1) {
    const leg = legs[0];
    return `${leg.side === 'buy' ? 'Long' : 'Short'} ${leg.type === 'call' ? 'Call' : 'Put'}`;
  }

  if (legs.length === 2) {
    const longLeg = legs.find((l) => l.side === 'buy');
    const shortLeg = legs.find((l) => l.side === 'sell');

    if (longLeg && shortLeg) {
      // One Long, One Short
      if (longLeg.expiry === shortLeg.expiry) {
        // Same Expiry -> Vertical or Synthetic
        if (longLeg.type === shortLeg.type) {
          // Vertical Spread
          const type = longLeg.type === 'call' ? 'Call' : 'Put';
          let spreadType = '';

          if (type === 'Call') {
            if (longLeg.strike < shortLeg.strike) spreadType = 'Debit Spread';
            else spreadType = 'Credit Spread';
          } else {
            if (longLeg.strike > shortLeg.strike) spreadType = 'Debit Spread';
            else spreadType = 'Credit Spread';
          }
          return `${type} ${spreadType}`;
        }
        // Different Types (Call + Put) -> Synthetic/Reversal (Not fully mapped yet)
        return 'Custom 2-Leg';
      } else {
        // Different Expiry -> Time Spread
        if (
          longLeg.type === shortLeg.type &&
          longLeg.strike === shortLeg.strike
        ) {
          return `${longLeg.type === 'call' ? 'Call' : 'Put'} Calendar Spread`;
        } else if (longLeg.type === shortLeg.type) {
          return `${longLeg.type === 'call' ? 'Call' : 'Put'} Diagonal Spread`;
        }
      }
    } else {
      // Both Long or Both Short
      const calls = legs.filter((l) => l.type === 'call');
      const puts = legs.filter((l) => l.type === 'put');

      if (legs.every((l) => l.side === 'buy')) {
        if (calls.length === 1 && puts.length === 1) {
          if (calls[0].strike === puts[0].strike) return 'Long Straddle';
          else return 'Long Strangle';
        }
      } else if (legs.every((l) => l.side === 'sell')) {
        if (calls.length === 1 && puts.length === 1) {
          if (calls[0].strike === puts[0].strike) return 'Short Straddle';
          else return 'Short Strangle';
        }
      }
    }
    return 'Custom 2-Leg';
  }

  if (legs.length === 4) {
    const calls = legs.filter((l) => l.type === 'call');
    const puts = legs.filter((l) => l.type === 'put');

    if (calls.length === 2 && puts.length === 2) {
      const allSameExpiry = legs.every((l) => l.expiry === legs[0].expiry);
      if (allSameExpiry) {
        return 'Iron Condor';
      }
    }
  }

  return `${legs.length}-Leg Custom`;
}
