const { ethers } = require("hardhat");
const logger = require('../srcs/logger');

async function main() {
  const [deployer] = await ethers.getSigners();
  logger.info(`Deploying contracts with the account: ${deployer.address}`);

  const MyUSDT_02 = await ethers.getContractFactory("USDT_02", {
    contractPath: "./contracts/USDT_02.sol",
  });
  const myUSDT_02 = await MyUSDT_02.deploy("MyUSDT_02", "USDT_02", 1);
  await myUSDT_02.deployed();

  logger.info(`USDT_02 deployed to (address): ${myUSDT_02.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  /*
    npx hardhat run .\scripts\deploy_USDT_02.js --network localHardhat
    0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6

    npx hardhat run .\scripts\deploy_USDT_02.js --network sepolia
    0xd6D0a69001A63a3f3F7275D4bC7bdC702afc9dd5    
  */
