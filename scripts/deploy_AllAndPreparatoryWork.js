const { ethers } = require("hardhat");
const logger = require("./tools/logger");
const { loadContractParams } = require("./tools/configReader");
const { saveContractAddress, readSavedContractAddress } = require("./tools/contractAddressLoader");
const { getCurrentUnixTimestampSec, convertDataStringToUnixTimestamp, printBlockData } = require("./tools/timeHelper");
const { getRandomInt } = require("../scripts/tools/mathHelper");

const util = require("util");
const wait = util.promisify(setTimeout);

/*
    一键部署所有合约，以及关联准备工作。
*/

async function main() {
  const allSigners = await ethers.getSigners();
  const adminSigner = allSigners[0];
  const contractParams = loadContractParams();

  await printBlockData();

  logger.info(`准备：部署"发行新代币"(内置为管理员发币)`);
  const OfferingCoinFactory = await ethers.getContractFactory(contractParams["offeringCoin_ContractName"], {
    contractPath: "./contracts/" + contractParams["offeringCoin_ContractFileName"],
  });
  const contractOfferingCoin = await OfferingCoinFactory.connect(adminSigner).deploy(
    contractParams["offeringCoin_Name"],
    contractParams["offeringCoin_Symbol"],
    contractParams["offeringCoin_TotalSupplyValue"],
    contractParams["offeringCoin_Decimals"]
  );
  await contractOfferingCoin.deployed();
  saveContractAddress(contractParams["offeringCoin_ContractName"], contractOfferingCoin.address);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  await wait(1200);
  await printBlockData();
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  logger.info(`准备：部署"模拟支付代币"`);
  const MockPayCoinFactory = await ethers.getContractFactory(contractParams["mockPayCoin_ContractName"], {
    contractPath: "./contracts/" + contractParams["mockPayCoin_ContractFileName"],
  });
  const contractMockPayCoin = await MockPayCoinFactory.connect(adminSigner).deploy(contractParams["mockPayCoin_Name"], contractParams["mockPayCoin_Symbol"], contractParams["mockPayCoin_Decimals"]);
  await contractMockPayCoin.deployed();
  saveContractAddress(contractParams["mockPayCoin_ContractName"], contractMockPayCoin.address);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  await wait(1200);
  await printBlockData();
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  logger.info(`准备：为所有用户投放"模拟支付代币"`);
  //for (let i = 1; i < allSigners.length; i++) {
  for (let i = 0; i < 5; i++) {
    const signer = allSigners[i];
    const signerAddress = await signer.getAddress();
    const decimals = await contractMockPayCoin.decimals();
    let mintAmount = 0;
    if (i == 0) {
      // 管理员必须足够多
      mintAmount = BigInt(100000000 * 10 ** decimals);
    } else {
      // 普通用户意思一下，别给太多
      mintAmount = BigInt(getRandomInt(500, 1000) * 10 ** decimals);
    }
    await contractMockPayCoin.mint(signerAddress, mintAmount);
    logger.info(`${hre.network.name} -> ${signerAddress} -> mintAmount -> ${contractParams["mockPayCoin_Name"]} : ${mintAmount}`);
    await wait(1000);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  await wait(1200);
  await printBlockData();
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  logger.info(`准备：部署"模拟交易所工厂"`);
  const MockExchangeFactory = await ethers.getContractFactory(contractParams["mockExchangeFactory_ContractName"], {
    contractPath: "./contracts/" + contractParams["mockExchangeFactory_ContractFileName"],
  });
  const contractMockExchangeFactory = await MockExchangeFactory.connect(adminSigner).deploy(adminSigner.address);
  await contractMockExchangeFactory.deployed();
  saveContractAddress(contractParams["mockExchangeFactory_ContractName"], contractMockExchangeFactory.address);
  const initCodeHash = await contractMockExchangeFactory.INIT_CODE_PAIR_HASH();
  console.log("contractMockExchangeFactory: Init Code Hash:", initCodeHash);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  await wait(1200);
  await printBlockData();
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  logger.info(`准备：部署"模拟交易所路由"`);
  const MockExchangeRouter = await ethers.getContractFactory(contractParams["mockExchangeRouter_ContractName"], {
    contractPath: "./contracts/" + contractParams["mockExchangeRouter_ContractFileName"],
  });
  let ethAddress = "0x0000000000000000000000000000000000000000";
  const contractMockExchangeRouter = await MockExchangeRouter.connect(adminSigner).deploy(contractMockExchangeFactory.address, ethAddress);
  await contractMockExchangeRouter.deployed();
  logger.info(`contractMockExchangeRouter.address = ${contractMockExchangeRouter.address}`);
  saveContractAddress(contractParams["mockExchangeRouter_ContractName"], contractMockExchangeRouter.address);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  await wait(1200);
  await printBlockData();
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  let amountTokenA_OnCreate = BigInt(contractParams["mockExchange_Pair_TokenA_CreateAmount"]) * BigInt(10 ** contractParams["offeringCoin_Decimals"]);
  let amountTokenB_OnCreate = BigInt(contractParams["mockExchange_Pair_TokenB_CreateAmount"]) * BigInt(10 ** contractParams["mockPayCoin_Decimals"]);
  logger.info(`amountTokenA_OnCreate = ${amountTokenA_OnCreate}`);
  logger.info(`amountTokenB_OnCreate = ${amountTokenB_OnCreate}`);

  logger.info(`准备：管理员授予"交易所路由合约"一定的新发行代币额度(${amountTokenA_OnCreate})`);
  await contractOfferingCoin.approve(contractMockExchangeRouter.address, amountTokenA_OnCreate);
  
  let allowanceA = await contractOfferingCoin.allowance(adminSigner.address, contractMockExchangeRouter.address);
  logger.info(`allowanceA = ${allowanceA}`);
  logger.info(`balanceOfA = ${await contractOfferingCoin.balanceOf(adminSigner.address)}`);

  await wait(1200);

  logger.info(`准备：管理员授予"交易所路由合约"一定的模拟支付代币额度(${amountTokenB_OnCreate})`);
  await contractMockPayCoin.approve(contractMockExchangeRouter.address, amountTokenB_OnCreate);

  let allowanceB = await contractMockPayCoin.allowance(adminSigner.address, contractMockExchangeRouter.address);
  logger.info(`allowanceB = ${allowanceB}`);
  logger.info(`balanceOfB = ${await contractMockPayCoin.balanceOf(adminSigner.address)}`);

  await wait(1200);
  let currentBlock = await printBlockData();

  logger.info(`准备：使用"模拟交易所路由"添加流动性(即，首次会创建交易对)`);

  await contractMockExchangeRouter.addLiquidity(
    contractOfferingCoin.address,
    contractMockPayCoin.address,
    amountTokenA_OnCreate,
    amountTokenB_OnCreate,
    1,
    1,
    adminSigner.address,
    currentBlock.timestamp + 10
  );

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  await wait(1200);
  await printBlockData();
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  logger.info(`准备：部署"锁仓合约"`);
  const OfferingCoinLocker = await ethers.getContractFactory(contractParams["offeringCoinLocker_ContractName"], {
    contractPath: "./contracts/" + contractParams["offeringCoinLocker_ContractFileName"],
  });
  const contractOfferingCoinLocker = await OfferingCoinLocker.connect(adminSigner).deploy(contractOfferingCoin.address);
  await contractOfferingCoinLocker.deployed();
  saveContractAddress(contractParams["offeringCoinLocker_ContractName"], contractOfferingCoinLocker.address);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  await wait(1200);
  await printBlockData();
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  logger.info(`准备：部署"筹款合约"`);
  const FundraisingFactory = await ethers.getContractFactory(contractParams["fundraising_ContractName"], {
    contractPath: "./contracts/" + contractParams["fundraising_ContractFileName"],
  });
  const contractFundraising = await FundraisingFactory.connect(adminSigner).deploy(
    readSavedContractAddress(contractParams["mockPayCoin_ContractName"]),
    readSavedContractAddress(contractParams["offeringCoin_ContractName"]),
    adminSigner.address,
    contractOfferingCoinLocker.address,
    BigInt(contractParams["fundraising_SoftCapValue"] * 10 ** contractParams["mockPayCoin_Decimals"]),
    BigInt(contractParams["fundraising_HardCapValue"] * 10 ** contractParams["mockPayCoin_Decimals"]),
    contractParams["fundraising_PresaleRate"],
    contractParams["fundraising_PublicsaleRate"],
    convertDataStringToUnixTimestamp(contractParams["fundraising_PresaleStartTimeStamp"]),
    contractParams["fundraising_PresaleDurationSeconds"],
    contractParams["fundraising_PublicDurationSeconds"],
    contractParams["fundraising_LockTokenDurationSeconds"]
  );
  await contractFundraising.deployed();
  saveContractAddress(contractParams["fundraising_ContractName"], contractFundraising.address);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  await wait(1200);
  await printBlockData();
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  logger.info(`把"筹款合约"，设置为"锁仓合约"的权限执行者"`);
  contractOfferingCoinLocker.addAuthorizedAddress(contractFundraising.address);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  await wait(1200);
  await printBlockData();
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  let approveOfferingCoin = BigInt(contractParams["offeringCoin_ApproveFundraisingValue"]) * BigInt(10 ** contractParams["offeringCoin_Decimals"]);
  logger.info(`"资金管理员"授权"筹款合约"，足额(供应量有这么多:${approveOfferingCoin})的"新发行代币"：`);
  await contractOfferingCoin.approve(contractFundraising.address, approveOfferingCoin);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
    npx hardhat run .\scripts\deploy_AllAndPreparatoryWork.js --network localHardhat
*/
