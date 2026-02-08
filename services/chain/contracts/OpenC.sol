// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OPENC is ERC20 {
    constructor() ERC20("Open Coin", "OPENC") {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}
