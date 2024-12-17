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
const { printAllValue, printPairAllValue, addLiquidity } = require("./caller_Fundraising");

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
  let contractMockPayCoin_Buyer;
  let contractOfferingCoin;
  let contractOfferingCoin_Buyer;
  let contractMockExchangeFactory;
  let contractMockExchangeRouter;
  let contractMockExchangePair;

  let mintAmountMockPayCoin;
  let mintAmountOfferingCoin

  let currentBlock;

  before(async function () {
    allSigners = await ethers.getSigners();
    adminSigner = allSigners[0];
    buyerSigner = allSigners[1];

    contractParams = loadContractParams();

    logger.info(`获取"模拟支付代币合约"实例：`);
    contractMockPayCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockPayCoin_ContractName"]), loadABI(contractParams["mockPayCoin_ContractName"]), adminSigner);
    contractMockPayCoin_Buyer = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockPayCoin_ContractName"]), loadABI(contractParams["mockPayCoin_ContractName"]), buyerSigner);

    logger.info(`获取"新发行代币合约"实例：`);
    contractOfferingCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["offeringCoin_ContractName"]), loadABI(contractParams["offeringCoin_ContractName"]), adminSigner);        
    contractOfferingCoin_Buyer = new hre.ethers.Contract(readSavedContractAddress(contractParams["offeringCoin_ContractName"]), loadABI(contractParams["offeringCoin_ContractName"]), buyerSigner);

    logger.info(`获取"模拟交易所工厂合约"实例：`);
    contractMockExchangeFactory = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockExchangeFactory_ContractName"]), loadABI(contractParams["mockExchangeFactory_ContractName"]), buyerSigner);        

    logger.info(`获取"模拟交易所路由合约"实例：`);
    contractMockExchangeRouter = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockExchangeRouter_ContractName"]), loadABI(contractParams["mockExchangeRouter_ContractName"]), buyerSigner);

    logger.info(`获取"模拟交易所交易对合约"实例：`);
    let addressMockExchangePair = await contractMockExchangeFactory.getPair(contractOfferingCoin.address, contractMockPayCoin.address);
    contractMockExchangePair = new hre.ethers.Contract(addressMockExchangePair, loadABI(contractParams["mockExchangePair_ContractName"]), buyerSigner);
    logger.info(`contractMockExchangePair.address = ${contractMockExchangePair.address}`);

    await wait(1200);

    mintAmountMockPayCoin = BigInt(getRandomInt(100, 1000) * 10 ** contractParams["mockPayCoin_Decimals"]);
    //mintAmountMockPayCoin = 1000;
    logger.info(`准备：管理员为用户投放"模拟支付代币(${mintAmountMockPayCoin})"`);
    await contractMockPayCoin.mint(buyerSigner.address, mintAmountMockPayCoin);

    await wait(1000);

    logger.info(`用户账户，有"模拟支付代币"的余额是(${await contractMockPayCoin_Buyer.balanceOf(buyerSigner.address)})`);
    logger.info(`准备：用户授予"交易所路由合约"一定的"模拟支付代币"额度(${mintAmountMockPayCoin})`);
    await contractMockPayCoin_Buyer.approve(contractMockExchangeRouter.address, mintAmountMockPayCoin);

    mintAmountOfferingCoin = BigInt(mintAmountMockPayCoin) * BigInt(contractParams["fundraising_PublicsaleRate"]) * BigInt(10 ** (contractParams["offeringCoin_Decimals"] - contractParams["mockPayCoin_Decimals"]));
    logger.info(`准备：管理员为用户投放"新发行代币(${mintAmountOfferingCoin})(在模拟代币的量级上，乘以相应比例)"`);    
    logger.info(`管理员账户，有"新发行代币"的余额是(${await contractOfferingCoin.balanceOf(adminSigner.address)})`);
    await contractOfferingCoin.transfer(buyerSigner.address, mintAmountOfferingCoin);

    await wait(1000);

    logger.info(`用户账户，有"新发行代币"的余额是(${await contractOfferingCoin_Buyer.balanceOf(buyerSigner.address)})`);
    logger.info(`准备：用户授予"交易所路由合约"一定的"新发行代币"额度(${mintAmountOfferingCoin})`);    
    await contractOfferingCoin_Buyer.approve(contractMockExchangeRouter.address, mintAmountOfferingCoin);

    await wait(1000);
  });

  it("", async function () {
    console.log(``);
    await printPairAllValue(contractMockExchangePair, allSigners);
  });

  it("", async function () {
    console.log(``);

    currentBlock = await printBlockData();

    await addLiquidity(contractMockExchangeRouter, 
      contractOfferingCoin.address, contractMockPayCoin.address,
      mintAmountOfferingCoin, mintAmountMockPayCoin,
      buyerSigner, currentBlock.timestamp + 10
    );
    await printPairAllValue(contractMockExchangePair, allSigners);
  });
});

/*
    npx hardhat test tests/test_05_AddLiquidity.js --network localHardhat
*/
