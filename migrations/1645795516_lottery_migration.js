const Lottery = artifacts.require("Lottery");
const MockAggregator = artifacts.require("test/MockAggregator");
const VRFCoordinatorV2Mock = artifacts.require("test/VRFCoordinatorV2Mock");

const vrfCoordinator = "0x6168499c0cffcacd319c818142124b7a15e857ab";
const link = "0x01be23585060835e02b77ef475b0cc51aa1e0709";
const keyHash =
  "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";
PRICE_FEED = 233700000000;
BASE_FEE = 10000;
GAS_PRICE_LINK = 100;

const deploy_function = async (deployer, network) => {
  // Use deployer to state migration tasks.
  if (network == "rinkeby" || network == "rinkeby-fork") {
    console.log("Deploying....");
    price_feed_address = "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e";
    await deployer.deploy(
      Lottery,
      price_feed_address,
      vrfCoordinator,
      link,
      keyHash
    );
    console.log("Deployed....!");
  } else {
    console.log("Deploying MockAggregator");
    await deployer.deploy(MockAggregator);
    const MockAggregatorInstance = await MockAggregator.deployed();
    MockAggregatorInstance.setLatestAnswer(PRICE_FEED);
    price_feed_address = MockAggregatorInstance.address;
    console.log("Deployed MockAggregator");

    console.log("Deploying VRFCoordinatorV2Mock");
    await deployer.deploy(VRFCoordinatorV2Mock, BASE_FEE, GAS_PRICE_LINK);
    const VRFCoordinatorV2MockInstance = await VRFCoordinatorV2Mock.deployed();
    VRF_Address = VRFCoordinatorV2MockInstance.address;
    console.log("Deployed VRFCoordinatorV2Mock");

    console.log("Deploying Lottery");
    await deployer.deploy(
      Lottery,
      price_feed_address,
      VRF_Address,
      link,
      keyHash
    );
    const LotteryInstance = await Lottery.deployed();
    console.log("Deployed Lottery");
    console.log(`Address of the Lottery is ${LotteryInstance.address}`);
  }
};

module.exports = deploy_function;
