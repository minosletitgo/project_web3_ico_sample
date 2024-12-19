// contractDeployer.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// 定义JSON配置文件的位置
const ADDRESS_FILE_PATH = path.join(
  __dirname,
  "../deployGenerated/contract-addresses.json"
);

// 自动创建目录文件夹
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// 初始化地址配置文件，如果它不存在的话
function initAddressFile() {
  ensureDirectoryExistence(ADDRESS_FILE_PATH);

  if (!fs.existsSync(ADDRESS_FILE_PATH)) {
    fs.writeFileSync(ADDRESS_FILE_PATH, JSON.stringify({}, null, 2));
  }
}

// 从配置文件中读取数据
function readAddresses() {
  try {
    return JSON.parse(fs.readFileSync(ADDRESS_FILE_PATH, "utf8"));
  } catch (error) {
    console.error("Error reading addresses file:", error);
    return {};
  }
}

// 将数据写入配置文件
function writeAddresses(data) {
  try {
    fs.writeFileSync(ADDRESS_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to addresses file:", error);
  }
}

// 存储合约地址
function saveContractAddress(contractName, address) {
  let networkName = hre.network.name;
  let addresses = readAddresses();
  if (!addresses[networkName]) {
    addresses[networkName] = {};
  }
  addresses[networkName][contractName] = address;
  writeAddresses(addresses);
}

// 读取合约地址
function readSavedContractAddress(contractName) {
  let networkName = hre.network.name;
  const addresses = readAddresses();
  return addresses[networkName] && addresses[networkName][contractName];
}

// 确保配置文件存在
initAddressFile();

// 导出函数以供外界调用
module.exports = {
  saveContractAddress,
  readSavedContractAddress,
};
