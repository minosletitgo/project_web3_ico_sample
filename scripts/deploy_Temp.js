const { ethers } = require("hardhat");
const logger = require("./tools/logger");
const { saveContractAddress } = require("./tools/contractAddressLoader");
const { convertDataStringToUnixTimestamp } = require("./tools/timeHelper");

async function main() {
  const [deployer] = await ethers.getSigners();
  logger.info(`Deploying contracts with the account: ${deployer.address}`);

  const TempFactory = await ethers.getContractFactory(
    "Temp",
    {
      contractPath:
        "./contracts/" + "Temp.sol",
    }
  );

  const temp = await TempFactory.deploy();
  await temp.deployed();

  saveContractAddress(
    "Temp",
    temp.address
  );

  logger.info(`temp deployed to (address): ${temp.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
      npx hardhat run .\scripts\deploy_Temp.js --network localHardhat
*/
