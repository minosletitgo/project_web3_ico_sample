// mathHelper.js

// 定义 getRandomFloat 函数
function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// 如果还有其他数学工具函数，可以继续定义它们
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; // 包含最小值和最大值
}

/**
 * 计算浮点值对应的百分比并返回格式化的字符串
 * @param {number} value - 浮点值
 * @param {number} decimalPlaces - 小数点后的位数
 * @returns {string} - 格式化的百分比字符串
 */
function printRatio(value, decimalPlaces) {
    if (typeof value !== 'number' || typeof decimalPlaces !== 'number') {
        throw new Error('Invalid input: Both arguments must be numbers');
    }

    const percentage = value * 100;
    return percentage.toFixed(decimalPlaces) + '%';
}

// 导出函数，使其可以在外部被引入
module.exports = {
    getRandomFloat,
    getRandomInt,
    printRatio,
    // 可以继续添加更多的函数...
};