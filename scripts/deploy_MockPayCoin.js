const { ethers } = require("hardhat");
const logger = require("./tools/logger");
const { loadContractParams } = require("./tools/configReader");
const { saveContractAddress } = require("./tools/contractAddressLoader");

async function main() {
  // 获取部署者
  const [deployer] = await ethers.getSigners();
  logger.info(`Deploying contracts with the account: ${deployer.address}`);

  // 获取全局配置
  const contractParams = loadContractParams();

  // 获取"新发行代币"的合约工厂
  const MockPayCoinFactory = await ethers.getContractFactory(
    contractParams["mockPayCoin_ContractName"],
    {
      contractPath:
        "./contracts/" + contractParams["mockPayCoin_ContractFileName"],
    }
  );

  // 部署"新发行代币"
  const mockPayCoin = await MockPayCoinFactory.deploy(
    contractParams["mockPayCoin_Name"],
    contractParams["mockPayCoin_Symbol"],
    contractParams["mockPayCoin_Decimals"]
  );
  await mockPayCoin.deployed();

  // 保存合约地址
  saveContractAddress(
    contractParams["mockPayCoin_ContractName"],
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
