const hre = require("hardhat");
const logger = require("../srcs/logger");
const contractABI = require("../abi/contracts/myTokens/USDT_02.sol/USDT_02.json");
require('dotenv').config();

async function main() {
    const [signer] = await ethers.getSigners();

    const contractAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
    const abi = contractABI;
    
    // 创建智能合约实例
    const contract = new hre.ethers.Contract(contractAddress, abi, signer);

    {
        // 为指定地址铸造代币
        const mintToAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const mintAmount = 2500000000000000;
        const tx = await contract.mint(mintToAddress, mintAmount);
        await tx.wait();
    }

    {
        // 查询指定地址的代币数额
        const balanceOfAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const balanceOf = await contract.balanceOf(balanceOfAddress);
        logger.info(`${balanceOfAddress} -> USDT_02: ${balanceOf}`);
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




/*
    npx hardhat run .\tests\runTestUSDT_02.js --network localHardhat

    npx hardhat run .\tests\runTestUSDT_02.js --network sepolia
*/