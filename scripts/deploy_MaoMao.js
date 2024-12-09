const { ethers } = require("hardhat");
const logger = require('../srcs/logger');

async function main() {
  const [deployer] = await ethers.getSigners();
  logger.info(`Deploying contracts with the account: ${deployer.address}`);

  const MyMaoMao = await ethers.getContractFactory("MaoMao", {
    contractPath: "./contracts/MaoMao.sol",
  });
  const myMaoMao = await MyMaoMao.deploy("MyMaoMao", "MaoMao", 10**9);
  await myMaoMao.deployed();

  logger.info(`MaoMao deployed to (address): ${myMaoMao.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  /*
      npx hardhat run .\scripts\deploy_MaoMao.js --network localHardhat
      0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
  */ 