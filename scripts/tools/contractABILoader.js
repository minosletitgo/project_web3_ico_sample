//contractABILoader.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// 递归函数，用于查找指定名称的 ABI 文件
function findABIFile(directory, contractName) {
    let result = null;
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stats = fs.statSync(fullPath);

        //console.log(`${path.basename(fullPath).toString()} -> ${stats.isFile()} -> ${contractName}.json`);

        if (stats.isDirectory()) {
            // 如果是目录，则递归查找
            result = findABIFile(fullPath, contractName);
            if (result) break; // 找到后立即返回
        } else if (stats.isFile() && path.basename(fullPath).toString() === `${contractName}.json`) {
            // 如果是文件且文件名匹配，则返回该文件路径
            return fullPath;
        }
    }

    return result;
}

// 加载 ABI 的函数，接收合约名称作为参数
function loadABI(contractName) {
    try {
        // 获取 ABI 文件的路径
        const abiPath = findABIFile(path.resolve(__dirname, '../../abi'), contractName);

        if (!abiPath) {
            throw new Error(`ABI file for contract ${contractName} not found.`);
        }

        // 读取 ABI 文件内容
        const abiContent = fs.readFileSync(abiPath, 'utf8');

        // 将 ABI JSON 字符串解析为 JavaScript 对象
        const abi = JSON.parse(abiContent);

        return abi;
    } catch (error) {
        console.error(`Failed to load ABI for contract ${contractName}:`, error.message);
        throw error; // 或者选择返回null或默认值
    }
}

// 导出函数以供外界调用
module.exports = {
    loadABI,
  };
  