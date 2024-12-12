const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { getCurrentUnixTimestampSec, convertUnixTimestampToDataString, autoSetNextBlockTimestamp } = require("../scripts/tools/timeHelper");

describe(" ", function () {
  before(async function () {
    if (hre.network.name == "localHardhat") {
      // 最新区块
      const latestBlock = await hre.ethers.provider.getBlock("latest");

      // 上一个区块
      const previousBlock = await hre.ethers.provider.getBlock(latestBlock.number - 1);

      // 当前真实时间戳
      const currentUnixTimestampSec = getCurrentUnixTimestampSec();

      logger.info(`-> ${latestBlock.timestamp} | ${convertUnixTimestampToDataString(latestBlock.timestamp)} -> latestBlock.timestamp`);
      logger.info(`-> ${previousBlock.timestamp} | ${convertUnixTimestampToDataString(previousBlock.timestamp)} -> previousBlock.timestamp`);
      logger.info(`-> ${currentUnixTimestampSec} | ${convertUnixTimestampToDataString(currentUnixTimestampSec)} -> currentUnixTimestampSec`);
    }
  });

  it(" ", async function () {});
});

/*
    npx hardhat test tests/test_Others.js --network localHardhat
*/
