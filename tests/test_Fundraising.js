const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { getCurrentUnixTimestampSec, convertUnixTimestampToDataString } = require("../scripts/tools/timeHelper");
const { BigNumber } = require("ethers");

describe(" ", function () {
  // 获取全局配置
  const contractParams = loadContractParams();

  let adminSigner;
  let buyerSigner;
  let contractFundraising;
  let contractOfferingCoin;
  let approveOfferingCoin = BigInt(contractParams["offeringCoin_TotalSupplyValue"]) * BigInt(10 ** contractParams["offeringCoin_Decimals"]);
  let contractMockPayCoin;
  let buyAmount = BigInt(3 * 10 ** contractParams["mockPayCoin_Decimals"]);
  
  before(async function () {
    const signers = await ethers.getSigners();
    adminSigner = signers[0];
    buyerSigner = signers[1];

    logger.info(`获取"筹款合约"示例：`);
    contractFundraising = new hre.ethers.Contract(readSavedContractAddress(contractParams["fundraising_ContractName"]), loadABI(contractParams["fundraising_ContractName"]), buyerSigner);

    logger.info(`"资金管理员"授权"筹款合约"，足额(供应量那么多:${approveOfferingCoin})的"新发行代币"：`);
    contractOfferingCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["offeringCoin_ContractName"]), loadABI(contractParams["offeringCoin_ContractName"]), adminSigner);        
    await contractOfferingCoin.approve(contractFundraising.address, approveOfferingCoin);

    logger.info(`"用户"授权"筹款合约"，足额(${buyAmount})的"模拟支付代币"`);
    contractMockPayCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockPayCoin_ContractName"]), loadABI(contractParams["mockPayCoin_ContractName"]), buyerSigner);
    await contractMockPayCoin.approve(contractFundraising.address, buyAmount);
  });

  it("", async function () {
    console.log(``);
    await printAllValue(contractFundraising);
  });

  it("", async function () {
    console.log(``);
    console.log(`buyToken amount = ${buyAmount}`);
    // await buyToken(contractFundraising, buyerSigner, buyAmount);
    // await printAllValue(contractFundraising);
  });
});

async function printAllValue(contractFundraising) {
  logger.info(`查询合约的常规数据`);
  let _presaleStartTimeStamp = await contractFundraising._presaleStartTimeStamp();
  let _publicsaleStartTimeStamp = _presaleStartTimeStamp.add(await contractFundraising._presaleDurationSeconds());
  let _lockTokenStartTimeStamp = _publicsaleStartTimeStamp.add(await contractFundraising._publicsaleDurationSeconds());
  let _EndStartTimeStamp = _lockTokenStartTimeStamp.add(await contractFundraising._lockTokenDurationSeconds());

  logger.info(`_owner -> ${await contractFundraising._owner()}`);
  logger.info(`_ownerOfTokenOffering -> ${await contractFundraising._ownerOfTokenOffering()}`);
  logger.info(`_tokenMockPayCoin -> ${await contractFundraising._tokenMockPayCoin()}`);
  logger.info(`_tokenOffering -> ${await contractFundraising._tokenOffering()}`);
  logger.info(`_softCap -> ${await contractFundraising._softCap()}`);
  logger.info(`_hardCap -> ${await contractFundraising._hardCap()}`);
  logger.info(`_presaleRate -> ${await contractFundraising._presaleRate()}`);
  logger.info(`_publicSaleRate -> ${await contractFundraising._publicSaleRate()}`);
  logger.info(` -> ${convertUnixTimestampToDataString(getCurrentUnixTimestampSec())} -> localNowTimeStamp`);
  logger.info(` -> ${convertUnixTimestampToDataString(_presaleStartTimeStamp)} -> _presaleStartTimeStamp`);
  logger.info(` -> ${convertUnixTimestampToDataString(_publicsaleStartTimeStamp)} -> _publicsaleStartTimeStamp`);
  logger.info(` -> ${convertUnixTimestampToDataString(_lockTokenStartTimeStamp)} -> _lockTokenStartTimeStamp`);
  logger.info(` -> ${convertUnixTimestampToDataString(_EndStartTimeStamp)} -> _EndStartTimeStamp`);
  logger.info(`_raisedAmount -> ${await contractFundraising._raisedAmount()}`);
  logger.info(`getSaleState -> ${await contractFundraising.getSaleState()}`);
  logger.info(`getBalanceOfMockPayCoin -> ${await contractFundraising.getBalanceOfMockPayCoin()}`);
  logger.info(`getOfferingCoinAllowance -> ${await contractFundraising.getOfferingCoinAllowance()}`);
}

async function buyToken(contractFundraising, buyerSigner, amount) {
  await contractFundraising.buyToken(amount);
}

/*
    npx hardhat test tests/test_Fundraising.js --network localHardhat
*/
