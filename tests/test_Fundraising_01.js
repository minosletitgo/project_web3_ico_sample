const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { getCurrentUnixTimestampSec, convertUnixTimestampToDataString } = require("../scripts/tools/timeHelper");
const { printRatio } = require("../scripts/tools/mathHelper");
const { BigNumber } = require("ethers");
const { printAllValue, buyToken } = require("./caller_Fundraising");

describe(" ", function () {
  logger.info(`等待售卖期开始后，测试"用户购买行为"`);

  // 获取全局配置
  const contractParams = loadContractParams();

  let adminSigner;
  let buyerSigner;
  let contractFundraising;
  let contractMockPayCoin;
  let contractOfferingCoin;
  let buyerAllAmount = 0;
  let buyAmount = BigInt(1 * 10 ** contractParams["mockPayCoin_Decimals"]);
  
  before(async function () {
    const signers = await ethers.getSigners();
    adminSigner = signers[0];
    buyerSigner = signers[3];

    logger.info(`获取"筹款合约"示例：`);
    contractFundraising = new hre.ethers.Contract(readSavedContractAddress(contractParams["fundraising_ContractName"]), loadABI(contractParams["fundraising_ContractName"]), buyerSigner);

    logger.info(`获取"模拟支付代币合约"示例：`);
    contractMockPayCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockPayCoin_ContractName"]), loadABI(contractParams["mockPayCoin_ContractName"]), buyerSigner);

    logger.info(`获取"新发行代币合约"示例：`);
    contractOfferingCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["offeringCoin_ContractName"]), loadABI(contractParams["offeringCoin_ContractName"]), buyerSigner);        

    buyerAllAmount = await contractMockPayCoin.balanceOf(buyerSigner.address);
    logger.info(`"用户"持有的"模拟支付代币"总额是: ${buyerAllAmount}`);
    buyAmount = buyerAllAmount;
    logger.info(`"用户"授权"筹款合约"，足额(${buyAmount})的"模拟支付代币"`);
    await contractMockPayCoin.approve(contractFundraising.address, buyAmount);
  });

  it("", async function () {
    console.log(``);
    await printAllValue(contractFundraising, contractMockPayCoin, contractOfferingCoin, buyerSigner);
  });

  it("", async function () {
    console.log(``);
    console.log(`用户 花费${buyAmount}"模拟支付代币" 去购买"发行新代币"`);
    await buyToken(contractFundraising, buyAmount);
    await printAllValue(contractFundraising, contractMockPayCoin, contractOfferingCoin, buyerSigner);
  });
});

/*
    npx hardhat test tests/test_Fundraising_01.js --network localHardhat
*/
