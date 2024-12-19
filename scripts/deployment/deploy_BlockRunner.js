const { ethers } = require("hardhat");
const logger = require("../tools/logger");
const { saveContractAddress } = require("../tools/contractAddressLoader");
const { loadContractParams } = require("../tools/configReader");
const { convertDataStringToUnixTimestamp } = require("../tools/timeHelper");


async function main() { 
  const contractParams = loadContractParams();

  const [deployer] = await ethers.getSigners();
  logger.info(`Deploying contracts with the account: ${deployer.address}`);

  const BlockRunnerFactory = await ethers.getContractFactory(
    contractParams["blockRunner_ContractName"],
    {
      contractPath:
        "./contracts/" + contractParams["blockRunner_ContractFileName"],
    }
  );

  const blockRunner = await BlockRunnerFactory.deploy();
  await blockRunner.deployed();

  saveContractAddress(
    contractParams["blockRunner_ContractName"],
    blockRunner.address
  );

  logger.info(`blockRunner deployed to (address): ${blockRunner.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
      npx hardhat run .\scripts\deployment\deploy_BlockRunner.js --network localHardhat
*/
