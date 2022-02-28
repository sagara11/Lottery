// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract Lottery is VRFConsumerBaseV2 {
    address payable[] public players;
    uint256 public usdEntryFee;
    AggregatorV3Interface internal ethUsdPriceFeed;
    enum LOTTERY_STATE {
        OPEN, //0
        CLOSED, //1
        CALCULATING_WINNER //2
    }
    LOTTERY_STATE public lottery_state;

    // config parameters
    VRFCoordinatorV2Interface COORDINATOR;
    LinkTokenInterface LINKTOKEN;
    uint64 s_subscriptionId = 559;
    uint32 callbackGasLimit = 1000000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 2;
    bytes32 public keyhash;
    uint256 public fee;

    uint256[] public s_randomWords; 
    uint256 public s_requestId;
    address s_owner;

    address payable public reccentWinners;
    event requestRandomWords(uint256 s_requestId);

    constructor(
        address _priceFeedAddress,
        address _vrfCoordinator,
        address _link,
        bytes32 _keyhash
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        LINKTOKEN = LinkTokenInterface(_link);
        usdEntryFee = 50;
        ethUsdPriceFeed = AggregatorV3Interface(_priceFeedAddress);
        lottery_state = LOTTERY_STATE.CLOSED;
        keyhash = _keyhash;
        s_owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }

    function enter() public payable {
        // 50$ minimum
        require(lottery_state == LOTTERY_STATE.OPEN, "lottery is not opened");
        require(msg.value >= getEntranceFee(), "Not enough ETH to join");
        players.push(payable(msg.sender));
    }

    function getEntranceFee() public view returns (uint256) {
        // minimum 50 USD
        (, int256 answer, , , ) = ethUsdPriceFeed.latestRoundData();
        uint256 adjustedPrice = uint256(answer) * 10**10; //18 decimal
        // $50, 1ETH / 4000$
        // 50/2000
        // 50*100000/2000
        uint256 costToEnter = (usdEntryFee * 10**18) / adjustedPrice;
        return costToEnter;
    }

    function startLottery() public onlyOwner {
        require(
            lottery_state == LOTTERY_STATE.CLOSED,
            "Lottery has already started"
        );
        lottery_state = LOTTERY_STATE.OPEN;
    }

    function endLottery() public onlyOwner {
        lottery_state = LOTTERY_STATE.CALCULATING_WINNER;
        s_requestId = COORDINATOR.requestRandomWords(
            keyhash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        emit requestRandomWords(s_requestId);
    }

    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        require(
            lottery_state == LOTTERY_STATE.CALCULATING_WINNER,
            "You aren't there yet!"
        );
        require(randomWords[0] > 0, "random-not-found");
        uint256 indexOfWinner = randomWords[0] % players.length;
        reccentWinners = players[indexOfWinner];
        reccentWinners.transfer(address(this).balance);
        // Reset
        players = new address payable[](0);
        lottery_state = LOTTERY_STATE.CLOSED;
        s_randomWords = randomWords;
    }
}
