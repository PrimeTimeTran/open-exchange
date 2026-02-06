import React from 'react';

interface AssetAboutProps {
  symbol: string;
}

export function AssetAbout({ symbol }: AssetAboutProps) {
  return (
    <div className="space-y-4 pt-4">
      <h2 className="text-2xl font-bold">About {symbol}</h2>
      <p className="text-muted-foreground leading-relaxed">
        This is a placeholder description for {symbol}. In a real application,
        this would fetch data about the company or asset, including its sector,
        description, CEO, headquarters, and other fundamental data.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase">
            CEO
          </div>
          <div className="font-medium">Jane Doe</div>
        </div>
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase">
            Market Cap
          </div>
          <div className="font-medium">$2.4T</div>
        </div>
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase">
            P/E Ratio
          </div>
          <div className="font-medium">32.5</div>
        </div>
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase">
            Dividend Yield
          </div>
          <div className="font-medium">0.54%</div>
        </div>
      </div>
    </div>
  );
}
