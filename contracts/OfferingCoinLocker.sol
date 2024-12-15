// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../contracts_openzeppelin/token/ERC20/IERC20.sol";
import "../contracts_openzeppelin/token/ERC20/utils/SafeERC20.sol";
//import "hardhat/console.sol";

contract OfferingCoinLocker {
    address public _owner;
    IERC20 public _tokenOffering;  // 待销售的代币
    
    mapping(address => bool) public _authorizedAddresses;    

    struct LockInfo {
        uint256 amount; // 锁仓代币数量
        uint256 releaseTime; // 解锁时间
    }

    mapping(address => LockInfo) public _lockedTokens; // 每个用户的锁仓信息

    event TokensLocked(address indexed user, uint256 amount, uint256 releaseTime);
    event TokensReleased(address indexed user, uint256 amount);

    constructor(address tokenOfferingAddress) {
        _owner = msg.sender;

        require(tokenOfferingAddress != address(0), "tokenOfferingAddress != address(0)");
        _tokenOffering = IERC20(tokenOfferingAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "OfferingCoinLocker: onlyOwner");
        _;
    }

    modifier onlyAuthorized() {
        require(_authorizedAddresses[msg.sender], "OfferingCoinLocker: onlyAuthorized");
        _;
    }    

    // 添加权限管理员
    function addAuthorizedAddress(address addr) external onlyOwner {
        _authorizedAddresses[addr] = true;
    }

    // 移除权限管理员
    function removeAuthorizedAddress(address addr) external onlyOwner {
        _authorizedAddresses[addr] = false;
    }    

    // "筹款合约"发起"锁仓代币"
    function lockTokens(address user, uint256 amount, uint256 releaseTime) external onlyAuthorized {
        require(releaseTime > block.timestamp, "lockTokens : releaseTime > block.timestamp");
        require(amount > 0, "lockTokens : amount > 0");

        // 更新锁仓信息(覆盖)
        _lockedTokens[user].amount = amount;
        _lockedTokens[user].releaseTime = releaseTime;

        emit TokensLocked(user, amount, releaseTime);
    }

    // "筹款合约"替用户 发起"释放锁仓，即取回代币"
    function releaseTokens(address user) external onlyAuthorized {
        LockInfo memory lockInfo = _lockedTokens[user];
        require(lockInfo.amount > 0, "releaseTokens: No locked tokens");
        require(block.timestamp >= lockInfo.releaseTime, "releaseTokens: Tokens are still locked");

        uint256 amount = lockInfo.amount;

        // 清除锁仓记录
        delete _lockedTokens[user];

        // 将代币转移给用户
        SafeERC20.safeTransfer(_tokenOffering, user, amount);

        emit TokensReleased(user, amount);
    }

    function getLockInfo(address user) external view returns(uint256, uint256) {
        LockInfo memory lockInfo = _lockedTokens[user];
        //console.log("getLockInfo %x -> %d, %d", user, lockInfo.amount, lockInfo.releaseTime);
        return (lockInfo.amount, lockInfo.releaseTime);
    }
}
