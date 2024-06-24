import { ethers } from "hardhat";
import { BasicNft } from "../typechain-types/contracts/basic-nft.sol"; // Update the import path to include the specific file that exports BasicNft
import { expect } from "chai";

describe("🚩 BasicNft: ", function () {
  let basicNft: BasicNft;

  describe("Deployment", function () {
    const contractAddress = process.env.CONTRACT_ADDRESS;

    let contractArtifact: string;
    if (contractAddress) {
      // For the autograder.
      contractArtifact = `contracts/download-${contractAddress}.sol:YourContract`;
    } else {
      contractArtifact = "contracts/basic-nft.sol:BasicNft";
    }

    it("Should deploy the contract", async function () {
      const [init] = await ethers.getSigners();
      const basicERC721Factory = await ethers.getContractFactory(contractArtifact, init);
      basicNft = (await basicERC721Factory.deploy()) as BasicNft;
      console.log("\t", " 🛰  Contract deployed on", await basicNft.getAddress());
    });
    it("Owner should be the deployer", async function () {
      const [owner] = await ethers.getSigners();
      expect(await basicNft.owner()).to.equal(owner.address);
    });
  });
  describe("Minting and Transfer Restrictions", function () {
    it("Owner should be able to mint", async function () {
      const [owner] = await ethers.getSigners();
      await basicNft.safeMint(owner.address, 1);
      expect(await basicNft.ownerOf(1)).to.equal(owner.address);
    });
  });

});

