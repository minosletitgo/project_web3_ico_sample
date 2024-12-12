const hre = require("hardhat");
require("dotenv").config();
const logger = require("../scripts/tools/logger");
const { printBlockData } = require("../scripts/tools/timeHelper");

describe(" ", function () {
  before(async function () {
    await printBlockData();
  });

  it(" ", async function () {});
});

/*
    npx hardhat test tests/test_Others.js --network localHardhat
*/
