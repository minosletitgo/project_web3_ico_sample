const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { getCurrentUnixTimestampSec, convertFromUnixTimestamp } = require("../scripts/tools/timeHelper");

describe(" ", function () {
  // 获取全局配置
  const config_Params = loadContractParams();

  let contract;
  let oprSigner;

  before(async function () {
    const signers = await ethers.getSigners();
    oprSigner = signers[0];
    contract = new hre.ethers.Contract(
      readSavedContractAddress(config_Params["fundraising_ContractName"]),
      loadABI(config_Params["fundraising_ContractName"]),
      oprSigner
    );    
    logger.info(`合约示例获取完成 \n`);
  });

  it("", async function () {
    console.log(``);
    await printAllValue(contract);    
  });

  it("", async function () {
    console.log(``);
    await buyToken(contract, oprSigner, 1 * 10 ** config_Params["mockPayCoin_Decimals"]);
  });
});

async function printAllValue(contract) {
    logger.info(`查询合约的常规数据`);
    let _presaleStartTimeStamp = await contract._presaleStartTimeStamp();
    let _publicsaleStartTimeStamp = _presaleStartTimeStamp.add(await contract._presaleDurationSeconds());
    let _lockTokenStartTimeStamp = _publicsaleStartTimeStamp.add(await contract._publicsaleDurationSeconds());
    let _EndStartTimeStamp = _lockTokenStartTimeStamp.add(await contract._lockTokenDurationSeconds());
    
    logger.info(`_owner -> ${await contract._owner()}`);
    logger.info(`_ownerOfTokenOffering -> ${await contract._ownerOfTokenOffering()}`);
    logger.info(`_tokenMockPayCoin -> ${await contract._tokenMockPayCoin()}`);
    logger.info(`_tokenOffering -> ${await contract._tokenOffering()}`);
    logger.info(`_softCap -> ${await contract._softCap()}`);
    logger.info(`_hardCap -> ${await contract._hardCap()}`);
    logger.info(`_presaleRate -> ${await contract._presaleRate()}`);
    logger.info(`_publicSaleRate -> ${await contract._publicSaleRate()}`);
    logger.info(` -> ${convertFromUnixTimestamp(getCurrentUnixTimestampSec())} -> localNowTimeStamp`); 
    logger.info(` -> ${convertFromUnixTimestamp(_presaleStartTimeStamp)} -> _presaleStartTimeStamp`);
    logger.info(` -> ${convertFromUnixTimestamp(_publicsaleStartTimeStamp)} -> _publicsaleStartTimeStamp`);    
    logger.info(` -> ${convertFromUnixTimestamp(_lockTokenStartTimeStamp)} -> _lockTokenStartTimeStamp`);    
    logger.info(` -> ${convertFromUnixTimestamp(_EndStartTimeStamp)} -> _EndStartTimeStamp`);    
    logger.info(`_raisedAmount -> ${await contract._raisedAmount()}`);
    logger.info(`getSaleState -> ${await contract.getSaleState()}`);    
}

async function buyToken(contract, oprSigner, amount) {
    await contract.buyToken(amount);
}

/*
    npx hardhat test tests/test_Fundraising.js --network localHardhat
*/
