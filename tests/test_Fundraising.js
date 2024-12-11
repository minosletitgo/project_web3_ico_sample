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

  before(async function () {
    const signers = await ethers.getSigners();
    contract = new hre.ethers.Contract(
      readSavedContractAddress(config_Params["fundraising_ContractName"]),
      loadABI(config_Params["fundraising_ContractName"]),
      signers[0]
    );    
    //logger.info("\n");
  });

  it(" ", async function () {
    if (hre.network.name == "localHardhat") {
        // 由于本地Hardhat开启的测试链，它的时间戳可能有偏差，这里强行设置"下一个区块的时间戳"
        await hre.network.provider.send("evm_setNextBlockTimestamp", [getCurrentUnixTimestampSec()]);
      }

    // 查询合约的常规数据
    let _presaleStartTimeStamp = await contract._presaleStartTimeStamp();
    let _publicsaleStartTimeStamp = _presaleStartTimeStamp.add(await contract._presaleDurationSeconds());
    let _lockTokenStartTimeStamp = _publicsaleStartTimeStamp.add(await contract._publicsaleDurationSeconds());
    
    logger.info(`_owner -> ${await contract._owner()}`);
    logger.info(`_ownerOfTokenOffering -> ${await contract._ownerOfTokenOffering()}`);
    logger.info(`_tokenMockPayCoin -> ${await contract._tokenMockPayCoin()}`);
    logger.info(`_tokenOffering -> ${await contract._tokenOffering()}`);
    logger.info(`_softCap -> ${await contract._softCap()}`);
    logger.info(`_hardCap -> ${await contract._hardCap()}`);
    logger.info(`_presaleRate -> ${await contract._presaleRate()}`);
    logger.info(`_publicSaleRate -> ${await contract._publicSaleRate()}`);
    logger.info(` -> ${convertFromUnixTimestamp(getCurrentUnixTimestampSec())} -> nowTimeStamp`); 
    logger.info(` -> ${convertFromUnixTimestamp(await contract.debug_GetBlockTimeStamp())} -> debug_GetBlockTimeStamp`); 
    logger.info(` -> ${convertFromUnixTimestamp(_presaleStartTimeStamp)} -> _presaleStartTimeStamp`);
    logger.info(` -> ${convertFromUnixTimestamp(_publicsaleStartTimeStamp)} -> _publicsaleStartTimeStamp`);    
    logger.info(` -> ${convertFromUnixTimestamp(_lockTokenStartTimeStamp)} -> _lockTokenStartTimeStamp`);    
    logger.info(`_raisedAmount -> ${await contract._raisedAmount()}`);
    logger.info(`getSaleState -> ${await contract.getSaleState()}`);
    
  });
});

/*
    npx hardhat test tests/test_Fundraising.js --network localHardhat
*/
