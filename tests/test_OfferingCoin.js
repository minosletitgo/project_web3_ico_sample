const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");

describe(" ", function () {
  // 获取全局配置
  const config_Params = loadContractParams();

  let contract;

  before(async function () {
    const [signer] = await ethers.getSigners();
    contract = new hre.ethers.Contract(
      readSavedContractAddress(config_Params["offeringCoin_ContractName"]),
      loadABI(config_Params["offeringCoin_ContractName"]),
      signer
    );
  });

  it(" ", async function () {
    // 查询代币管理员的地址
    const ownerAddress = await contract.owner();
    logger.info(`ownerAddress -> ${ownerAddress}`);

    const signers = await ethers.getSigners();

    // 查询所有账户的代币数额
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const signerAddress = await signer.getAddress();
      const balanceOf = await contract.balanceOf(signerAddress);
      logger.info(
        `${hre.network.name} -> ${signerAddress} -> ${config_Params["offeringCoin_Name"]}: ${balanceOf}`
      );
    }
  });
});

/*
    npx hardhat test tests/test_OfferingCoin.js --network localHardhat
*/
