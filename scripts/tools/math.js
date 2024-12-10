// math.js

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

// 导出函数，使其可以在外部被引入
module.exports = {
    getRandomFloat,
    getRandomInt,
    // 可以继续添加更多的函数...
};