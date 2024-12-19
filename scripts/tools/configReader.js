// contractManager.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// 定义合约的参数配置
const PARAMS_CONFIG_FILE_PATH = path.join(
  __dirname,
  "../configs/contractParams.json"
);

function loadContractParams() {
  try {
    return JSON.parse(fs.readFileSync(PARAMS_CONFIG_FILE_PATH, "utf8"))[
      hre.network.name
    ];
  } catch (error) {
    console.error("Error loading static config file:", error);
    throw error;
  }
}

// 导出函数以供外界调用
module.exports = {
  loadContractParams,
};
