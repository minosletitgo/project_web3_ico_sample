const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { getRandomInt } = require("../scripts/tools/mathHelper");

describe(" ", function () {
  // 获取全局配置
  const contractParams = loadContractParams();

  let contract;

  before(async function () {
    const signers = await ethers.getSigners();
    contract = new hre.ethers.Contract(
      readSavedContractAddress(contractParams["mockPayCoin_ContractName"]),
      loadABI(contractParams["mockPayCoin_ContractName"]),
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
        `${hre.network.name} -> ${signerAddress} -> mintAmount -> ${contractParams["mockPayCoin_Name"]} : ${mintAmount}`
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
        `${hre.network.name} -> ${signerAddress} -> balanceOf -> ${contractParams["mockPayCoin_Name"]} : ${balanceOf}`
      );
    }     
  });

  it(" ", async function () {
    logger.info(``);
    // 查询"账户1"，为"筹款合约"授予的额度

    const signers = await ethers.getSigners();
    const buyerSigner = signers[1];
    const buyerAddress = await buyerSigner.getAddress();
    const buyerBalanceOf = await contract.balanceOf(buyerAddress);
    logger.info(`buyerAddress = ${buyerAddress} | buyerBalanceOf = ${buyerBalanceOf}`);
    const contractMockPayCoin = new hre.ethers.Contract(readSavedContractAddress(contractParams["mockPayCoin_ContractName"]), loadABI(contractParams["mockPayCoin_ContractName"]), buyerSigner);
    let approveMockPayCoin = await contractMockPayCoin.allowance(buyerAddress, readSavedContractAddress(contractParams["fundraising_ContractName"]));
    logger.info(`[${buyerAddress}] -> [${readSavedContractAddress(contractParams["fundraising_ContractName"])}] : approveMockPayCoin = ${approveMockPayCoin}`);
  });  
});

/*
    npx hardhat test tests/test_MockPayCoin.js --network localHardhat
*/
