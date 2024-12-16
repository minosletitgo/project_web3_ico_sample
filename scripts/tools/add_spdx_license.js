const fs = require('fs');
const path = require('path');

// 定义项目根目录（假设脚本总是在项目根目录下运行）
const projectRoot = path.resolve(__dirname, '../../');

// 定义需要添加 SPDX 许可证的文件路径
const files = [
  'node_modules/@uniswap/lib/contracts/libraries/TransferHelper.sol',
  'node_modules/@uniswap/v2-core/contracts/interfaces/IERC20.sol',
  'node_modules/@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol',
  'node_modules/@uniswap/v2-core/contracts/interfaces/IUniswapV2ERC20.sol',
  'node_modules/@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol',
  'node_modules/@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol',
  'node_modules/@uniswap/v2-periphery/contracts/interfaces/IERC20.sol',
  'node_modules/@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol',
  'node_modules/@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol',
  'node_modules/@uniswap/v2-periphery/contracts/interfaces/IWETH.sol'
];

files.forEach(file => {
  const filePath = path.resolve(projectRoot, file); // 使用项目根目录定位文件
  try {
    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      const content = `// SPDX-License-Identifier: UNLICENSED\n` + fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`SPDX license identifier added to ${file}`);
    } else {
      console.error(`File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
  }
});

console.log('SPDX license identifier added to all specified files.');





/*
    project_web3_test_ico/
    ├─ node_modules/
    ├─ scripts/
        ├─ tools/
            ├─ add_spdx_license.js
    ├─ package.json
  
    由于UniswapV2的代码，使用的Solidity版本比较久远，有一些额外错误，这里简单处理一下(补充许可证描述)

    node scripts\tools\add_spdx_license.js
*/