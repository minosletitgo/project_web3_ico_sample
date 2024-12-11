// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Temp {
    uint256 public lastUpdated;

    constructor() {
        lastUpdated = block.timestamp;
    }

    function updateTimestamp() public {
        lastUpdated = block.timestamp;
    }
}
