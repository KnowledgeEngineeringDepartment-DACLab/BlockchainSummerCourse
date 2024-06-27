import { ethers } from "hardhat";
import { expect } from "chai";
import { Dex } from "../typechain-types/contracts/Dex.sol";
import {MyToken} from "../typechain-types/contracts/ERC20.sol";

describe("Dex Contract", function () {
  let dex: Dex;
  let mytoken: MyToken;

  beforeEach(async function () {
    const [owner, addr1] = await ethers.getSigners();
    const MyTokenFactory = await ethers.getContractFactory("MyToken");
    mytoken = (await MyTokenFactory.deploy()) as MyToken;

    const Dex = await ethers.getContractFactory("Dex");
    dex = await Dex.deploy(mytoken.getAddress()) as Dex;
  });

  describe("Deployment", function () {
    
    it("Should set the right owner", async function () {
      const [owner, addr1] = await ethers.getSigners();

      expect(await dex.owner()).to.equal(owner.address);
    });
  });

  describe("Liquidity Operations", function () {
    it("Should add liquidity correctly", async function () {
      const [owner] = await ethers.getSigners();
  
      const oneEtherInWei = BigInt("1000000000000000000");
      const tokenAmount = 500;
      const ethAmount = oneEtherInWei;
  
      await mytoken.connect(owner).approve(dex.getAddress(), tokenAmount);
      await mytoken.connect(owner).mint(owner.address, tokenAmount);
      await dex.connect(owner).addLiquidity(tokenAmount, { value: oneEtherInWei });
      expect(await dex.tokenReserve()).to.equal(tokenAmount);
      expect(await dex.ethReserve()).to.equal(1);
      
    });
  
    it("Should remove liquidity correctly", async function () {
      const [owner] = await ethers.getSigners();

      const oneEtherInWei = BigInt("1000000000000000000"); 
      const tokenAmount = 500;
      await mytoken.connect(owner).mint(owner.address, tokenAmount);

      await  mytoken.connect(owner).approve(dex.getAddress(), tokenAmount);
      await dex.connect(owner).addLiquidity(tokenAmount, { value: oneEtherInWei });
      await dex.connect(owner).removeLiquidity(tokenAmount,  1 );

      expect(await dex.tokenReserve()).to.equal(0);
      expect(await dex.ethReserve()).to.equal(0); 
    });
  });

 describe("Token Swaps", function () {
  it("Should allow addr1 to swap ETH for Tokens and then swap back to ETH", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const oneEtherInWei = BigInt("1000000000000000000"); 
    const twoEtherInWei = oneEtherInWei * BigInt(2);
    const halfEtherInWei = oneEtherInWei / BigInt(2);

    await mytoken.connect(owner).approve(dex.getAddress(), 1000);
    await mytoken.connect(owner).mint(owner.address, 1000);

    await dex.connect(owner).addLiquidity(1000, { value: twoEtherInWei });
    
    await dex.connect(addr1).swapEthForTokens({ value: oneEtherInWei });
    const tokensReceived = await dex.getAmountOut(1, 2, 1000, 2000); 
    expect(await mytoken.balanceOf(addr1.address)).to.equal(tokensReceived);

    await mytoken.connect(addr1).approve(dex.getAddress(), tokensReceived);
    await dex.connect(addr1).swapTokensForEth(tokensReceived);


    expect(await mytoken.balanceOf(addr1.address)).to.equal(0);
  });
});

  
});
