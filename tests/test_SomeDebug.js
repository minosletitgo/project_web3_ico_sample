const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { convertUnixTimestampToDataString, printBlockData } = require("../scripts/tools/timeHelper");

const util = require("util");
const wait = util.promisify(setTimeout);

describe(" ", function () {  
  let adminSigner;
  const contractParams = loadContractParams();

  let contractOfferingCoin;
  let contractMockPayCoin;
  let contractMockExchangeRouter;

  let currentBlock;

  before(async function () {
    const allSigners = await ethers.getSigners();
    adminSigner = allSigners[0];

    contractOfferingCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["offeringCoin_ContractName"]), loadABI(contractParams["offeringCoin_ContractName"]), adminSigner);
    contractMockPayCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockPayCoin_ContractName"]), loadABI(contractParams["mockPayCoin_ContractName"]), adminSigner);
    contractMockExchangeRouter = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockExchangeRouter_ContractName"]), loadABI(contractParams["mockExchangeRouter_ContractName"]), adminSigner);

    await wait(1000);
    currentBlock = await printBlockData();
  });

  it(" ", async function () {
    logger.info(`准备：使用"模拟交易所路由"添加流动性(即，首次会创建交易对)`);
    let amountTokenA_OnCreate = BigInt(contractParams["mockExchange_Pair_TokenA_CreateAmount"]) * BigInt(10 ** contractParams["offeringCoin_Decimals"]);
    let amountTokenB_OnCreate = BigInt(contractParams["mockExchange_Pair_TokenB_CreateAmount"]) * BigInt(10 ** contractParams["mockPayCoin_Decimals"]);
    logger.info(`amountTokenA_OnCreate = ${amountTokenA_OnCreate}`);
    logger.info(`amountTokenB_OnCreate = ${amountTokenB_OnCreate}`);
    logger.info(`currentBlock.timestamp = ${currentBlock.timestamp}`);
    await contractMockExchangeRouter.addLiquidity(
      contractOfferingCoin.address,
      contractMockPayCoin.address,
      amountTokenA_OnCreate,
      amountTokenB_OnCreate,
      1,
      1,
      adminSigner.address,
      currentBlock.timestamp + 10000
    );
  });
});

/*
    npx hardhat test tests/test_SomeDebug.js --network localHardhat
*/
