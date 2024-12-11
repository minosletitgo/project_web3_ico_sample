const { ethers, run, network } = require("hardhat");
const { ethers } = require("hardhat");
const logger = require("./tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const {
  readSavedContractAddress,
} = require("../scripts/tools/contractAddressLoader");

// 在你的部署脚本中
async function main() {
  // 获取全局配置
  const config_Params = loadContractParams();

  const contractAddress = readSavedContractAddress(
    config_Params["mockPayCoin_ContractName"]
  );
  const constructorArgs = [
    config_Params["mockPayCoin_ContractName"],
    config_Params["mockPayCoin_Symbol"],
  ];
  console.log("contractAddress:", contractAddress);

  // 验证合约
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
    });
    console.log("Contract verified successfully!");
  } catch (e) {
    console.error("Failed to verify on Etherscan", e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
    npx hardhat run .\scripts\verify_MockPayCoin.js --network sepolia
  */
