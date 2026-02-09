// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/OpenC.sol";

contract OpenCTest is Test {
    OPENC token;
    address treasury = address(0x1);
    address team = address(0x2);
    address rewards = address(0x3);

    function setUp() public {
        token = new OPENC(treasury, team, rewards);
    }

    function testInitialBalances() public {
        assertEq(token.balanceOf(treasury), 50_000_000 * 1e18);
        assertEq(token.balanceOf(team), 25_000_000 * 1e18);
        assertEq(token.balanceOf(rewards), 25_000_000 * 1e18);
    }
}
