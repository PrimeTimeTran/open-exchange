import { useState, useMemo } from 'react';
import { OptionLeg } from '@/components/widgets/options-chain/OrderPanel';
import { getStrategyName } from './strategy-utils';

interface OrderCalculation {
  totalCost: number;
  isCredit: boolean;
  breakeven: number;
  collateral: number;
  buyingPower: number;
  strategyName: string;
  regulatoryFee: number;
  maxLoss: number | string;
  maxProfit: number | string;
}

export function useOrderCalculations(legs: OptionLeg[]) {
  const [quantity, setQuantity] = useState(1);
  // Default limit price based on mid price of legs (mock logic)
  const [limitPrice, setLimitPrice] = useState(0);

  // Recalculate limit price when legs change
  useMemo(() => {
    if (legs.length === 0) {
      setLimitPrice(0);
      return;
    }
    // Simple mock: sum of leg prices
    const initialPrice = legs.reduce((acc, leg) => {
      // Sell = Credit (+), Buy = Debit (-)
      // But typically limit price is expressed as positive value and user selects debit/credit
      // For this mock, let's just sum absolute values for a starting point
      return acc + leg.price;
    }, 0);
    setLimitPrice(parseFloat(initialPrice.toFixed(2)));
  }, [legs]);

  const calculations: OrderCalculation = useMemo(() => {
    // 1. Calculate Net Cost/Credit per unit (Limit Price usually represents this)
    // Real logic would check if it's a debit or credit spread based on market data
    // For now, we assume the user-set limitPrice * quantity is the total impact

    // Determine if it's naturally a credit or debit strategy based on leg sides
    // Sell > Buy = Credit
    const rawCost = legs.reduce((acc, leg) => {
      return acc + (leg.side === 'sell' ? 1 : -1) * leg.price;
    }, 0);

    const isCreditStrategy = rawCost > 0;

    // Total transaction value
    const totalValue = limitPrice * 100 * quantity;

    // 2. Max Profit / Loss (Mock Logic)
    let maxProfit: number | string = 'Unlimited';
    let maxLoss: number | string = 'Unlimited';
    let collateral = 0;

    if (legs.length === 1) {
      if (legs[0].side === 'buy') {
        // Long Call/Put
        maxProfit = 'Unlimited'; // Technically Put is capped at strike, but "Unlimited" is common shorthand
        maxLoss = totalValue; // Can only lose what you paid
        collateral = totalValue;
      } else {
        // Short Call/Put
        maxProfit = totalValue; // Can only gain premium
        maxLoss = 'Unlimited'; // Naked short
        collateral = legs[0].strike * 100 * quantity * 0.2; // Rough margin calc
      }
    } else {
      // Multi-leg mock
      if (isCreditStrategy) {
        maxProfit = totalValue;
        maxLoss = totalValue * 2; // Arbitrary mock
        collateral = totalValue * 3;
      } else {
        maxProfit = totalValue * 3;
        maxLoss = totalValue;
        collateral = totalValue;
      }
    }

    // 3. Breakeven
    // Mock: Strike +/- premium
    const baseStrike = legs.length > 0 ? legs[0].strike : 0;
    const breakeven = baseStrike + (isCreditStrategy ? -1 : 1) * limitPrice;

    // 4. Strategy Name Detection
    const strategyName = getStrategyName(legs);

    return {
      maxLoss,
      maxProfit,
      breakeven,
      collateral,
      strategyName,
      regulatoryFee: 0.04,
      buyingPower: 6722.82,
      totalCost: totalValue,
      isCredit: isCreditStrategy,
    };
  }, [legs, quantity, limitPrice]);

  return {
    quantity,
    setQuantity,
    limitPrice,
    setLimitPrice,
    calculations,
  };
}
