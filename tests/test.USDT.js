const { BigNumber } = require("ethers");
const hre = require("hardhat");
const logger = require("../srcs/logger");
const contractABI = require("../abi/contracts/myTokens/USDT.sol/USDT.json");
require("dotenv").config();

describe(" ", function () {
  let contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  let abi = contractABI;
  let contract;

  before(async function () {
    const [signer] = await ethers.getSigners();
    contract = new hre.ethers.Contract(contractAddress, abi, signer);

    // 为指定地址铸造代币
    const mintToAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    //const mintAmount = BigNumber.from((800 * 10 ** 6).toString());
    const tx = await contract.mint(mintToAddress, 800 * 10 ** 6);
    await tx.wait();
  });

  it(" ", async function () {
    // 查询代币管理员的地址
    const ownerAddress = await contract.owner();
    logger.info(`ownerAddress -> ${ownerAddress}`);

    // 查询指定地址的代币数额
    const balanceOfAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const balanceOf = await contract.balanceOf(balanceOfAddress);
    logger.info(`balanceOfAddress:${balanceOfAddress} -> USDT: ${balanceOf}`);
  });
});

/*
    npx hardhat test tests/test.USDT.js --network localHardhat

    npx hardhat test tests/test.USDT.js --network sepolia
*/
