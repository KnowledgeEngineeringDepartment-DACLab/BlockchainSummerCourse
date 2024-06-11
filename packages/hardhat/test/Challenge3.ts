//
// This script executes when you run 'yarn test'
//

import { ethers } from "hardhat";
import { Crowdfunding } from "../typechain-types/Crowdfunding";
import { expect } from "chai";

describe("🚩 Challenge 3: Crowdfunding Contract Exercise", function () {
  let crowdfunding: Crowdfunding;
  let owner: any;
  let addr1: any;
  let addr2: any;

  const goal = ethers.parseEther("10"); // 10 ETH goal
  const duration = 7 * 24 * 60 * 60; // 7 days

  describe("Deployment", function () {
    const contractAddress = process.env.CONTRACT_ADDRESS;

    // Don't change contractArtifact creation
    let contractArtifact: string;
    if (contractAddress) {
      // For the autograder.
      contractArtifact = `contracts/download-${contractAddress}.sol:Crowdfunding`;
    } else {
      contractArtifact = "contracts/Crowdfunding.sol:Crowdfunding";
    }

    beforeEach(async function () {
      [owner, addr1, addr2] = await ethers.getSigners();
      const crowdfundingFactory = await ethers.getContractFactory(contractArtifact);
      crowdfunding = (await crowdfundingFactory.deploy(goal, duration)) as Crowdfunding;
      console.log("\t", " 🛰  Contract deployed on", await crowdfunding.getAddress());
    });

    it("Should deploy the contract", async function () {
      expect(await crowdfunding.goal()).to.equal(goal);
      expect(await crowdfunding.deadline()).to.be.greaterThan(0);
    });
  });

  describe("Crowdfunding functionality", function () {
    beforeEach(async function () {
      [owner, addr1, addr2] = await ethers.getSigners();
      const CrowdfundingFactory = await ethers.getContractFactory("Crowdfunding");
      crowdfunding = (await CrowdfundingFactory.deploy(goal, duration)) as Crowdfunding;
    });

    it("Should deploy with correct goal and duration", async function () {
      expect(await crowdfunding.goal()).to.equal(goal);
      expect(await crowdfunding.deadline()).to.be.greaterThan(0);
    });

    it("Should accept contributions and update balance", async function () {
      await crowdfunding.connect(addr1).contribute({ value: ethers.parseEther("1") });
      expect(await crowdfunding.contributions(addr1.getAddress())).to.equal(ethers.parseEther("1"));
    });

    it("Should mark goal as reached if contributions exceed the goal", async function () {
      await crowdfunding.connect(addr1).contribute({ value: ethers.parseEther("5") });
      await crowdfunding.connect(addr2).contribute({ value: ethers.parseEther("6") });
      expect(await crowdfunding.goalReached()).to.equal(true);
    });

    it("Should allow the owner to withdraw funds if goal is reached", async function () {
      await crowdfunding.connect(addr1).contribute({ value: ethers.parseEther("10") });
      expect(await crowdfunding.goalReached()).to.equal(true);

      const initialOwnerBalance = await ethers.provider.getBalance(owner.getAddress());
      const tx = await crowdfunding.connect(owner).withdrawFunds();
      await tx.wait();

      const finalOwnerBalance = await ethers.provider.getBalance(owner.getAddress());
      expect(finalOwnerBalance).to.be.greaterThan(initialOwnerBalance);
      expect(await ethers.provider.getBalance(crowdfunding.getAddress())).to.equal(0);
    });

    it("Should allow contributors to withdraw contributions if goal is not reached after deadline", async function () {
      await crowdfunding.connect(addr1).contribute({ value: ethers.parseEther("1") });

      // Fast-forward time to after the deadline
      await ethers.provider.send("evm_increaseTime", [duration + 1]);
      await ethers.provider.send("evm_mine", []);

      expect(await crowdfunding.goalReached()).to.equal(false);

      const initialAddr1Balance = await ethers.provider.getBalance(addr1.getAddress());
      const tx = await crowdfunding.connect(addr1).withdrawContribution();
      await tx.wait();

      const finalAddr1Balance = await ethers.provider.getBalance(addr1.getAddress());
      expect(finalAddr1Balance).to.be.greaterThan(initialAddr1Balance);
      expect(await crowdfunding.contributions(addr1.getAddress())).to.equal(0);
    });

    it("Should return correct time left before the deadline", async function () {
      const timeLeft = await crowdfunding.timeLeft();
      expect(timeLeft).to.be.greaterThan(0);
    });

    it("Should return zero time left after the deadline", async function () {
      // Fast-forward time to after the deadline
      await ethers.provider.send("evm_increaseTime", [duration + 1]);
      await ethers.provider.send("evm_mine", []);

      const timeLeft = await crowdfunding.timeLeft();
      expect(timeLeft).to.equal(0);
    });
  });
});
