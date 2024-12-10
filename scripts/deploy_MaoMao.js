const { ethers } = require("hardhat");
const logger = require("./tools/logger");
const configReader = require("./tools/configReader");
const contractDeployer = require("./tools/contractDeployer");

async function main() {
  const [deployer] = await ethers.getSigners();
  logger.info(`Deploying contracts with the account: ${deployer.address}`);

  const config_OfferingCoin =
    configReader.loadContractStatic()["contract_OfferingCoin"];
  const config_Params = configReader.loadContractParams()[hre.network.name];

  const OfferingCoinFactory = await ethers.getContractFactory(
    config_OfferingCoin["name"],
    {
      contractPath: "./contracts/" + config_OfferingCoin["fileName"],
    }
  );
  const offeringCoin = await OfferingCoinFactory.deploy(
    config_Params["offeringCoinName"],
    config_Params["offeringCoinSymbol"],
    config_Params["offeringCoinTotalSupply"]
  );
  await offeringCoin.deployed();
  contractDeployer.saveContractAddress(
    hre.network.name,
    config_OfferingCoin["name"],
    offeringCoin.address
  );

  logger.info(`MaoMao deployed to (address): ${offeringCoin.address}`);
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
