// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../contracts_openzeppelin/token/ERC20/IERC20.sol";
import "../contracts_openzeppelin/token/ERC20/utils/SafeERC20.sol";
import "../contracts_openzeppelin/utils/ReentrancyGuard.sol";
import "./OfferingCoinLocker.sol";
//import "hardhat/console.sol";//调试Log，正式版记得注销掉

/*
    说明：
    0. 本案例使用模拟美元作为支付货币(而非ETH)。
    0. 新发行代币MMC的机制为，固定供应量的方式，管理员A初始持有所有供应量。
    1. 管理员B部署"筹款合约"。
    2. 管理员A，授权足额(硬顶值)给"筹款合约"。
    -> 管理员A，与管理员B，可以是同一账户。
    3. 当筹款额达到硬顶，则无法继续购买代币。
    -> 用户购入代币的同时，直接把代币转入"锁仓合约"。
    -> 可以尝试使用"节约gas的方式，来触发异常，如 前端定义数字，链端触发"。    
    -> 在公开售卖期结束后，如果未达到软顶，则需要退款给用户，通知用户让他自行过来取款。
*/

contract Fundraising is ReentrancyGuard{
    address public _owner;
    address public _ownerOfTokenOffering;

    IERC20 public _tokenMockPayCoin;    // 使用模拟美元代币(原生以太币的获取太麻烦)
    uint8 public _decimalsOfMockPayCoin;

    IERC20 public _tokenOfferingCoin;  // 待销售的代币
    uint8 public _decimalsOfOfferingCoin;

    OfferingCoinLocker public _offeringCoinLocker;

    enum SaleState { 
        NotStarted, // 未开始
        Presale,    // 预售期
        PublicSale, // 公开售卖期
        LockToken,  // 锁仓期
        Ended       // 正常结束
    }

    uint256 public _softCap;     //软顶：筹集的最小资金目标
    uint256 public _hardCap;     //硬顶：筹集的最大资金目标

    uint256 public _presaleRate;  // 预售期的代币价格(如，1个USTD 兑换 25个发行代币)
    uint256 public _publicSaleRate; // 公开售卖期的代币价格(如，1个USTD 兑换 20个发行代币)

    uint256 public _presaleStartTimeStamp;  // 预售期开始时间戳
    uint256 public _presaleDurationSeconds; // 预售期持续时长(秒)
    uint256 public _publicsaleDurationSeconds; // 公开售卖期持续时长(秒)
    uint256 public _lockTokenDurationSeconds; // 锁仓期持续时长(秒)

    mapping(address => uint256) public _contributions;   // 存储所有投资者的投入资金 
    mapping(address => uint256) public _tokensPurchased; // 存储所有投资者的购入代币    
    uint256 public _raisedAmount;// 当前筹集的金额

    event BuyTokenWhenPresale(address indexed buyer, uint256 payAmount, uint256 getAmount);
    event BuyTokenWhenPublicsale(address indexed buyer, uint256 payAmount, uint256 getAmount);
    event JustReachedHardCap(address indexed buyer, uint256 payAmount, uint256 getAmount, uint256 raisedAllAmount);
    event RefundMoney(address indexed buyer, uint256 payAmount, uint256 getAmount);
    event WithdrawMoney(address indexed owner, uint256 moneyAmount);

    modifier onlyOwner() {
        require(msg.sender == _owner, "OfferingCoinLocker: onlyOwner");
        _;
    }

    modifier onlyNotOwner() {
        require(msg.sender != _owner, "OfferingCoinLocker: onlyNotOwner");
        _;
    }    

    // modifier inSaleState() {
    //     require(getSaleState() == SaleState.Presale || getSaleState() == SaleState.PublicSale, "Not in Sale");
    //     _;
    // }    

    constructor(
        address tokenMockPayCoinAddress,
        uint8 decimalsOfMockPayCoin,
        address tokenOfferingCoinAddress,
        uint8 decimalsOfOfferingCoin,
        address ownerOfTokenOffering,
        address offeringCoinLockerAddress,
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

        require(tokenMockPayCoinAddress != address(0), "tokenMockPayCoinAddress != address(0)");
        _tokenMockPayCoin = IERC20(tokenMockPayCoinAddress);
        require(decimalsOfMockPayCoin > 0, "decimalsOfMockPayCoin > 0");

        require(tokenOfferingCoinAddress != address(0), "tokenOfferingAddress != address(0)");
        _tokenOfferingCoin = IERC20(tokenOfferingCoinAddress);
        require(decimalsOfOfferingCoin > 0, "decimalsOfOfferingCoin > 0");
        
        require(decimalsOfOfferingCoin > decimalsOfMockPayCoin, "decimalsOfOfferingCoin > decimalsOfMockPayCoin");

        require(ownerOfTokenOffering != address(0), "ownerOfTokenOffering != address(0)");
        _ownerOfTokenOffering = ownerOfTokenOffering;

        require(_tokenOfferingCoin.balanceOf(_ownerOfTokenOffering) > 0, "_tokenOffering.balanceOf(_ownerOfTokenOffering) > 0");  

        require(offeringCoinLockerAddress != address(0), "offeringCoinLockerAddress != address(0)");        
        _offeringCoinLocker = OfferingCoinLocker(offeringCoinLockerAddress);
        
        _softCap = softCap;
        _hardCap = hardCap;
        _presaleRate = presaleRate;
        _publicSaleRate = publicSaleRate;

        //console.log("presaleStartTimeStamp(%d) > block.timestamp(%d)", presaleStartTimeStamp, block.timestamp);
        require(presaleStartTimeStamp > block.timestamp, "presaleStartTimeStamp > block.timestamp");
        require(presaleDurationSeconds > 0, "presaleDurationSeconds > 0");
        require(publicsaleDurationSeconds > 0, "publicsaleDurationSeconds > 0");
        require(lockTokenDurationSeconds > 0, "lockTokenDurationSeconds > 0");
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
    function buyToken(uint256 amount) external onlyNotOwner nonReentrant {
        // 售卖还未开始
        if (getSaleState() == SaleState.NotStarted) {
            revert("buyToken SaleState.NotStarted");
        }

        // 售卖已经结束
        if ((uint8)(getSaleState()) > (uint8)(SaleState.PublicSale)) {
            revert("buyToken SaleState > PublicSale");
        }
        
        // 已经达到硬顶，无法购买
        require(_raisedAmount < _hardCap, "already reached hard cap");

        // 前端，必须先取得用户的授权，才能操控MockPayCoin
        require(amount > 0, "buyToken amount > 0");
        
        uint256 tokensToTransfer = 0;        
        if (getSaleState() != SaleState.Presale) {
            // 1 * 10 ** decimals_MockPayCoin -> 20 * 10 ** decimals_OfferingCoin
            tokensToTransfer = amount * _presaleRate * 10 ** (_decimalsOfOfferingCoin - _decimalsOfMockPayCoin);
        }
        else {
            // 1 * 10 ** decimals_MockPayCoin -> 25 * 10 ** decimals_OfferingCoin
            tokensToTransfer = amount * _publicSaleRate * 10 ** (_decimalsOfOfferingCoin - _decimalsOfMockPayCoin);
        }

        // 确保本合约有足额的MMC，可供分配
        require(_tokenOfferingCoin.allowance(_ownerOfTokenOffering, address(this)) > tokensToTransfer, "_ownerOfTokenOffering, address(this)) > tokensToTransfer");
        
        // 把MockPayCoin转入本合约
        SafeERC20.safeTransferFrom(_tokenMockPayCoin, msg.sender, address(this), amount);

        // 把用户购入的MMC，转入到锁仓合约
        SafeERC20.safeTransferFrom(_tokenOfferingCoin, _ownerOfTokenOffering, address(_offeringCoinLocker), tokensToTransfer);
        // 更新锁仓信息
        _offeringCoinLocker.lockTokens(msg.sender, tokensToTransfer, _presaleStartTimeStamp + _presaleDurationSeconds + _publicsaleDurationSeconds + _lockTokenDurationSeconds);


        _contributions[msg.sender] += amount;
        _tokensPurchased[msg.sender] += tokensToTransfer;

        _raisedAmount += amount;

        if (getSaleState() != SaleState.Presale) {
            emit BuyTokenWhenPresale(msg.sender, amount, tokensToTransfer);
        }
        else {
            emit BuyTokenWhenPublicsale(msg.sender, amount, tokensToTransfer);
        }

        if (_raisedAmount >= _hardCap)  {
            emit JustReachedHardCap(msg.sender, amount, tokensToTransfer, _raisedAmount);
        }
    }

    // 用户发起"退款"
    function refundMoney() external onlyNotOwner nonReentrant {
        // 退款申请，只在公开售卖期之后
        require(getSaleState() > SaleState.PublicSale, "refundMoney : getSaleState() > SaleState.PublicSale");
        // 筹款额度，未达到软顶
        require(_raisedAmount < _softCap, "refundMoney : _raisedAmount < _softCap");

        // 有款可退
        uint256 amount = _contributions[msg.sender];
        require(amount > 0, "refundMoney : amount > 0");

        uint tokensToTransfer = _tokensPurchased[msg.sender];
        require(tokensToTransfer > 0, "refundMoney : tokensToTransfer > 0");

        // 把"模拟支付代币"退还给用户
       SafeERC20.safeTransfer(_tokenMockPayCoin, msg.sender, amount);

        // 更新记录
       _contributions[msg.sender] -= amount;

       emit RefundMoney(msg.sender, amount, tokensToTransfer);
    }

    // 项目方发起"提款"
    function withdrawMoney() external onlyOwner nonReentrant {
        // 提款，锁仓期才可以
        require(getSaleState() >= SaleState.LockToken, "withdrawMoney: getSaleState() >= SaleState.LockToken");
        // 筹款额度，达到软顶
        require(_raisedAmount >= _softCap, "refundMoney : _raisedAmount >= _softCap");

        // 有款可提
        uint256 amount = _tokenMockPayCoin.balanceOf(address(this));
        require(amount > 0, "withdrawMoney : amount > 0");

        // 把"模拟支付代币"转给管理员
        SafeERC20.safeTransfer(_tokenMockPayCoin, msg.sender, amount);

        emit WithdrawMoney(msg.sender, amount);
    }

    // 用户发起"释放锁仓币"
    function releaseTokens() external nonReentrant {
        // 锁仓期结束，才可以
        require(getSaleState() == SaleState.Ended, "releaseTokens: getSaleState() == SaleState.Ended");

        _offeringCoinLocker.releaseTokens(msg.sender);
    }

    // 查询"本合约持有的筹集资金额度"
    function getBalanceOfMockPayCoin() external view returns(uint256) {
        return _tokenMockPayCoin.balanceOf(address(this));
    }

    // 查询"外部管理员授权给本合约的代币额度"
    function getOfferingCoinAllowance() external view returns (uint256) {
        return _tokenOfferingCoin.allowance(_ownerOfTokenOffering, address(this));
    }


    
    
    
    
    
    
    
    //////////////////////////定义一些DEBUG事件 - 正式版本注销掉/////////////////////////////////
    // function debug_GetBlockTimeStamp() external view returns(uint256)  {
    //     return (block.timestamp);
    // }
}