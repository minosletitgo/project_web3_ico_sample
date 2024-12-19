const { ethers } = require("hardhat");
const logger = require("../tools/logger");
const { loadContractParams } = require("../tools/configReader");
const { saveContractAddress } = require("../tools/contractAddressLoader");
const { getRandomInt } = require("../tools/mathHelper");

async function main() {
  // 获取部署者
  const [deployer] = await ethers.getSigners();
  logger.info(`Deploying contracts with the account: ${deployer.address}`);

  // 获取全局配置
  const contractParams = loadContractParams();

  // 获取"新发行代币"的合约工厂
  const OfferingCoinFactory = await ethers.getContractFactory(
    contractParams["offeringCoin_ContractName"],
    {
      contractPath:
        "./contracts/" + contractParams["offeringCoin_ContractFileName"],
    }
  );

  // 部署"新发行代币"
  const offeringCoin = await OfferingCoinFactory.deploy(
    contractParams["offeringCoin_Name"],
    contractParams["offeringCoin_Symbol"],
    contractParams["offeringCoin_TotalSupplyValue"],
    contractParams["offeringCoin_Decimals"]
  );
  await offeringCoin.deployed();

  // 保存合约地址
  saveContractAddress(
    contractParams["offeringCoin_ContractName"],
    offeringCoin.address
  );

  logger.info(`offeringCoin deployed to (address): ${offeringCoin.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
      npx hardhat run .\scripts\deployment\deploy_OfferingCoin.js --network localHardhat
*/
