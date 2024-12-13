const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { getCurrentUnixTimestampSec, convertUnixTimestampToDataString } = require("../scripts/tools/timeHelper");
const { printRatio } = require("../scripts/tools/mathHelper");
const { BigNumber } = require("ethers");
const { printAllValue, releaseTokens } = require("./caller_Fundraising");

describe(" ", function () {
  logger.info(`等待售卖期开始后，测试"管理员提款行为"`);

  // 获取全局配置
  const contractParams = loadContractParams();

  let adminSigner;
  let buyerSigner;

  let contractMockPayCoin;
  let contractOfferingCoin;
  let contractOfferingCoinLocker;
  let contractFundraising;

  before(async function () {
    const signers = await ethers.getSigners();
    adminSigner = signers[0];
    buyerSigner = signers[1];

    logger.info(`获取"模拟支付代币合约"实例：`);
    contractMockPayCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockPayCoin_ContractName"]), loadABI(contractParams["mockPayCoin_ContractName"]), buyerSigner);

    logger.info(`获取"新发行代币合约"实例：`);
    contractOfferingCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["offeringCoin_ContractName"]), loadABI(contractParams["offeringCoin_ContractName"]), buyerSigner);        

    logger.info(`获取"锁仓合约"实例：`);
    contractOfferingCoinLocker = new hre.ethers.Contract(readSavedContractAddress(contractParams["offeringCoinLocker_ContractName"]), loadABI(contractParams["offeringCoinLocker_ContractName"]), buyerSigner);        

    logger.info(`获取"筹款合约"实例：`);
    contractFundraising = new hre.ethers.Contract(readSavedContractAddress(contractParams["fundraising_ContractName"]), loadABI(contractParams["fundraising_ContractName"]), buyerSigner);
  });

  it("", async function () {
    console.log(``);
    await printAllValue(contractFundraising, contractMockPayCoin, contractOfferingCoin, contractOfferingCoinLocker, buyerSigner);
  });

  it("", async function () {
    console.log(``);
    await releaseTokens(contractFundraising);
    await printAllValue(contractFundraising, contractMockPayCoin, contractOfferingCoin, contractOfferingCoinLocker, buyerSigner);
  });
});

/*
    npx hardhat test tests/test_Fundraising_05.js --network localHardhat
*/
