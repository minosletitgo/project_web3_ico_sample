const fs = require('fs');
const path = require('path');

// 定义输入文件和输出文件的路径
// 请根据实际情况调整这些路径
const inputFilePath = path.resolve(__dirname, '../../hardhat_node.md');
const outputFilePath = path.resolve(__dirname, '../../hardhat_private_keys.env');

// 读取输入文件内容
fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // 使用正则表达式匹配私钥
    const privateKeyPattern = /Private Key: (0x[a-fA-F0-9]{64})/g;
    let match;
    let privateKeys = [];

    while ((match = privateKeyPattern.exec(data)) !== null) {
        privateKeys.push(match[1]);
    }

    // 构建输出内容
    let outputContent = '';
    privateKeys.forEach((key, index) => {
        outputContent += `PRIVATE_KEY_localHardhat_${index}=${key}\n`;
    });

    // 写入输出文件
    fs.writeFile(outputFilePath, outputContent, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log(`Successfully wrote ${privateKeys.length} private keys to ${outputFilePath}`);
    });
});

/*
    快速生成 Hardhat Node 的私钥列表，可以方便的填写到.env
    node .\scripts\tools\exportHardhatPrivateKeys.js
*/