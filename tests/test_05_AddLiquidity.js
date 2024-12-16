const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { getCurrentUnixTimestampSec, convertUnixTimestampToDataString } = require("../scripts/tools/timeHelper");
const { getRandomInt } = require("../scripts/tools/mathHelper");
const { BigNumber } = require("ethers");
const { printAllValue, printPairAllValue } = require("./caller_Fundraising");

const util = require("util");
const wait = util.promisify(setTimeout);

describe(" ", function () {
  logger.info(`这里就不依赖锁仓期的数据，直接测试"给用户发币，向自定义交易所，添加流动性"`);

  // 获取全局配置
  let contractParams;

  let allSigners;
  let adminSigner;
  let buyerSigner;

  let contractMockPayCoin;
  let contractOfferingCoin;
  let contractMockExchangeFactory;
  let contractMockExchangeRouter;
  let contractMockExchangePair;

  before(async function () {
    allSigners = await ethers.getSigners();
    adminSigner = allSigners[0];
    buyerSigner = allSigners[1];

    contractParams = loadContractParams();

    logger.info(`获取"模拟支付代币合约"实例：`);
    contractMockPayCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockPayCoin_ContractName"]), loadABI(contractParams["mockPayCoin_ContractName"]), adminSigner);

    logger.info(`获取"新发行代币合约"实例：`);
    contractOfferingCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["offeringCoin_ContractName"]), loadABI(contractParams["offeringCoin_ContractName"]), adminSigner);        

    logger.info(`获取"模拟交易所工厂合约"实例：`);
    contractMockExchangeFactory = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockExchangeFactory_ContractName"]), loadABI(contractParams["mockExchangeFactory_ContractName"]), buyerSigner);        

    logger.info(`获取"模拟交易所路由合约"实例：`);
    contractMockExchangeRouter = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockExchangeRouter_ContractName"]), loadABI(contractParams["mockExchangeRouter_ContractName"]), buyerSigner);

    logger.info(`获取"模拟交易所交易对合约"实例：`);
    let addressMockExchangePair = await contractMockExchangeFactory.getPair(contractMockPayCoin.address, contractOfferingCoin.address);
    contractMockExchangePair = new hre.ethers.Contract(addressMockExchangePair, loadABI(contractParams["mockExchangePair_ContractName"]), buyerSigner);
    logger.info(`contractMockExchangePair.address = ${contractMockExchangePair.address}`);

    await wait(1200);

    logger.info(`准备：为用户投放"模拟支付代币"和"新发行代币"`);

    const decimalsMockPayCoin = await contractMockPayCoin.decimals();
    let mintAmountMockPayCoin = BigInt(getRandomInt(500, 1000) * 10 ** decimalsMockPayCoin);
    // 直接铸造"模拟代币，给用户"
    await contractMockPayCoin.mint(buyerSigner.address, mintAmountMockPayCoin);
    await wait(1000);

    let mintAmountOfferingCoin = BigInt(mintAmountMockPayCoin) * BigInt(contractParams["fundraising_PublicsaleRate"]);
    // 直接转账"新发行代币，给用户"
    await contractOfferingCoin.transfer(buyerSigner.address, mintAmountOfferingCoin);
    await wait(1000);
  });

  it("", async function () {
    console.log(``);
    await printPairAllValue(contractMockExchangePair, allSigners);
  });

//   it("", async function () {
//     console.log(``);
//     await releaseTokens(contractFundraising);
//     await printAllValue(contractFundraising, contractMockPayCoin, contractOfferingCoin, contractOfferingCoinLocker, buyerSigner);
//   });
});

/*
    npx hardhat test tests/test_05_AddLiquidity.js --network localHardhat
*/
