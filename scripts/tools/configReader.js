// contractManager.js

const fs = require("fs");
const path = require("path");

// 定义合约的静态属性
const STATIC_CONFIG_FILE_PATH = path.join(
  __dirname,
  "../../configManual/contractStatic.json"
);

// 定义合约的参数配置
const PARAMS_CONFIG_FILE_PATH = path.join(
    __dirname,
    "../../configManual/contractParams.json"
  );

function loadContractStatic() {
  try {
    return JSON.parse(fs.readFileSync(STATIC_CONFIG_FILE_PATH, "utf8"));
  } catch (error) {
    console.error("Error loading static config file:", error);
    throw error;
  }
}

function loadContractParams() {
    try {
      return JSON.parse(fs.readFileSync(PARAMS_CONFIG_FILE_PATH, "utf8"));
    } catch (error) {
      console.error("Error loading static config file:", error);
      throw error;
    }
  }

// 导出函数以供外界调用
module.exports = {
  loadContractStatic,
  loadContractParams,
};
