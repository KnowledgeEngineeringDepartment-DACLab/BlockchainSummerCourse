import { ethers } from "hardhat";
import { AdvanceNft } from "../typechain-types/contracts/advance-nft.sol"; // Update the import path to include the specific file that exports AdvanceNft
import { expect } from "chai";

describe("🚩 AdvanceNft: Non-Transferable and Single Mint NFTs", function () {
  let advanceNft: AdvanceNft;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  let contractArtifact: string;
  if (contractAddress) {
    // For the autograder.
    contractArtifact = `contracts/download-${contractAddress}.sol:YourContract`;
  } else {
    contractArtifact = "contracts/advance-nft.sol:AdvanceNft";
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const [init] = await ethers.getSigners();
      const basicERC721Factory = await ethers.getContractFactory(contractArtifact, init);
      advanceNft = (await basicERC721Factory.deploy()) as AdvanceNft;
  
      console.log("\t", " 🛰  Contract deployed on", advanceNft.getAddress());
    });

    it("Owner should be the deployer", async function () {
      const [owner] = await ethers.getSigners();
      expect(await advanceNft.owner()).to.equal(owner.address);
    });
  });

  describe("Minting and Transfer Restrictions", function () {
    it("Owner should be able to mint exactly once", async function () {
      const [owner] = await ethers.getSigners();
      await advanceNft.safeMint(owner.address, 1);
      expect(await advanceNft.ownerOf(1)).to.equal(owner.address);
      await expect(advanceNft.safeMint(owner.address, 2)).to.be.revertedWith("Each address can only mint once.");
    });

    it("Should prevent non-owners from minting", async function () {
      const [owner, addr1] = await ethers.getSigners();
      await expect(advanceNft.connect(addr1).safeMint(addr1.address, 3)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent any transfers", async function () {
      const [owner, addr1] = await ethers.getSigners();
      await expect(advanceNft.transferFrom(owner.address, addr1.address, 1)).to.be.revertedWith("Transfers are disabled");
    });
  });
});
