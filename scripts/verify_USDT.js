const { ethers, run, network } = require("hardhat");

// 在你的部署脚本中
async function main() {
  const contractAddress = "0x9d9b2302AedC3e48ba6c70Ce052F31Df9ce9999C";
  const constructorArgs = ["MyUSDT", "USDT"];
  console.log("contractAddress:", contractAddress );

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
    npx hardhat run .\scripts\verify_USDT.js --network sepolia

    https://sepolia.etherscan.io/address/0x9d9b2302AedC3e48ba6c70Ce052F31Df9ce9999C#code
  */  
