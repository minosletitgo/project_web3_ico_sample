const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");

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
    logger.info("///////////////////////");
    logger.info(`contract.lastUpdated -> ${await contract.lastUpdated()}`);
    await contract.updateTimestamp();
    logger.info(`contract.lastUpdated -> ${await contract.lastUpdated()}`);
  });
});

/*
    npx hardhat test tests/test_Temp.js --network localHardhat
*/
