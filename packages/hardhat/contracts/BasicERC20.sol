//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)


contract BasicERC20 is ERC20 {
    constructor() ERC20("Basic ERC20", "BERC20") {
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));
    }
}