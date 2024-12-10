// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../contracts_openzeppelin/token/ERC20/IERC20.sol";

contract MaoMao is IERC20 {
    string public _name;
    string public _symbol;
    uint8 public _decimal;
    uint256 public _totalSupply;
    mapping(address => uint256) _balanceOf;
    mapping(address => mapping(address => uint256)) _allowance;

    constructor(string memory name, string memory symbol, uint256 initSupply, uint8 decimal) {
        _name = name;
        _symbol = symbol;
        _decimal = decimal;
        _totalSupply = initSupply;
        
        // 固定总供应量，直接给管理员
        _balanceOf[msg.sender] = _totalSupply;

        // 注意：初始代币的铸造行为，是来自于0地址。
        // emit Transfer(address(this), msg.sender, _totalSupply);
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    function totalSupply() external view override returns (uint256) {
        return  _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        require(account != address(0), "account != address(0)");
        return _balanceOf[account];
    }

    function transfer(address to, uint256 value) external override returns (bool) {
        require(to != address(0), "to != address(0)");
        require(_balanceOf[msg.sender] >= value, "_balanceOf[msg.sender] >= value");

        _balanceOf[msg.sender] -= value;
        _balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }   

    function transferFrom(address from, address to, uint256 value) external override returns (bool) {
        require(from != address(0), "from != address(0)");
        require(to != address(0), "to != address(0)");
        require(_balanceOf[from] >= value, "_balanceOf[from] >= value");
        require(_allowance[from][msg.sender] >= value, "_allowance[from][msg.sender] >= value");

        _allowance[from][msg.sender] -= value;
        _balanceOf[from] -= value;
        _balanceOf[to] += value;

        emit Transfer(from, to, value);
        return true;
    }
    
    function approve(address to, uint256 value) external override returns (bool) {
        require(to != address(0), "to != address(0)");
        //注意：为最大限度的放开授权行为，无需检查余额。
        //require(_balanceOf[msg.sender] >= value, "_balanceOf[msg.sender] >= value");

        _allowance[msg.sender][to] = value;

        emit Approval(msg.sender, to, value);
        return true;
    }   

    function allowance(address from, address to) external view override returns (uint256) {
        return _allowance[from][to];
    }   
}