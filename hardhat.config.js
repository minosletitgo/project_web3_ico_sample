require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter")
require('hardhat-abi-exporter');
require("dotenv").config();

// // 执行verify验证合约命令的时候，打开下面代码！
// {
//   // 引入所需的模块
//   const { ProxyAgent, setGlobalDispatcher } = require('undici');

//   // 创建并设置全局代理
//   const proxyAgent = new ProxyAgent('http://127.0.0.1:7890');
//   setGlobalDispatcher(proxyAgent);
// }


module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },        
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },      
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true // 启用通过IR编译
        },
      },
    ],    
  },
  networks: {
    localHardhat: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: [
        process.env.PRIVATE_KEY_localHardhat_0,
        process.env.PRIVATE_KEY_localHardhat_1,
        process.env.PRIVATE_KEY_localHardhat_2,
        process.env.PRIVATE_KEY_localHardhat_3,
        process.env.PRIVATE_KEY_localHardhat_4,
        process.env.PRIVATE_KEY_localHardhat_5,
        process.env.PRIVATE_KEY_localHardhat_6,
        process.env.PRIVATE_KEY_localHardhat_7,
        process.env.PRIVATE_KEY_localHardhat_8,
        process.env.PRIVATE_KEY_localHardhat_9,
        process.env.PRIVATE_KEY_localHardhat_10,
        process.env.PRIVATE_KEY_localHardhat_11,
        process.env.PRIVATE_KEY_localHardhat_12,
        process.env.PRIVATE_KEY_localHardhat_13,
        process.env.PRIVATE_KEY_localHardhat_14,
        process.env.PRIVATE_KEY_localHardhat_15,
        process.env.PRIVATE_KEY_localHardhat_16,
        process.env.PRIVATE_KEY_localHardhat_17,
        process.env.PRIVATE_KEY_localHardhat_18,
        process.env.PRIVATE_KEY_localHardhat_19
      ],
      loggingEnabled: true, // 启用日志记录
      allowBlocksWithSameTimestamp: false,
    },
    sepolia: {
      url: process.env.PRIVATE_URL_ETH_Sepolia,
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY_sepolia],
    }    
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY_sepolia,
    },
  },
  gasReporter: {
    enabled: true, // 启用 gas reporter
    currency: 'USD', // 货币单位（可以是 'USD', 'ETH', 'EUR' 等）
    gasPrice: 20, // gas price (单位: gwei)
    outputFile: 'gas-report.txt', // 指定输出报告的文件路径
    noColors: true, // 禁用颜色输出（默认为 false）
    showTimeSpent: true, // 显示每个测试用例的执行时间
    showMethodSig: true, // 显示方法签名
    excludeContracts: ['Migrations'], // 排除不需要报告的合约
  },
  abiExporter: {
    runOnCompile: true, // 这行很重要，确保每次编译都会导出 ABI
    path: './abi', // ABI 文件的输出目录
    clear: true,    // 每次生成时清空输出目录
    flat: false,     // 是否将所有 ABI 写入一个文件
  },  
  mocha: {
    reporter: 'list', // 这里指定了Mocha的reporter
  },  
};