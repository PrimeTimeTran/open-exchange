CREATE TABLE IF NOT EXISTS fills (
    id UUID PRIMARY KEY,
    trade_id UUID NOT NULL,
    order_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    instrument_id UUID NOT NULL,
    price DECIMAL(72, 18) NOT NULL,
    quantity DECIMAL(72, 18) NOT NULL,
    fee DECIMAL(72, 18) NOT NULL,
    fee_currency VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL, -- maker/taker
    side VARCHAR(20) NOT NULL, -- buy/sell
    meta JSONB,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_fills_instrument_created_at ON fills(instrument_id, created_at);
