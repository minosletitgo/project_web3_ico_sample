const { ethers } = require("hardhat");
const logger = require("./tools/logger");
const { loadContractParams } = require("./tools/configReader");
const { saveContractAddress, readSavedContractAddress } = require("./tools/contractAddressLoader");
const { convertDataStringToUnixTimestamp, getCurrentUnixTimestampSec, autoSetNextBlockTimestamp } = require("./tools/timeHelper");

async function main() {
  const [deployer] = await ethers.getSigners();
  logger.info(`deployer.address: ${deployer.address}`);

  const config_Params = loadContractParams();

  const FundraisingFactory = await ethers.getContractFactory(
    config_Params["fundraising_ContractName"],
    {
      contractPath:
        "./contracts/" + config_Params["fundraising_ContractFileName"],
    }
  );

  await autoSetNextBlockTimestamp();

  // 完整的填写"筹款合约"的构造参数
  const fundraising = await FundraisingFactory.deploy(
    readSavedContractAddress(config_Params["mockPayCoin_ContractName"]),
    readSavedContractAddress(config_Params["offeringCoin_ContractName"]),
    deployer.address,
    config_Params["fundraising_SoftCapValue"] * 10 ** config_Params["mockPayCoin_Decimals"],
    config_Params["fundraising_HardCapValue"] * 10 ** config_Params["mockPayCoin_Decimals"],
    config_Params["fundraising_PresaleRate"],
    config_Params["fundraising_PublicsaleRate"],
    convertDataStringToUnixTimestamp(config_Params["fundraising_PresaleStartTimeStamp"]),
    config_Params["fundraising_PresaleDurationSeconds"],
    config_Params["fundraising_PublicDurationSeconds"],
    config_Params["fundraising_LockTokenDurationSeconds"]
  );
  await fundraising.deployed();

  // 保存合约地址
  saveContractAddress(
    config_Params["fundraising_ContractName"],
    fundraising.address
  );

  logger.info(`fundraising deployed to (address): ${fundraising.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
      npx hardhat run .\scripts\deploy_Fundraising.js --network localHardhat
*/
