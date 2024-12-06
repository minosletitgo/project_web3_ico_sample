const { ethers } = require("hardhat");
const logger = require('../srcs/logger');

async function main() {
  const [deployer] = await ethers.getSigners();
  logger.info(`Deploying contracts with the account: ${deployer.address}`);

  const MyUSDT = await ethers.getContractFactory("USDT", {
    contractPath: "./contracts/USDT.sol",
  });
  const myUSDT = await MyUSDT.deploy("MyUSDT", "USDT");
  await myUSDT.deployed();

  logger.info(`USDT deployed to (address): ${myUSDT.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  /*
    npx hardhat run .\scripts\deploy_USDT.js --network localHardhat
    0x59b670e9fA9D0A427751Af201D676719a970857b

    npx hardhat run .\scripts\deploy_USDT.js --network sepolia
    0xd6D0a69001A63a3f3F7275D4bC7bdC702afc9dd5    
  */
