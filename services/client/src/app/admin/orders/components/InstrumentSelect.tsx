'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent } from 'react';

export function InstrumentSelect({
  instruments,
  defaultValue,
}: {
  instruments: { id: string; symbol: string }[];
  defaultValue: string;
}) {
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    const params = new URLSearchParams(window.location.search);
    params.set('instrument_id', newValue);
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      name="instrument_id"
      defaultValue={defaultValue}
      className="border border-input bg-background p-2 rounded w-64 text-foreground"
      onChange={handleChange}
    >
      {instruments.length > 0 ? (
        instruments.map((i) => (
          <option key={i.id} value={i.symbol}>
            {i.symbol.replace(/_/g, '-')}
          </option>
        ))
      ) : (
        <>
          <option value="BTC-USD">BTC-USD</option>
          <option value="ETH-USD">ETH-USD</option>
          <option value="AAPL-USD">AAPL-USD</option>
        </>
      )}
    </select>
  );
}
