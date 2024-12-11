// 首先安装 date-fns 和 date-fns/locale（如果需要）
// npm install date-fns@3.6.0

const { parse, format, isValid } = require("date-fns");

/**
 * 获取当前Unix时间戳（秒）
 * @returns {number} 当前时间戳（秒）
 */
function getCurrentUnixTimestampSec() {
  const currentTimestampMs = new Date().getTime();
  return Math.floor(currentTimestampMs / 1000);
}

/**
 * 将Unix时间戳（秒）转换为指定格式的时间字符串
 * @param {number} timestamp - Unix时间戳（秒）
 * @param {string} [formatString="yyyy-MM-dd HH:mm:ss"] - 输出格式，默认为 "yyyy-MM-dd HH:mm:ss"
 * @returns {string | null} 格式化后的日期字符串或null（如果时间戳无效）
 */
function convertUnixTimestampToDataString(
  timestamp,
  formatString = "yyyy-MM-dd HH:mm:ss"
) {
  // 检查时间戳是否有效
  if (isNaN(timestamp) || !isFinite(timestamp)) {
    console.error("Invalid timestamp:", timestamp);
    return null;
  }

  // 创建Date对象
  const date = new Date(timestamp * 1000);

  // 检查日期是否有效
  if (!isValid(date)) {
    console.error("Invalid date from timestamp:", timestamp);
    return null;
  }

  // 格式化日期
  return format(date, formatString);
}

/**
 * 将时间字符串转换为Unix时间戳（秒）
 * @param {string} timeString - 时间字符串
 * @param {string} [formatString="yyyy-MM-dd HH:mm:ss"] - 时间格式，默认为 "yyyy-MM-dd HH:mm:ss"
 * @returns {number | null} Unix时间戳（秒）或null（如果时间字符串无效）
 *
 * 示例：
 * const timeString = "2024-12-11 15:12:09";
 *
 */
function convertDataStringToUnixTimestamp(
  timeString,
  formatString = "yyyy-MM-dd HH:mm:ss"
) {
  // 解析时间字符串
  const date = parse(timeString, formatString, new Date());

  // 检查日期是否有效
  if (!isValid(date)) {
    console.error("Invalid date:", timeString);
    return null;
  }

  // 转换为Unix时间戳（以秒为单位）
  return Math.floor(date.getTime() / 1000);
}

async function autoSetNextBlockTimestamp() {
  if (hre.network.name === "localHardhat") {
    // 在本地Hardhat开启的测试链，即使新产生区块，block.timestamp 也不会更新到真实时间戳。
    // 故，这里强行设置一次，让它趋近于真实的时间戳
    await hre.network.provider.send("evm_setNextBlockTimestamp", [getCurrentUnixTimestampSec()]);
  }
}

module.exports = {
  getCurrentUnixTimestampSec,
  convertUnixTimestampToDataString,
  convertDataStringToUnixTimestamp,
  autoSetNextBlockTimestamp,
};
