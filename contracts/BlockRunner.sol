// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

// 区块步数模拟器，供外界执行区块计数

contract BlockRunner {
    uint256 public _lastUpdated;    

    constructor() {
        //_lastUpdated = block.timestamp;
    }

    function updateTimestamp() public {
        _lastUpdated = block.timestamp;
    }
}
