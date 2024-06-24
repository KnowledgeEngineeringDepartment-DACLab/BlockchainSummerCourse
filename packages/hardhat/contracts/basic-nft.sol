// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasicNft is ERC721, Ownable {
    constructor() ERC721("MyToken", "MTK") Ownable() {}

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}