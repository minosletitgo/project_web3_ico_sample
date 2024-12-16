// SPDX-License-Identifier: MIT
pragma solidity =0.5.16;

import "@uniswap/v2-core/contracts/UniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/UniswapV2Pair.sol";
import "hardhat/console.sol";

contract MockExchangeFactory is UniswapV2Factory {
    bytes32 public constant INIT_CODE_PAIR_HASH = keccak256(abi.encodePacked(type(UniswapV2Pair).creationCode));
    constructor(address _feeToSetter) public UniswapV2Factory(_feeToSetter) {}
}
