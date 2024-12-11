// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Temp {
    uint256 public _lastUpdated;    

    constructor() {
        //_lastUpdated = block.timestamp;
    }

    function updateTimestamp() public {
        _lastUpdated = block.timestamp;
    }    
}
