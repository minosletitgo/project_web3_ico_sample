const { ethers } = require("hardhat");
const logger = require('./tools/logger');

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
    0x5FbDB2315678afecb367f032d93F642f64180aa3

    npx hardhat run .\scripts\deploy_USDT.js --network sepolia
    0x9d9b2302AedC3e48ba6c70Ce052F31Df9ce9999C    
  */
