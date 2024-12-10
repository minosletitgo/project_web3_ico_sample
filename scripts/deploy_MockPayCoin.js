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
  const MockPayCoinFactory = await ethers.getContractFactory(
    config_Params["mockPayCoin_ContractName"],
    {
      contractPath:
        "./contracts/" + config_Params["mockPayCoin_ContractFileName"],
    }
  );

  // 部署"新发行代币"
  const mockPayCoin = await MockPayCoinFactory.deploy(
    config_Params["mockPayCoin_Name"],
    config_Params["mockPayCoin_Symbol"],
    config_Params["mockPayCoin_Decimals"]
  );
  await mockPayCoin.deployed();

  // 保存合约地址
  saveContractAddress(
    config_Params["mockPayCoin_ContractName"],
    mockPayCoin.address
  );

  logger.info(`mockPayCoin deployed to (address): ${mockPayCoin.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
      npx hardhat run .\scripts\deploy_MockPayCoin.js --network localHardhat
*/
