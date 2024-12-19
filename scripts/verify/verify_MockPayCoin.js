const { ethers, run, network } = require("hardhat");
const { ethers } = require("hardhat");
const logger = require("../tools/logger");
const { loadContractParams } = require("../tools/configReader");
const {
  readSavedContractAddress,
} = require("../tools/contractAddressLoader");

// 在你的部署脚本中
async function main() {
  // 获取全局配置
  const contractParams = loadContractParams();

  const contractAddress = readSavedContractAddress(
    contractParams["mockPayCoin_ContractName"]
  );
  const constructorArgs = [
    contractParams["mockPayCoin_ContractName"],
    contractParams["mockPayCoin_Symbol"],
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
    npx hardhat run .\scripts\verify\verify_MockPayCoin.js --network sepolia
*/
