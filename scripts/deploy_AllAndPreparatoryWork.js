const { ethers } = require("hardhat");
const logger = require("./tools/logger");
const { loadContractParams } = require("./tools/configReader");
const { saveContractAddress, readSavedContractAddress } = require("./tools/contractAddressLoader");
const { convertDataStringToUnixTimestamp, autoSetNextBlockTimestamp } = require("./tools/timeHelper");
const { getRandomInt } = require("../scripts/tools/mathHelper");

/*
    一键部署所有合约，以及关联准备工作。
*/

async function main() {
  const allSigners = await ethers.getSigners();
  const adminSigner = allSigners[0];
  const config_Params = loadContractParams();

  logger.info(`准备：部署"发行新代币"(内置为管理员发币)`);
  const OfferingCoinFactory = await ethers.getContractFactory(config_Params["offeringCoin_ContractName"], {
    contractPath: "./contracts/" + config_Params["offeringCoin_ContractFileName"],
  });
  const offeringCoin = await OfferingCoinFactory.connect(adminSigner).deploy(
    config_Params["offeringCoin_Name"],
    config_Params["offeringCoin_Symbol"],
    config_Params["offeringCoin_TotalSupplyValue"],
    config_Params["offeringCoin_Decimals"]
  );
  await offeringCoin.deployed();
  saveContractAddress(config_Params["offeringCoin_ContractName"], offeringCoin.address);

  logger.info(`准备：部署"模拟支付代币"`);
  const MockPayCoinFactory = await ethers.getContractFactory(config_Params["mockPayCoin_ContractName"], {
    contractPath: "./contracts/" + config_Params["mockPayCoin_ContractFileName"],
  });
  const mockPayCoin = await MockPayCoinFactory.connect(adminSigner).deploy(config_Params["mockPayCoin_Name"], config_Params["mockPayCoin_Symbol"], config_Params["mockPayCoin_Decimals"]);
  await mockPayCoin.deployed();
  saveContractAddress(config_Params["mockPayCoin_ContractName"], mockPayCoin.address);

  logger.info(`准备：为所有用户发动"模拟支付代币"`);
  for (let i = 0; i < allSigners.length; i++) {
    const signer = allSigners[i];
    const signerAddress = await signer.getAddress();
    const decimals = await mockPayCoin.decimals();
    const mintAmount = BigInt(getRandomInt(500, 2000) * 10 ** decimals);
    await mockPayCoin.mint(signerAddress, mintAmount);
    logger.info(`${hre.network.name} -> ${signerAddress} -> mintAmount -> ${config_Params["mockPayCoin_Name"]} : ${mintAmount}`);
  }

  logger.info(`准备：部署"筹款合约"`);
  await autoSetNextBlockTimestamp();
  const FundraisingFactory = await ethers.getContractFactory(config_Params["fundraising_ContractName"], {
    contractPath: "./contracts/" + config_Params["fundraising_ContractFileName"],
  });
  const fundraising = await FundraisingFactory.connect(adminSigner).deploy(
    readSavedContractAddress(config_Params["mockPayCoin_ContractName"]),
    readSavedContractAddress(config_Params["offeringCoin_ContractName"]),
    adminSigner.address,
    BigInt(config_Params["fundraising_SoftCapValue"] * 10 ** config_Params["mockPayCoin_Decimals"]),
    BigInt(config_Params["fundraising_HardCapValue"] * 10 ** config_Params["mockPayCoin_Decimals"]),
    config_Params["fundraising_PresaleRate"],
    config_Params["fundraising_PublicsaleRate"],
    convertDataStringToUnixTimestamp(config_Params["fundraising_PresaleStartTimeStamp"]),
    config_Params["fundraising_PresaleDurationSeconds"],
    config_Params["fundraising_PublicDurationSeconds"],
    config_Params["fundraising_LockTokenDurationSeconds"]
  );
  await fundraising.deployed();
  saveContractAddress(config_Params["fundraising_ContractName"], fundraising.address);

  let approveOfferingCoin = BigInt(config_Params["offeringCoin_TotalSupplyValue"]) * BigInt(10 ** config_Params["offeringCoin_Decimals"]);
  logger.info(`"资金管理员"授权"筹款合约"，足额(供应量那么多:${approveOfferingCoin})的"新发行代币"：`);
  await offeringCoin.approve(contractFundraising.address, approveOfferingCoin);  
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
