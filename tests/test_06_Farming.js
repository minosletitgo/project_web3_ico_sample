const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { getCurrentUnixTimestampSec, convertUnixTimestampToDataString } = require("../scripts/tools/timeHelper");
const { getRandomInt } = require("../scripts/tools/mathHelper");
const { printBlockData } = require("../scripts/tools/timeHelper");
const { BigNumber } = require("ethers");
const { executeBlockRunner, printAllValue, printPairAllValue, printFarmingAllValue } = require("./caller_Fundraising");

const util = require("util");
const wait = util.promisify(setTimeout);

describe(" ", function () {
  logger.info(`用户向农场合约质押"lp凭证代币""`);

  // 获取全局配置
  let contractParams;

  let allSigners;
  let adminSigner;
  let buyerSigner;

  let contractBlockRunner;

  let currentBlock;

  let contractMockPayCoin;
  let contractOfferingCoin;

  let contractMockExchangeFactory;
  let contractMockExchangePair;
  let contractFarming;  

  let mintAmountMockPayCoin;
  let mintAmountOfferingCoin

  before(async function () {
    allSigners = await ethers.getSigners();
    adminSigner = allSigners[0];
    buyerSigner = allSigners[1];

    contractParams = loadContractParams();

    logger.info(`获取"区块步数模拟器"实例：`);
    contractBlockRunner = new hre.ethers.Contract(readSavedContractAddress(contractParams["blockRunner_ContractName"]), loadABI(contractParams["blockRunner_ContractName"]), adminSigner);

    logger.info(`获取"模拟支付代币合约"实例：`);
    contractMockPayCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockPayCoin_ContractName"]), loadABI(contractParams["mockPayCoin_ContractName"]), adminSigner);

    logger.info(`获取"新发行代币合约"实例：`);
    contractOfferingCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["offeringCoin_ContractName"]), loadABI(contractParams["offeringCoin_ContractName"]), adminSigner);        

    logger.info(`获取"模拟交易所工厂合约"实例：`);
    contractMockExchangeFactory = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockExchangeFactory_ContractName"]), loadABI(contractParams["mockExchangeFactory_ContractName"]), buyerSigner);        

    logger.info(`获取"模拟交易所交易对合约"实例：`);
    let addressMockExchangePair = await contractMockExchangeFactory.getPair(contractOfferingCoin.address, contractMockPayCoin.address);
    contractMockExchangePair = new hre.ethers.Contract(addressMockExchangePair, loadABI(contractParams["mockExchangePair_ContractName"]), buyerSigner);
    logger.info(`contractMockExchangePair.address = ${contractMockExchangePair.address}`);
    let lpTokenAmount = await contractMockExchangePair.balanceOf(buyerSigner.address);
    logger.info(`lpTokenAmount = ${lpTokenAmount}`);

    logger.info(`获取"农场合约"实例：`);
    contractFarming = new hre.ethers.Contract(readSavedContractAddress(contractParams["farming_ContractName"]), loadABI(contractParams["farming_ContractName"]), buyerSigner);

    await wait(1000);
  });

  it("", async function () {
    console.log(``);

    currentBlock = await printBlockData();

    await wait(1000);
    await printFarmingAllValue(contractFarming, 0, allSigners);

    let lpTokenAmount = await contractMockExchangePair.balanceOf(buyerSigner.address);
    logger.info(`用户，持有的凭证代币，当前额度：( ${lpTokenAmount} )`);

    let lpTokenAmountForFarming = parseInt(lpTokenAmount / 5);
    if (lpTokenAmountForFarming > 0) {
      
      logger.info(`用户，向"农场合约"授予凭证代币，额度：( ${lpTokenAmountForFarming })`);
      await contractMockExchangePair.approve(contractFarming.address, lpTokenAmountForFarming);
      
      await wait(1000);
  
      logger.info(`用户，向"农场合约"存入凭证代币，额度：( ${lpTokenAmountForFarming} )`);
      await contractFarming.deposit(0, lpTokenAmountForFarming);
  
      await wait(1000);
      await printFarmingAllValue(contractFarming, 0, allSigners);
    }
  });

  it("", async function () {
    console.log(``);

    printBlockData();

    await executeBlockRunner(contractBlockRunner, 10);

    printBlockData();

    await printFarmingAllValue(contractFarming, 0, allSigners);
  });  
});

/*
    需要先使用 
    npx hardhat test tests/test_05_AddLiquidity.js --network localHardhat

    npx hardhat test tests/test_06_Farming.js --network localHardhat
*/
