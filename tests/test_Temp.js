const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { convertUnixTimestampToDataString, adjustNextBlockTimestamp } = require("../scripts/tools/timeHelper");

describe(" ", function () {

  let contract;

  before(async function () {
    const [signer] = await ethers.getSigners();
    contract = new hre.ethers.Contract(
      readSavedContractAddress("Temp"),
      loadABI("Temp"),
      signer
    );
  });

  it(" ", async function () {
    await adjustNextBlockTimestamp();
    logger.info("///////////////////////");
    logger.info(` -> ${await contract._lastUpdated()} -> ${convertUnixTimestampToDataString(await contract._lastUpdated())} -> _lastUpdated`);    
    await contract.updateTimestamp();logger.info(`contract.updateTimestamp()`);    
    logger.info(` -> ${await contract._lastUpdated()} -> ${convertUnixTimestampToDataString(await contract._lastUpdated())} -> _lastUpdated`);    
  });
});

/*
    npx hardhat test tests/test_Temp.js --network localHardhat
*/
