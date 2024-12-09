// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../contracts_openzeppelin/token/ERC20/IERC20.sol";

contract TokenLock {
    address public _owner;
    IERC20 public _tokenMaoMao;  // 待销售的猫猫币
    
    mapping(address => bool) public _authorizedAddresses;    

    struct LockInfo {
        uint256 amount; // 锁仓代币数量
        uint256 releaseTime; // 解锁时间
    }

    mapping(address => LockInfo) public _lockedTokens; // 每个用户的锁仓信息

    event TokensLocked(address indexed user, uint256 amount, uint256 releaseTime);
    event TokensReleased(address indexed user, uint256 amount);

    constructor(address tokenMaoMaoAddress) {
        _owner = msg.sender;

        require(tokenMaoMaoAddress != address(0), "tokenMaoMaoAddress != address(0)");
        _tokenMaoMao = IERC20(tokenMaoMaoAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not the owner");
        _;
    }

    modifier onlyAuthorized() {
        require(_authorizedAddresses[msg.sender], "Caller is not authorized");
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

    // 筹款合约发起"锁仓代币"
    function lockTokens(address user, uint256 amount, uint256 releaseTime) external onlyAuthorized {
        require(releaseTime > block.timestamp, "lockTokens : releaseTime > block.timestamp");
        require(amount > 0, "lockTokens : amount > 0");

        // 将代币转移到锁仓合约
        _tokenMaoMao.transfer(address(this), amount);

        // 更新锁仓信息
        _lockedTokens[user] = LockInfo({
            amount: amount,
            releaseTime: releaseTime
        });

        emit TokensLocked(user, amount, releaseTime);
    }

    // 用户发起"释放锁仓，即取回代币"
    function releaseTokens() external {
        LockInfo memory lockInfo = _lockedTokens[msg.sender];
        require(lockInfo.amount > 0, "No locked tokens");
        require(block.timestamp >= lockInfo.releaseTime, "Tokens are still locked");

        uint256 amount = lockInfo.amount;

        // 清除锁仓记录
        delete _lockedTokens[msg.sender];

        // 将代币转移给用户
        _tokenMaoMao.transfer(msg.sender, amount);

        emit TokensReleased(msg.sender, amount);
    }
}
