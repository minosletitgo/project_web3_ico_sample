const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { loadContractParams } = require("../scripts/tools/configReader");
const { convertUnixTimestampToDataString } = require("../scripts/tools/timeHelper");
const { printBlockData } = require("../scripts/tools/timeHelper");

const util = require("util");
const wait = util.promisify(setTimeout);

describe(" ", function () {

  const contractParams = loadContractParams();

  let contract;

  before(async function () {
    const [signer] = await ethers.getSigners();
    contract = new hre.ethers.Contract(
      readSavedContractAddress(contractParams["blockRunner_ContractName"]),
      loadABI(contractParams["blockRunner_ContractName"]),
      signer
    );
  });

  it(" ", async function () {
    await printBlockData();    

    await contract.updateTimestamp();
    await wait(1200);

    await printBlockData();    

    await contract.updateTimestamp();
    await wait(1200);

    await printBlockData();    
  });
});

/*
    npx hardhat test tests/test_BlockRunner.js --network localHardhat
*/
