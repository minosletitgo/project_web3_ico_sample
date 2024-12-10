const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { getRandomInt } = require("../scripts/tools/math");

describe(" ", function () {
  // 获取全局配置
  const config_Params = loadContractParams();

  let contract;

  before(async function () {
    const signers = await ethers.getSigners();
    contract = new hre.ethers.Contract(
      readSavedContractAddress(config_Params["mockPayCoin_ContractName"]),
      loadABI(config_Params["mockPayCoin_ContractName"]),
      signers[0]
    );

    // 为所有账户地址铸造一些"模拟支付代币"
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const signerAddress = await signer.getAddress();
      const decimals = await contract.decimals();
      const mintAmount = getRandomInt(500, 2000) * 10 ** decimals;
      const tx = await contract.mint(signerAddress, mintAmount);
      await tx.wait();
      logger.info(
        `${hre.network.name} -> ${signerAddress} -> mintAmount -> ${config_Params["offeringCoin_Name"]} : ${mintAmount}`
      );
    }   
    
    logger.info("\n");
  });

  it(" ", async function () {
    // 查询代币管理员的地址
    const ownerAddress = await contract.owner();
    logger.info(`ownerAddress -> ${ownerAddress}`);

    // 查询所有账户的模拟支付代币的余额
    const signers = await ethers.getSigners();
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const signerAddress = await signer.getAddress();
      const balanceOf = await contract.balanceOf(signerAddress);
      logger.info(
        `${hre.network.name} -> ${signerAddress} -> balanceOf -> ${config_Params["offeringCoin_Name"]} : ${balanceOf}`
      );
    }     
  });
});

/*
    npx hardhat test tests/test_MockPayCoin.js --network localHardhat
*/
