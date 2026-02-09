// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OPENC
 * @dev ERC20 token with fixed supply, vesting allocations, and batch transfer support
 */
contract OPENC is ERC20, Ownable {
    // -----------------------------
    // Wallets / allocations
    // -----------------------------
    address public deployerWallet;   // Super admin
    address public treasuryWallet;   // 50% of supply
    address public liquidityWallet;  // 5% of supply
    address public operationsWallet; // 5% of supply

    VestingWallet public teamVesting;     // 25% of supply
    VestingWallet public rewardsVesting;  // 15% of supply

    uint256 public constant TOTAL_SUPPLY = 100_000_000 * 10**18;

    constructor(
        address _deployer,
        address _treasury,
        address _team,
        address _rewards,
        address _liquidity,
        address _operations,
        uint64 _teamStart,
        uint64 _teamDuration,
        uint64 _rewardsStart,
        uint64 _rewardsDuration
    ) ERC20("Open Coin", "OPENC") Ownable(_deployer) {
        // Save wallets
        deployerWallet = _deployer;
        treasuryWallet = _treasury;
        liquidityWallet = _liquidity;
        operationsWallet = _operations;

        // Mint all tokens to this contract temporarily
        _mint(address(this), TOTAL_SUPPLY);

        // Allocation amounts
        uint256 treasuryAmount = (TOTAL_SUPPLY * 50) / 100;
        uint256 teamAmount = (TOTAL_SUPPLY * 25) / 100;
        uint256 rewardsAmount = (TOTAL_SUPPLY * 15) / 100;
        uint256 liquidityAmount = (TOTAL_SUPPLY * 5) / 100;
        uint256 operationsAmount = (TOTAL_SUPPLY * 5) / 100;

        // Transfer allocations
        _transfer(address(this), treasuryWallet, treasuryAmount);
        teamVesting = new VestingWallet(_team, _teamStart, _teamDuration);
        _transfer(address(this), address(teamVesting), teamAmount);

        rewardsVesting = new VestingWallet(_rewards, _rewardsStart, _rewardsDuration);
        _transfer(address(this), address(rewardsVesting), rewardsAmount);

        _transfer(address(this), liquidityWallet, liquidityAmount);
        _transfer(address(this), operationsWallet, operationsAmount);

        _transfer(address(this), deployerWallet, 0); // optional, keep deployer as admin
    }

    /**
     * @notice Batch transfer tokens from owner to multiple addresses
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays must be same length");
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
}
