const hre = require("hardhat");
const logger = require("../srcs/logger");
const contractABI = require("../abi/contracts/myTokens/MaoMao.sol/MaoMao.json");
require("dotenv").config();

describe(" ", function () {
  let contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  let abi = contractABI;
  let contract;

  before(async function () {
    const [signer] = await ethers.getSigners();
    contract = new hre.ethers.Contract(contractAddress, abi, signer);
  });

  it(" ", async function () {
    // // 查询代币管理员的地址
    // const ownerAddress = await contract.owner();
    // logger.info(`ownerAddress -> ${ownerAddress}`);

    // 查询指定地址的代币数额
    const balanceOfAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const balanceOf = await contract.balanceOf(balanceOfAddress);
    logger.info(`${balanceOfAddress} -> MaoMao: ${balanceOf}`);
  });
});

/*
    npx hardhat test tests/test.MaoMao.js --network localHardhat
*/
