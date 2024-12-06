const hre = require("hardhat");
const logger = require("../srcs/logger");
const contractABI = require("../abi/contracts/tokens/MaoMao.sol/MaoMao.json");
require('dotenv').config();

async function main() {
    const [signer] = await ethers.getSigners();

    const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const abi = contractABI;
    
    // 创建智能合约实例
    const contract = new hre.ethers.Contract(contractAddress, abi, signer);

    {
        // 查询指定地址的代币数额
        const balanceOfAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
        const balanceOf = await contract.balanceOf(balanceOfAddress);
        logger.info(`${balanceOfAddress} -> MaoMao: ${balanceOf}`);
    }

    {
      // 查询指定地址的代币数额
      const balanceOfAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      const balanceOf = await contract.balanceOf(balanceOfAddress);
      logger.info(`${balanceOfAddress} -> MaoMao: ${balanceOf}`);
  }    
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




/*
    npx hardhat run .\tests\runTestMaoMao.js --network localHardhat
*/