import { ethers } from "hardhat";
import { expect } from "chai";
import { AdvancedERC20 } from "../typechain-types"; // Adjust the import path based on your setup
import { ZeroAddress } from "ethers";

describe("🚩 Challenge 1.2 : Create an Advanced ERC20 contract", function () {
  let advancedERC20: AdvancedERC20;

  describe("Deployment", function () {
    const contractAddress = process.env.CONTRACT_ADDRESS;

    let contractArtifact: string;
    if (contractAddress) {
      // For the autograder.
      contractArtifact = `contracts/download-${contractAddress}.sol:YourContract`;
    } else {
      contractArtifact = "contracts/AdvancedERC20.sol:AdvancedERC20";
    }

    it("Should deploy the contract", async function () {
      const [owner] = await ethers.getSigners();
      const advancedERC20Factory = await ethers.getContractFactory(contractArtifact, owner);
      advancedERC20 = (await advancedERC20Factory.deploy(owner.address)) as AdvancedERC20;
      console.log("\t", " 🛰  Contract deployed on", await advancedERC20.getAddress());
    });
  });

  describe("It should have advanced ERC20 functions", function () {
    it("Should mint new tokens", async function () {
      const [owner] = await ethers.getSigners();
      const decimals = await advancedERC20.decimals();
      const amount = BigInt(500) * BigInt(10) ** BigInt(decimals);

      // Mint new tokens to the receiver's address
      await advancedERC20.connect(owner).mint(owner, amount);
      const balance = await advancedERC20.balanceOf(owner.address);
      expect(balance).to.equal(amount);
    });

    it("Should burn tokens", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const decimals = await advancedERC20.decimals();
      const amount = BigInt(300) * BigInt(10) ** BigInt(decimals);

      // Mint some tokens to the receiver for burning
      await advancedERC20.connect(owner).mint(receiver.address, amount);

      // Burn tokens from the receiver
      await advancedERC20.connect(receiver).burn(amount);

      const balance = await advancedERC20.balanceOf(receiver.address);

      expect(balance).to.equal(BigInt(0));
    });

    it("Should pause and unpause the contract", async function () {
      const [owner, receiver] = await ethers.getSigners();
      const decimals = await advancedERC20.decimals();
      const amount = BigInt(300) * BigInt(10) ** BigInt(decimals);

      // Pause the contract
      await advancedERC20.connect(owner).pause();
      await expect(advancedERC20.connect(owner).transfer(receiver.address, amount)).to.be.revertedWith(
        "ERC20Pausable: token transfer while paused",
      );

      // Unpause the contract
      await advancedERC20.connect(owner).unpause();
      await advancedERC20.connect(owner).transfer(receiver.address, amount);
      const balance = await advancedERC20.balanceOf(receiver.address);
      expect(balance).to.equal(amount);
    });
    it("Should transfer & renounce ownership", async function () {
      const [owner, receiver] = await ethers.getSigners();

      // Transfer ownership
      await advancedERC20.connect(owner).transferOwnership(receiver.address);
      await expect(advancedERC20.connect(owner).pause()).to.be.revertedWith("Ownable: caller is not the owner");

      // Check if the new owner can pause the contract
      await advancedERC20.connect(receiver).pause();
      expect(await advancedERC20.paused()).to.equal(true);
      await advancedERC20.connect(receiver).unpause();

      // Renounce ownership
      await advancedERC20.connect(receiver).renounceOwnership();
      expect(await advancedERC20.owner()).to.be.equal(ZeroAddress);
    });
  });
});
