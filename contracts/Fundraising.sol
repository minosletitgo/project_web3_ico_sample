// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../contracts_openzeppelin/token/ERC20/IERC20.sol";

/*
    说明：
    0. 本案例使用USDT作为支付货币(而非ETH)。
    0. 新发行代币MMC的机制为，固定供应量的方式，管理员A初始持有所有供应量。
    1. 管理员B部署"筹款合约"。
    2. 管理员A，授权足额(硬顶值)给"筹款合约"。
    -> 管理员A，与管理员B，可以是同一账户。
    3. 当筹款额达到硬顶，则无法继续购买代币。
    -> 只有在"预售期 到 公共售卖期"，是属于自然过渡，其他的状态依赖于外部管理员的介入操作。
    -> 尝试使用"节约gas的方式，来触发异常，如 前端定义数字，链端触发"。
    -> 用户购入代币的同时，直接把代币转入"锁仓合约"。
    -> 在公开售卖期结束后，如果未达到软顶，则需要退款给用户，让用户自行过来取款。
    -> 使用Safe操作，待优化。
*/

contract Fundraising {
    address public _owner;
    address public _ownerTokenMaoMao;
    IERC20 public _tokenUSDT;    // 使用模拟美元代币(原生以太币的获取太麻烦)
    IERC20 public _tokenMaoMao;  // 待销售的猫猫币

    enum SaleState { 
        NotStarted, // 未开始
        Presale,    // 预售期
        PublicSale, // 公开售卖期
        LockToken,  // 锁仓期
        Ended           // 正常结束
    }

    uint256 public _softCap;     //软顶：筹集的最小资金目标
    uint256 public _hardCap;     //硬顶：筹集的最大资金目标

    uint256 public _presaleRate;  // 预售期的代币价格(如，1个USTD 兑换 25个猫猫币)
    uint256 public _publicSaleRate; // 公开售卖期的代币价格(如，1个USTD 兑换 20个猫猫币)

    uint256 public _presaleStartTimeStamp;  // 预售期开始时间戳
    uint256 public _presaleDurationSeconds; // 预售期持续时长(秒)
    uint256 public _publicsaleDurationSeconds; // 公开售卖期持续时长(秒)
    uint256 public _lockTokenDurationSeconds; // 锁仓期持续时长(秒)

    mapping(address => uint256) public _contributions;   // 存储所有投资者的投入资金 
    mapping(address => uint256) public _tokensPurchased; // 存储所有投资者的购入代币    
    uint256 public raisedAmount;// 当前筹集的金额

    event BuyTokenWhenPresale(address indexed buyer, uint256 payAmount, uint256 getAmount);
    event BuyTokenWhenPublicsale(address indexed buyer, uint256 payAmount, uint256 getAmount);
    event JustReachedHardCap(address indexed buyer, uint256 payAmount, uint256 getAmount, uint256 raisedAllAmount);
    event RefundMoney(address indexed buyer, uint256 payAmount, uint256 getAmount);
    event WithdrawMoney(address indexed owner, uint256 moneyAmount);

    modifier onlyOwner() {
        require(msg.sender == _owner, "onlyOwner");
        _;
    }       

    modifier inSaleState() {
        require(getSaleState() == SaleState.Presale || getSaleState() == SaleState.PublicSale, "Not in Sale");
        _;
    }    

    constructor(
        address tokenUSDTAddress,
        address tokenMaoMaoAddress,
        address ownerTokenMaoMao,
        uint256 softCap,
        uint256 hardCap,
        uint256 presaleRate,
        uint256 publicSaleRate,
        uint256 presaleStartTimeStamp,
        uint256 presaleDurationSeconds,
        uint256 publicsaleDurationSeconds,
        uint256 lockTokenDurationSeconds
    ) {
        _owner = msg.sender;

        require(tokenUSDTAddress != address(0), "tokenUSDTAddress != address(0)");
        _tokenUSDT = IERC20(tokenUSDTAddress);

        require(tokenMaoMaoAddress != address(0), "tokenMaoMaoAddress != address(0)");
        _tokenMaoMao = IERC20(tokenMaoMaoAddress);

        require(ownerTokenMaoMao != address(0), "ownerTokenMaoMao != address(0)");
        _ownerTokenMaoMao = ownerTokenMaoMao;

        require(_tokenMaoMao.balanceOf(_ownerTokenMaoMao) > 0, "_tokenMaoMao.balanceOf(_ownerTokenMaoMao) > 0");        

        _softCap = softCap;
        _hardCap = hardCap;
        _presaleRate = presaleRate;
        _publicSaleRate = publicSaleRate;

        require(presaleStartTimeStamp > block.timestamp);
        require(presaleDurationSeconds > 0);
        require(publicsaleDurationSeconds > 0);
        require(lockTokenDurationSeconds > 0);
        _presaleStartTimeStamp = presaleStartTimeStamp;        
        _presaleDurationSeconds = presaleDurationSeconds;
        _publicsaleDurationSeconds = publicsaleDurationSeconds;
        _lockTokenDurationSeconds = lockTokenDurationSeconds;
    }    

    // "获取售卖状态"
    function getSaleState() public view returns (SaleState) {
        require(_presaleStartTimeStamp > 0, "getSaleState exception");

        if (block.timestamp < _presaleStartTimeStamp) {
            return SaleState.NotStarted;
        }
        else if (block.timestamp < _presaleStartTimeStamp + _presaleDurationSeconds) {
            return SaleState.Presale;
        }
        else if (block.timestamp < _presaleStartTimeStamp + _presaleDurationSeconds + _publicsaleDurationSeconds) {
            return SaleState.PublicSale;
        }
        else if (block.timestamp < _presaleStartTimeStamp + _presaleDurationSeconds + _publicsaleDurationSeconds + _lockTokenDurationSeconds) {
            return SaleState.LockToken;
        }

        return SaleState.Ended;
    }

    // 用户发起"购入代币"
    function buyToken(uint256 amount) external inSaleState {
        // 售卖还未开始
        if (getSaleState() == SaleState.NotStarted) {
            revert("buyToken SaleState.NotStarted");
        }

        // 售卖已经结束
        if ((uint8)(getSaleState()) > (uint8)(SaleState.PublicSale)) {
            revert("buyToken SaleState > PublicSale");
        }
        
        // 已经达到硬顶，无法购买
        require(raisedAmount < _hardCap, "already reached hard cap");

        // 前端，必须先取得用户的授权，才能操控USDT
        require(amount > 0, "buyToken amount > 0");

        uint256 tokensToTransfer = 0;        
        if (getSaleState() != SaleState.Presale) {
            tokensToTransfer = amount * _presaleRate;
        }
        else {
            tokensToTransfer = amount * _publicSaleRate;
        }

        // 确保本合约有足额的MMC，可供分配
        require(_tokenMaoMao.allowance(_ownerTokenMaoMao, address(this)) > tokensToTransfer, "_ownerTokenMaoMao, address(this)) > tokensToTransfer");
        
        // 把USDT转入本合约
        _tokenUSDT.transferFrom(msg.sender, address(this), amount);

        // 把用户购入的MMC，转入到锁仓合约
        //_tokenMaoMao.transferFrom();

        _contributions[msg.sender] += amount;
        _tokensPurchased[msg.sender] += tokensToTransfer;

        raisedAmount += tokensToTransfer;

        if (getSaleState() != SaleState.Presale) {
            emit BuyTokenWhenPresale(msg.sender, amount, tokensToTransfer);
        }
        else {
            emit BuyTokenWhenPublicsale(msg.sender, amount, tokensToTransfer);
        }

        if (raisedAmount >= _hardCap)  {
            emit JustReachedHardCap(msg.sender, amount, tokensToTransfer, raisedAmount);
        }
    }

    // 用户发起"退款"
    function refundMoney() external {
        // 退款申请，只在公开售卖期之后
        require(getSaleState() > SaleState.PublicSale, "refundMoney : getSaleState() > SaleState.PublicSale");

        // 有款可退
        uint256 amount = _contributions[msg.sender];
        require(amount > 0, "refundMoney : amount > 0");

        uint tokensToTransfer = _tokensPurchased[msg.sender];
        require(tokensToTransfer > 0, "refundMoney : tokensToTransfer > 0");

        // 把钱退还给用户
       _tokenUSDT.transfer(msg.sender, amount);

       emit RefundMoney(msg.sender, amount, tokensToTransfer);
    }

    // 项目方提取筹集的资金
    function withdrawMoney() external onlyOwner {
        require(getSaleState() == SaleState.Ended, "withdrawMoney: getSaleState() == SaleState.Ended");

        uint256 amount = _tokenUSDT.balanceOf(address(this));
        require(amount > 0, "withdrawMoney : amount > 0");
        _tokenUSDT.transfer(msg.sender, amount);

        emit WithdrawMoney(msg.sender, amount);
    }

    // 查询"本合约持有的筹集资金额度"
    function getBalanceOf() external view returns(uint256) {
        return _tokenUSDT.balanceOf(address(this));
    }

    // 查询"外部管理员授权给本合约的代币额度"
    function getMaoMaoCoinAllowance() external view returns (uint256) {
        return _tokenMaoMao.allowance(_ownerTokenMaoMao, address(this));
    }
}