// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AdvanceNft is ERC721, ERC721URIStorage, Ownable {
    string private constant URI = "https://red-flying-lynx-578.mypinata.cloud/ipfs/QmazZBEU3WFhi82koPghdAKe4bfQA2aNsQKT3pVp6eh2GA?_gl=1*1tkahws*_ga*MTcyNDU4MTA5LjE2OTAxOTM3MzY.*_ga_5RMPXG14TE*MTY5MjI3NzE0MC43LjEuMTY5MjI3OTg2Ny42MC4wLjA.";
    mapping(address => bool) private hasMinted;

    constructor() ERC721("MyToken", "MTK") {}

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        require(!hasMinted[to], "Each address can only mint once.");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, URI);
        hasMinted[to] = true;
    }

    // Override required by Solidity to prevent transfers
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721)
    {
        require(from == address(0), "Transfers are disabled");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
