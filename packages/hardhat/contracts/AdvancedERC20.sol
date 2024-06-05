//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract AdvancedERC20 is ERC20, ERC20Burnable, ERC20Pausable, Ownable{
    uint256 public constant MAX_SUPPLY = 1000000 * 10 ** 18;
    constructor(address initialOwner)
        ERC20("Advenced ERC20", "AERC20")
        Ownable()
    {
        // _mint(initialOwner, 100000 * 10 ** decimals());
    }
    
    // Mint function to mint tokens
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "ERC20: total supply exceeds MAX_SUPPLY");
        _mint(to, amount);
    }

    // Override the _beforeTokenTransfer function to handle pausable functionality
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
    //override the pause function to add onlyOwner modifier
    function pause() public onlyOwner {
        _pause();
    }
    //override the unpause function to add onlyOwner modifier
    function unpause() public onlyOwner {
        _unpause();
    }

}
