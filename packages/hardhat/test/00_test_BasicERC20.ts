import { ethers } from "hardhat";
import { expect } from "chai";
import { BasicERC20 } from "../typechain-types"; // Adjust the import path based on your setup

describe("🚩 Challenge 1.1 : Create a Basic ERC20 contract", function () {
  let basicERC20: BasicERC20;

  describe("Deployment", function () {
    const contractAddress = process.env.CONTRACT_ADDRESS;

    let contractArtifact: string;
    if (contractAddress) {
      // For the autograder.
      contractArtifact = `contracts/download-${contractAddress}.sol:YourContract`;
    } else {
      contractArtifact = "contracts/BasicERC20.sol:BasicERC20";
    }

    it("Should deploy the contract", async function () {
      const [init] = await ethers.getSigners();
      const basicERC20Factory = await ethers.getContractFactory(contractArtifact, init);
      basicERC20 = (await basicERC20Factory.deploy()) as BasicERC20;
      console.log("\t", " 🛰  Contract deployed on", await basicERC20.getAddress());
    });
  });

  describe("It should have basic ERC20 functions", function () {
    it("Should transfer tokens", async function () {
      // Get the signers
      const [init, receiver] = await ethers.getSigners();
      // Get the decimals of the token
      const decimals = await basicERC20.decimals();
      // Calculate the amount to be transferred considering the decimals
      const amount = BigInt(1000) * BigInt(10) ** BigInt(decimals);
      // Get the balance of the receiver
      let balance = await basicERC20.balanceOf(receiver.address);
      // Transfer tokens from owner to receiver
      await basicERC20.connect(init).transfer(receiver.address, amount);

      // Log the balance for debugging purposes
      balance = await basicERC20.balanceOf(receiver.address);
      // Check if the balance of the receiver is equal to the transferred amount
      expect(balance).to.equal(amount);
    });
    it("Should approve, transerFrom", async function () {
      // Get the signers
      const [init, receiver] = await ethers.getSigners();
      // Get the decimals of the token
      const decimals = await basicERC20.decimals();
      // Calculate the amount to be transferred considering the decimals
      const amount = BigInt(1000) * BigInt(10) ** BigInt(decimals);
      // Approve tokens from owner to receiver
      await basicERC20.approve(receiver.address, amount);
      // Check if the allowance is equal to the transferred amount
      const allowance = await basicERC20.allowance(init.address, receiver.address);
      expect(allowance).to.equal(amount);
      await basicERC20.connect(receiver).transferFrom(init.address, receiver.address, amount);
    });
    it("Should increase allowance", async function () {
      const [init, receiver] = await ethers.getSigners();
      const decimals = await basicERC20.decimals();
      const amount = BigInt(1000) * BigInt(10) ** BigInt(decimals);

      // Increase allowance
      await basicERC20.connect(init).increaseAllowance(receiver.address, amount);
      const allowance = await basicERC20.allowance(init.address, receiver.address);
      expect(allowance).to.equal(amount);
    });

    it("Should decrease allowance", async function () {
      const [init, receiver] = await ethers.getSigners();
      const decimals = await basicERC20.decimals();
      const amount = BigInt(1000) * BigInt(10) ** BigInt(decimals);
      // Approve tokens first
      await basicERC20.connect(init).approve(receiver.address, amount);
      // Decrease allowance
      await basicERC20.connect(init).decreaseAllowance(receiver.address, amount);
      const allowance = await basicERC20.allowance(init.address, receiver.address);
      expect(allowance).to.equal(BigInt(0));
    });
  });
});
