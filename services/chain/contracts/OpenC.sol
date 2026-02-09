// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OPENC is ERC20, Ownable {
    address public treasury;
    VestingWallet public teamVesting;
    VestingWallet public rewardsVesting;

    uint256 public constant TOTAL_SUPPLY = 100_000_000 * 10**18;

    constructor(
        address _treasury,
        address _team,
        address _rewards,
        uint64 _teamStart,
        uint64 _teamDuration,
        uint64 _rewardsStart,
        uint64 _rewardsDuration
    ) ERC20("Open Coin", "OPENC") {
        // Save treasury address
        treasury = _treasury;

        // Mint total supply to this contract temporarily
        _mint(address(this), TOTAL_SUPPLY);

        // Calculate allocations
        uint256 treasuryAmount = (TOTAL_SUPPLY * 50) / 100; // 50%
        uint256 teamAmount = (TOTAL_SUPPLY * 25) / 100;     // 25%
        uint256 rewardsAmount = (TOTAL_SUPPLY * 25) / 100;  // 25%

        // 1️⃣ Treasury: immediate transfer
        _transfer(address(this), treasury, treasuryAmount);

        // 2️⃣ Team Vesting
        teamVesting = new VestingWallet(_team, _teamStart, _teamDuration);
        _transfer(address(this), address(teamVesting), teamAmount);

        // 3️⃣ Rewards Vesting
        rewardsVesting = new VestingWallet(_rewards, _rewardsStart, _rewardsDuration);
        _transfer(address(this), address(rewardsVesting), rewardsAmount);
    }

    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays must be same length");

        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
}
