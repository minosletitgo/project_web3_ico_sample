// contractDeployer.js

const fs = require("fs");
const path = require("path");

// 定义JSON配置文件的位置
const ADDRESS_FILE_PATH = path.join(
  __dirname,
  "../../deployGenerated/contract-addresses.json"
);
const ABI_FILE_PATH = path.join(
  __dirname,
  "../../deployGenerated/contract-abis.json"
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

// 初始化ABI配置文件，如果它不存在的话
function initABIFile() {
  ensureDirectoryExistence(ABI_FILE_PATH);

  if (!fs.existsSync(ABI_FILE_PATH)) {
    fs.writeFileSync(ABI_FILE_PATH, JSON.stringify({}, null, 2));
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

function readABIs() {
  try {
    return JSON.parse(fs.readFileSync(ABI_FILE_PATH, "utf8"));
  } catch (error) {
    console.error("Error reading ABIs file:", error);
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

function writeABIs(data) {
  try {
    fs.writeFileSync(ABI_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to ABIs file:", error);
  }
}

// 存储合约地址
function saveContractAddress(networkName, contractName, address) {
  let addresses = readAddresses();
  if (!addresses[networkName]) {
    addresses[networkName] = {};
  }
  addresses[networkName][contractName] = address;
  writeAddresses(addresses);
}

// 读取合约地址
function readSavedContractAddress(networkName, contractName) {
  const addresses = readAddresses();
  return addresses[networkName] && addresses[networkName][contractName];
}

// 存储合约ABI
function saveContractABI(networkName, contractName, abi) {
  let abis = readABIs();
  if (!abis[networkName]) {
    abis[networkName] = {};
  }
  abis[networkName][contractName] = abi;
  writeABIs(abis);
}

// 读取合约ABI
function readSavedContractABI(networkName, contractName) {
  const abis = readABIs();
  return abis[networkName] && abis[networkName][contractName];
}

// 确保配置文件存在
initAddressFile();
initABIFile();

// 导出函数以供外界调用
module.exports = {
  saveContractAddress,
  readSavedContractAddress,
  saveContractABI,
  readSavedContractABI,
};
