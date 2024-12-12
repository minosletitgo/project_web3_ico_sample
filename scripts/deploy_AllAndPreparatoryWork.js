const { ethers } = require("hardhat");
const logger = require("./tools/logger");
const { loadContractParams } = require("./tools/configReader");
const { saveContractAddress, readSavedContractAddress } = require("./tools/contractAddressLoader");
const { convertDataStringToUnixTimestamp, printBlockData } = require("./tools/timeHelper");
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

  await wait(2000);
  await printBlockData();

  logger.info(`准备：部署"模拟支付代币"`);
  const MockPayCoinFactory = await ethers.getContractFactory(contractParams["mockPayCoin_ContractName"], {
    contractPath: "./contracts/" + contractParams["mockPayCoin_ContractFileName"],
  });
  const contractMockPayCoin = await MockPayCoinFactory.connect(adminSigner).deploy(contractParams["mockPayCoin_Name"], contractParams["mockPayCoin_Symbol"], contractParams["mockPayCoin_Decimals"]);
  await contractMockPayCoin.deployed();
  saveContractAddress(contractParams["mockPayCoin_ContractName"], contractMockPayCoin.address);

  await wait(2000);
  await printBlockData();

  logger.info(`准备：为所有用户发动"模拟支付代币"`);
  //for (let i = 0; i < allSigners.length; i++) {
  for (let i = 0; i < 3; i++) {
    const signer = allSigners[i];
    const signerAddress = await signer.getAddress();
    const decimals = await contractMockPayCoin.decimals();
    const mintAmount = BigInt(getRandomInt(500, 2000) * 10 ** decimals);
    await contractMockPayCoin.mint(signerAddress, mintAmount);
    logger.info(`${hre.network.name} -> ${signerAddress} -> mintAmount -> ${contractParams["mockPayCoin_Name"]} : ${mintAmount}`);
    await wait(1000);
  }

  await wait(2000);
  await printBlockData();

  logger.info(`准备：部署"筹款合约"`);
  const FundraisingFactory = await ethers.getContractFactory(contractParams["fundraising_ContractName"], {
    contractPath: "./contracts/" + contractParams["fundraising_ContractFileName"],
  });
  const contractFundraising = await FundraisingFactory.connect(adminSigner).deploy(
    readSavedContractAddress(contractParams["mockPayCoin_ContractName"]),
    readSavedContractAddress(contractParams["offeringCoin_ContractName"]),
    adminSigner.address,
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

  await wait(2000);
  await printBlockData();

  let approveOfferingCoin = BigInt(contractParams["offeringCoin_TotalSupplyValue"]) * BigInt(10 ** contractParams["offeringCoin_Decimals"]);
  logger.info(`"资金管理员"授权"筹款合约"，足额(供应量那么多:${approveOfferingCoin})的"新发行代币"：`);
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
