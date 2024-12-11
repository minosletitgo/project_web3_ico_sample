const { ethers } = require("hardhat");
const logger = require("./tools/logger");
const { loadContractParams } = require("./tools/configReader");
const { saveContractAddress } = require("./tools/contractAddressLoader");

async function main() {
  // 获取部署者
  const [deployer] = await ethers.getSigners();
  logger.info(`Deploying contracts with the account: ${deployer.address}`);

  // 获取全局配置
  const config_Params = loadContractParams();

  // 获取"新发行代币"的合约工厂
  const OfferingCoinFactory = await ethers.getContractFactory(
    config_Params["offeringCoin_ContractName"],
    {
      contractPath:
        "./contracts/" + config_Params["offeringCoin_ContractFileName"],
    }
  );

  // 部署"新发行代币"
  const offeringCoin = await OfferingCoinFactory.deploy(
    config_Params["offeringCoin_Name"],
    config_Params["offeringCoin_Symbol"],
    config_Params["offeringCoin_TotalSupplyValue"],
    config_Params["offeringCoin_Decimals"]
  );
  await offeringCoin.deployed();

  // 保存合约地址
  saveContractAddress(
    config_Params["offeringCoin_ContractName"],
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
      npx hardhat run .\scripts\deploy_OfferingCoin.js --network localHardhat
*/
