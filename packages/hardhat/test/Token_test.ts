import { ethers } from "hardhat";
import {MyToken} from "../typechain-types/contracts/ERC20.sol";
import { expect } from "chai";

describe("🚩 Challenge 4: ERC20", function () {
  let mytoken: MyToken;

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const [owner] = await ethers.getSigners();
      const MyTokenFactory = await ethers.getContractFactory("MyToken");
      mytoken = (await MyTokenFactory.deploy()) as MyToken;
      console.log("\t", " 🛰  Contract deployed on", await mytoken.getAddress());
    });
    it("Should set the right owner", async function () {
      const [owner,addr1] = await ethers.getSigners();
      expect(await mytoken.owner()).to.equal(owner.address);
    });
    it("Should mint tokens successfully", async function () {
      const [owner] = await ethers.getSigners();
      expect(await mytoken.balanceOf(owner.address)).to.equal(0);

      const mintAmount = BigInt(1000) * BigInt(10) ** BigInt(18); 
      await mytoken.mint(owner.address, mintAmount.toString());

      expect(await mytoken.balanceOf(owner.address)).to.equal(mintAmount.toString());
    });
    it("Should fail to mint if not called by the owner", async function () {
      const [owner,addr1] = await ethers.getSigners();
      const mintAmount = BigInt(1000) * BigInt(10) ** BigInt(18);
      await expect(mytoken.connect(addr1).mint(addr1.address, mintAmount))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
 
});
