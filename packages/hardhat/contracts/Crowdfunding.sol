//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
    * @title Crowdfunding
 * @author jotaro
 */

contract Crowdfunding {
    // Mapping to store contributions
    mapping(address => uint256) public contributions;

    // State variables for the owner, funding goal, deadline, and flags
    address public owner;
    uint256 public goal;
    uint256 public deadline;
    bool public goalReached;
    bool public fundsWithdrawn;

    // Events for contributions, goal reached, and withdrawals
    event Contribution(address indexed contributor, uint256 amount);
    event GoalReached(uint256 totalAmount);
    event Withdrawal(address indexed owner, uint256 amount);

    // Constructor to initialize the contract with a goal and duration
    constructor(uint256 _goal, uint256 _duration) {
        owner = msg.sender;
        goal = _goal;
        deadline = block.timestamp + _duration;
        goalReached = false;
        fundsWithdrawn = false;
    }

    // Modifier to check if the caller is the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Function to contribute to the crowdfunding campaign
    function contribute() public payable {
        require(block.timestamp < deadline, "Deadline has passed");
        require(fundsWithdrawn == false, "Funds have been withdrawn, no more contributions allowed");
        contributions[msg.sender] += msg.value;
        emit Contribution(msg.sender, msg.value);

        // Check if the funding goal has been reached
        if (address(this).balance >= goal && !goalReached) {
            goalReached = true;
            emit GoalReached(address(this).balance);
        }
    }

    // Function for the owner to withdraw funds if the goal is reached
    function withdrawFunds() public onlyOwner {
        require(goalReached, "Goal not reached");
        require(!fundsWithdrawn, "Funds already withdrawn");

        fundsWithdrawn = true;
        uint256 amount = address(this).balance;
        payable(owner).transfer(amount);
        emit Withdrawal(owner, amount);
    }

    // Function for contributors to withdraw their contributions if the goal is not reached
    function withdrawContribution() public {
        require(block.timestamp >= deadline, "Deadline not yet passed");
        require(!goalReached, "Goal was reached");

        uint256 amount = contributions[msg.sender];
        require(amount > 0, "No contributions to withdraw");

        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // View function to return the time left before the deadline
    function timeLeft() public view returns (uint256) {
        if (block.timestamp >= deadline) {
            return 0;
        }
        return deadline - block.timestamp;
    }

    // Receive function to handle direct ether transfers and call contribute
    receive() external payable {
        contribute();
    }
}