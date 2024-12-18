const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { loadContractParams } = require("../scripts/tools/configReader");
const { readSavedContractAddress } = require("../scripts/tools/contractAddressLoader");
const { loadABI } = require("../scripts/tools/contractABILoader");
const { getCurrentUnixTimestampSec, convertUnixTimestampToDataString } = require("../scripts/tools/timeHelper");
const { printRatio } = require("../scripts/tools/mathHelper");
const { BigNumber } = require("ethers");

async function executeBlockRunner(contractBlockRunner, needBlockCount) {
  // 执行"区块步数模拟器"
  logger.info(`executeBlockRunner...`);
  if (needBlockCount > 0) {
    for (let i = 0; i < needBlockCount; i++) {
      await contractBlockRunner.updateTimestamp();
    }
  }
}

async function printAllValue(contractFundraising, contractMockPayCoin, contractOfferingCoin, contractOfferingCoinLocker, oprSigner) {
  logger.info(`查询合约的常规数据`);
  let _presaleStartTimeStamp = await contractFundraising._presaleStartTimeStamp();
  let _publicsaleStartTimeStamp = _presaleStartTimeStamp.add(await contractFundraising._presaleDurationSeconds());
  let _lockTokenStartTimeStamp = _publicsaleStartTimeStamp.add(await contractFundraising._publicsaleDurationSeconds());
  let _EndStartTimeStamp = _lockTokenStartTimeStamp.add(await contractFundraising._lockTokenDurationSeconds());

  let _softCap = await contractFundraising._softCap();
  let _hardCap = await contractFundraising._hardCap();
  let _raisedAmount = await contractFundraising._raisedAmount();

  logger.info(`_owner -> ${await contractFundraising._owner()}`);
  logger.info(`_ownerOfTokenOffering -> ${await contractFundraising._ownerOfTokenOffering()}`);
  logger.info(`_tokenMockPayCoin -> ${await contractFundraising._tokenMockPayCoin()}`);
  logger.info(`_tokenOffering -> ${await contractFundraising._tokenOffering()}`);
  logger.info(`_softCap -> ${_softCap}`);
  logger.info(`_hardCap -> ${_hardCap}`);
  logger.info(`_presaleRate -> ${await contractFundraising._presaleRate()}`);
  logger.info(`_publicSaleRate -> ${await contractFundraising._publicSaleRate()}`);
  logger.info(` -> ${convertUnixTimestampToDataString(getCurrentUnixTimestampSec())} -> localNowTimeStamp`);
  logger.info(` -> ${convertUnixTimestampToDataString(_presaleStartTimeStamp)} -> _presaleStartTimeStamp`);
  logger.info(` -> ${convertUnixTimestampToDataString(_publicsaleStartTimeStamp)} -> _publicsaleStartTimeStamp`);
  logger.info(` -> ${convertUnixTimestampToDataString(_lockTokenStartTimeStamp)} -> _lockTokenStartTimeStamp`);
  logger.info(` -> ${convertUnixTimestampToDataString(_EndStartTimeStamp)} -> _EndStartTimeStamp`);
  logger.info(`_raisedAmount -> ${_raisedAmount}`);
  logger.info(`getSaleState -> ${await contractFundraising.getSaleState()}`);
  logger.info(`getBalanceOfMockPayCoin -> ${await contractFundraising.getBalanceOfMockPayCoin()}`);
  logger.info(`getOfferingCoinAllowance -> ${await contractFundraising.getOfferingCoinAllowance()}`);
  logger.info(`softCapRatio -> ${printRatio(_raisedAmount / _softCap, 2)}`);
  logger.info(`hardCapRatio -> ${printRatio(_raisedAmount / _hardCap, 2)}`);
  logger.info(`------------------------------------------------------`);
  logger.info(`${oprSigner.address} contractFundraising._contributions -> ${await contractFundraising._contributions(oprSigner.address)}`);
  logger.info(`${oprSigner.address} contractFundraising._tokensPurchased -> ${await contractFundraising._tokensPurchased(oprSigner.address)}`);
  logger.info(`------------------------------------------------------`);
  logger.info(`${oprSigner.address} contractMockPayCoin.balanceOf -> ${await contractMockPayCoin.balanceOf(oprSigner.address)}`);
  logger.info(`${oprSigner.address} contractOfferingCoin.balanceOf -> ${await contractOfferingCoin.balanceOf(oprSigner.address)}`);
  logger.info(`------------------------------------------------------`);
  let resultLockInfo = await contractOfferingCoinLocker.getLockInfo(oprSigner.address);
  logger.info(`${oprSigner.address} contractOfferingCoinLocker.lockAmount -> ${resultLockInfo[0]}`);
  logger.info(`${oprSigner.address} contractOfferingCoinLocker.lockReleaseTime -> ${resultLockInfo[1]}`);
  //logger.info(`${oprSigner.address} contractOfferingCoinLocker.lockReleaseTime -> ${convertUnixTimestampToDataString(lockReleaseTime)}`);
}

async function buyToken(contractFundraising, amount) {
  await contractFundraising.buyToken(amount);
}

async function refundMoney(contractFundraising) {
  await contractFundraising.refundMoney();
}

async function withdrawMoney(contractFundraising) {
  await contractFundraising.withdrawMoney();
}

async function releaseTokens(contractFundraising) {
  await contractFundraising.releaseTokens();
}

async function printPairAllValue(contractTargetPair, allSigner) {
  for (let i = 0; i < allSigner.length; i++) {
    let singleSigner = allSigner[i];
    logger.info(`contractTargetPair.balanceOf(${singleSigner.address}) = ${await contractTargetPair.balanceOf(singleSigner.address)}`)
  }
}

async function addLiquidity(contractRouter, tokenA, tokenB, amountA, amountB, oprSigner, deadline) {
  await contractRouter.addLiquidity(
    tokenA, tokenB,
    amountA, amountB, 
    1, 1,
    oprSigner.address,
    deadline
  );
}

async function printFarmingAllValue(contractFarming, pId, allSigners) {
  logger.info(`contractFarming.balanceOfRewardToken() = ${await contractFarming.balanceOfRewardToken()}`);
  logger.info(`contractFarming.m_startBlockNum() = ${await contractFarming.m_startBlockNum()}`);
  logger.info(`contractFarming.m_endBlockNum() = ${await contractFarming.m_endBlockNum()}`);

  for (let i = 0; i < allSigners.length; i++) {
    let singleSigner = allSigners[i];    
    logger.info(`contractFarming.pendingShowRewardTokenAmount(${pId}, ${singleSigner.address}) = ${await contractFarming.pendingShowRewardTokenAmount(pId, singleSigner.address)}`);
  }
}

// 导出函数以供外界调用
module.exports = {
  executeBlockRunner,
  printAllValue,
  buyToken,
  refundMoney,
  withdrawMoney,
  releaseTokens,
  printPairAllValue,
  addLiquidity,
  printFarmingAllValue,  
};
