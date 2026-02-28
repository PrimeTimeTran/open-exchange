'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  OptionLeg,
  OrderPanel,
} from '@/components/widgets/options-chain/OrderPanel';
import { v4 as uuidv4 } from 'uuid';

interface OrderTicketContextType {
  isOpen: boolean;
  legs: OptionLeg[];
  addLeg: (
    side: 'buy' | 'sell',
    type: 'call' | 'put',
    strike: number,
    price: number,
    expiry: string,
  ) => void;
  removeLeg: (id: string) => void;
  updateLeg: (id: string, updates: Partial<OptionLeg>) => void;
  closeTicket: () => void;
  openTicket: () => void;
}

const OrderTicketContext = createContext<OrderTicketContextType | undefined>(
  undefined,
);

export function OrderTicketProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [legs, setLegs] = useState<OptionLeg[]>([]);

  // Auto-close ticket when legs are empty
  React.useEffect(() => {
    if (legs.length === 0) {
      setIsOpen(false);
    }
  }, [legs]);

  const addLeg = (
    side: 'buy' | 'sell',
    type: 'call' | 'put',
    strike: number,
    price: number,
    expiry: string,
  ) => {
    setLegs((prev) => {
      const existingLeg = prev.find(
        (l) =>
          l.side === side &&
          l.type === type &&
          l.strike === strike &&
          l.expiry === expiry,
      );

      if (existingLeg) {
        return prev.filter((l) => l.id !== existingLeg.id);
      } else {
        const newLeg: OptionLeg = {
          id: Math.random().toString(36).substr(2, 9),
          side,
          quantity: 1,
          expiry,
          strike,
          type,
          price,
        };
        setIsOpen(true);
        return [...prev, newLeg];
      }
    });
  };

  const removeLeg = (id: string) => {
    setLegs((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLeg = (id: string, updates: Partial<OptionLeg>) => {
    setLegs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    );
  };

  const closeTicket = () => {
    setIsOpen(false);
    setLegs([]);
  };
  const openTicket = () => setIsOpen(true);

  return (
    <OrderTicketContext.Provider
      value={{
        isOpen,
        legs,
        addLeg,
        removeLeg,
        updateLeg,
        closeTicket,
        openTicket,
      }}
    >
      {children}
      <OrderPanel
        isOpen={isOpen}
        onClose={closeTicket}
        legs={legs}
        onRemoveLeg={removeLeg}
        onUpdateLeg={updateLeg}
      />
    </OrderTicketContext.Provider>
  );
}

export function useOrderTicket() {
  const context = useContext(OrderTicketContext);
  if (context === undefined) {
    throw new Error(
      'useOrderTicket must be used within an OrderTicketProvider',
    );
  }
  return context;
}
