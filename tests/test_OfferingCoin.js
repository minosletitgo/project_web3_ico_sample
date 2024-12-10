const hre = require("hardhat");
require("dotenv").config();
// 日志管理器
const logger = require("../scripts/tools/logger");
// 配置读取器
const configReader = require("../scripts/tools/configReader");
// 合约部署助手
const contractDeployer = require("../scripts/tools/contractDeployer");

describe(" ", function () {
  // 获取全局配置
  const config_Params = configReader.loadContractParams()[hre.network.name];

  let contract;

  before(async function () {
    const [signer] = await ethers.getSigners();
    contract = new hre.ethers.Contract(
      contractDeployer.readSavedContractAddress(
        hre.network.name,
        config_Params["offeringCoin_ContractName"]
      ),
      contractDeployer.readSavedContractABI(
        hre.network.name,
        config_Params["offeringCoin_ContractName"]
      ),
      signer
    );
  });

  it(" ", async function () {
    // // 查询代币管理员的地址
    // const ownerAddress = await contract.owner();
    // logger.info(`ownerAddress -> ${ownerAddress}`);

    // 查询指定地址的代币数额
    const balanceOfAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const balanceOf = await contract.balanceOf(balanceOfAddress);
    logger.info(
      `${hre.network.name} -> ${balanceOfAddress} -> ${config_Params["offeringCoin_Name"]}: ${balanceOf}`
    );
  });
});

/*
    npx hardhat test tests/test_OfferingCoin.js --network localHardhat
*/
