// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);
    function transfer(address recipient, uint amount) external returns (bool);
    function balanceOf(address account) external view returns (uint);
}

contract YourContract {
    IERC20 public token;
    uint public tokenReserve;
    uint public ethReserve;
    uint public k;
    constructor(address _token) {
        token = IERC20(_token);
    }

    // Function to add liquidity to the pool
    function addLiquidity(uint _tokenAmount) public payable {
        uint ethAmount = msg.value;
        if (tokenReserve > 0 && ethReserve > 0) {
            require(ethAmount * tokenReserve == _tokenAmount * ethReserve, "Invalid ratio");
        }
        token.transferFrom(msg.sender, address(this), _tokenAmount);
        tokenReserve += _tokenAmount;
        ethReserve += ethAmount;
        k = tokenReserve * ethReserve;
    }

    // Function to remove liquidity from the pool
    function removeLiquidity(uint _tokenAmount, uint _ethAmount) public {
        require(_tokenAmount <= tokenReserve && _ethAmount <= ethReserve, "Not enough liquidity");
        token.transfer(msg.sender, _tokenAmount);
        payable(msg.sender).transfer(_ethAmount);
        tokenReserve -= _tokenAmount;
        ethReserve -= _ethAmount;
    }

    // Function to swap ETH for Tokens
    function swapEthForTokens() public payable {
        uint ethAmount = msg.value;
        uint tokenAmount = getAmountOut(ethAmount, ethReserve, tokenReserve, k);
        require(token.transfer(msg.sender, tokenAmount), "Failed to transfer tokens");
        ethReserve += ethAmount;
        tokenReserve -= tokenAmount;
    }

    // Function to swap Tokens for ETH
    function swapTokensForEth(uint _tokenAmount) public {
        uint ethAmount = getAmountOut(_tokenAmount, tokenReserve, ethReserve, k);
        token.transferFrom(msg.sender, address(this), _tokenAmount);
        payable(msg.sender).transfer(ethAmount);
        tokenReserve += _tokenAmount;
        ethReserve -= ethAmount;
    }

    // Function to calculate output amount using x * y = k
    function getAmountOut(uint inputAmount, uint inputReserve, uint outputReserve, uint total) public pure returns (uint) {
        require(inputAmount > 0, "Invalid input amount");
        require(inputReserve > 0 && outputReserve > 0, "Invalid reserves");
        uint NewInputToken = inputAmount + inputReserve;
        uint NewOutputToken = total / NewInputToken;
        return outputReserve - NewOutputToken;
    }
}
