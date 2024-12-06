const { ethers } = require("hardhat");
const logger = require("../srcs/logger");

async function main() {
  const [deployer] = await ethers.getSigners();

  // 生成10个新钱包
  for (let i = 0; i < 1; i++) {
    const wallet = ethers.Wallet.createRandom();
    logger.info(`${i} -> \n address: ${wallet.address} \n privateKey: ${wallet.privateKey} \n mnemonic.phrase: ${wallet.mnemonic.phrase}`);

    // 给新钱包转账一定的ETH
    const tx = await deployer.sendTransaction({
      to: wallet.address,
      value: ethers.utils.parseEther("100")  // 转账10个ETH
    });

    await tx.wait();
    logger.info(`Transferred 100 ETH to wallet ${wallet.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run .\tests\runAddHardhatAccount.js --network localHardhat

// address: 0xaB41C5cC7806bc2eCaaFA8A8ca32D6DA446246f9 
// privateKey: 0x48af7719fd9bd3d983d562441bac2acd82a6737df9e879fd1397eab4547bcff9 
// mnemonic.phrase: apart mother marriage water arctic fancy episode grocery cage prison carry park
