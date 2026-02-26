// Domain layer: Pure business logic, types, and traits.
// Independent of frameworks (Tonic, SQLx) where possible.

pub mod accounts;
pub mod assets;
pub mod borrow;
pub mod corporate_actions;
pub mod deposits;
pub mod exercise;
pub mod fees;
pub mod fills;
pub mod funding;
pub mod instruments;
pub mod ledger;
pub mod liquidation;
pub mod margin;
pub mod orders;
pub mod position_limits;
pub mod settlement;
pub mod trade;
pub mod transaction;
pub mod users;
pub mod wallets;
pub mod withdrawals;
