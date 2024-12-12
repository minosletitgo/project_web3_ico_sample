const { ethers } = require("hardhat");
const logger = require("./tools/logger");
const { loadContractParams } = require("./tools/configReader");
const { saveContractAddress, readSavedContractAddress } = require("./tools/contractAddressLoader");
const { convertDataStringToUnixTimestamp } = require("./tools/timeHelper");

async function main() {
  const [deployer] = await ethers.getSigners();
  logger.info(`deployer.address: ${deployer.address}`);

  const contractParams = loadContractParams();

  const FundraisingFactory = await ethers.getContractFactory(
    contractParams["fundraising_ContractName"],
    {
      contractPath:
        "./contracts/" + contractParams["fundraising_ContractFileName"],
    }
  );

  // 完整的填写"筹款合约"的构造参数
  const fundraising = await FundraisingFactory.deploy(
    readSavedContractAddress(contractParams["mockPayCoin_ContractName"]),
    readSavedContractAddress(contractParams["offeringCoin_ContractName"]),
    deployer.address,
    contractParams["fundraising_SoftCapValue"] * 10 ** contractParams["mockPayCoin_Decimals"],
    contractParams["fundraising_HardCapValue"] * 10 ** contractParams["mockPayCoin_Decimals"],
    contractParams["fundraising_PresaleRate"],
    contractParams["fundraising_PublicsaleRate"],
    convertDataStringToUnixTimestamp(contractParams["fundraising_PresaleStartTimeStamp"]),
    contractParams["fundraising_PresaleDurationSeconds"],
    contractParams["fundraising_PublicDurationSeconds"],
    contractParams["fundraising_LockTokenDurationSeconds"]
  );
  await fundraising.deployed();

  // 保存合约地址
  saveContractAddress(
    contractParams["fundraising_ContractName"],
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
