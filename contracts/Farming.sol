// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../contracts_openzeppelin/token/ERC20/IERC20.sol";
import "../contracts_openzeppelin/token/ERC20/utils/SafeERC20.sol";
import "../contracts_openzeppelin/access/Ownable.sol";
import "./utils/SimpleSafeMath.sol";
import "../contracts/myTokens/MaoMao.sol";

import "hardhat/console.sol";

/*
    0x1DaeD74ed1dD7C9Dabbe51361ac90A69d851234D
    2020-09-09 - MasterChef - 生鱼片农场合约

    0xb00381dcaf378664b32596a612c2c83de4a81dc0
    2020-12-04 - FlamingFarm - 火焰农场合约
    
    本合约魔改一下：
    . 使用"非增发"模式
    . 初始后，外部管理员必须向本合约，转入足够的代币，用于用户参与挖矿的奖励

    关于如何影响"年化收益率"：
    . 大体上，是通过modifyPool，更改池子的奖励权重来实现
    . 本合约并没有显性的定义"年化收益率"
    . 如果项目方需要设置"年化收益率"，必定需要定期来"调整奖励影响元素"，因为用户的存取对于奖励的影响波动是巨大的
*/

contract Farming is Ownable {
    struct UserInfo {
        uint256 amount;         // 用户存入lp凭证代币的额度
        uint256 rewardDebt;     // 用户的奖励债务，用于奖励计算(后续公式具体分析)
    }

    struct PoolInfo {
        IERC20 lpToken;             // lp凭证代币
        uint256 allocPoint;         // 分配的奖励权重（权重越高，奖励越多）     
        uint256 lastRewardBlock;    // 上次奖励分配的区块高度
        uint256 accRewardTokenPerShare; // 每份lp token累积的 rewardToken 奖励，放大 1e12 倍(即，使用它做运算的时候，需要除以1e12)
    }

    using SimpleSafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for MaoMao;

    MaoMao public m_rewardToken;

    uint256 public m_startBlockNum; // 挖矿奖励的开始区块Id
    uint256 public m_endBlockNum;   // 挖矿奖励的结束区块Id
    uint256 public m_rewardTokenPerBlock;    // 每个区块生成奖励的额度
    uint256 public m_totalAllocPoint = 0;    // 总体奖励的权重
    uint256 public constant BONUS_MULTIPLIER = 10; // 奖励的倍增值

    PoolInfo[] public m_poolInfo;   // lp凭证代币池
    mapping (uint256 => mapping (address => UserInfo)) public m_userInfo; // 用户质押在池中的信息

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

    constructor(MaoMao rewardToken, uint256 rewardTokenPerBlock, uint256 startBlockNum, uint256 endBlockNum) Ownable(msg.sender) {
        m_rewardToken = rewardToken;
        m_rewardTokenPerBlock = rewardTokenPerBlock;
        m_startBlockNum = startBlockNum;        
        m_endBlockNum = endBlockNum;        
    }

    function poolLength() external view returns (uint256) {
        return m_poolInfo.length;
    }

    // 管路员添加lp凭证代币池
    function addPool(uint256 allocPoint, IERC20 lpToken, bool withUpdate) public onlyOwner {
        if (withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > m_startBlockNum ? block.number : m_startBlockNum;
        m_totalAllocPoint = m_totalAllocPoint.add(allocPoint);
        m_poolInfo.push(PoolInfo({
            lpToken: lpToken,
            allocPoint: allocPoint,
            lastRewardBlock: lastRewardBlock,
            accRewardTokenPerShare: 0
        }));
    }

    // 管路员修改指定的lp凭证代币池
    function modifyPool(uint256 pId, uint256 allocPoint, bool withUpdate) public onlyOwner {
        if (withUpdate) {
            massUpdatePools();
        }
        m_totalAllocPoint = m_totalAllocPoint.sub(m_poolInfo[pId].allocPoint).add(allocPoint);
        m_poolInfo[pId].allocPoint = allocPoint;
    }

    // 根据区块Id的范围，获取奖励倍增值
    function getMultiplier(uint256 fromNum, uint256 toNum) public view returns (uint256) {
        if (toNum <= m_endBlockNum) {
            return toNum.sub(fromNum).mul(BONUS_MULTIPLIER);
        } else if (fromNum >= m_endBlockNum) {
            return toNum.sub(fromNum);
        } else {
            return m_endBlockNum.sub(fromNum).mul(BONUS_MULTIPLIER).add(
                toNum.sub(m_endBlockNum)
            );
        }
    }

    // 展示用户在指定lp凭证代币池中，待处理的奖励额度
    function pendingShowRewardTokenAmount(uint256 pId, address userAddress) external view returns (uint256) {
        PoolInfo storage pool = m_poolInfo[pId];
        UserInfo storage user = m_userInfo[pId][userAddress];
        uint256 accRewardTokenPerShare = pool.accRewardTokenPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 calculateReward = multiplier.mul(m_rewardTokenPerBlock).mul(pool.allocPoint).div(m_totalAllocPoint);
            accRewardTokenPerShare = accRewardTokenPerShare.add(calculateReward.mul(1e12).div(lpSupply));
        }
        return user.amount.mul(accRewardTokenPerShare).div(1e12).sub(user.rewardDebt);
    }

    // 更新所有lp凭证代币池
    function massUpdatePools() public {
        uint256 length = m_poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // 更新指定的lp凭证代币池
    function updatePool(uint256 pId) public {
        PoolInfo storage pool = m_poolInfo[pId];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 calculateReward = multiplier.mul(m_rewardTokenPerBlock).mul(pool.allocPoint).div(m_totalAllocPoint);
        // 这里没有铸造！
        pool.accRewardTokenPerShare = pool.accRewardTokenPerShare.add(calculateReward.mul(1e12).div(lpSupply));
        pool.lastRewardBlock = block.number;
    }

    // 用户向指定的lp凭证代币池，存入额度
    function deposit(uint256 pId, uint256 amount) public {
        PoolInfo storage pool = m_poolInfo[pId];
        UserInfo storage user = m_userInfo[pId][msg.sender];
        updatePool(pId);
        if (user.amount > 0) {
            uint256 pending = user.amount.mul(pool.accRewardTokenPerShare).div(1e12).sub(user.rewardDebt);
            safeRewardTransfer(msg.sender, pending);
        }
        pool.lpToken.safeTransferFrom(address(msg.sender), address(this), amount);
        user.amount = user.amount.add(amount);
        user.rewardDebt = user.amount.mul(pool.accRewardTokenPerShare).div(1e12);
        emit Deposit(msg.sender, pId, amount);
    }

    // 用户向指定的lp凭证代币池，提取指定额度的lp凭证代币，以及相应的奖励额度
    function withdraw(uint256 pId, uint256 amount) public {
        PoolInfo storage pool = m_poolInfo[pId];
        UserInfo storage user = m_userInfo[pId][msg.sender];
        require(user.amount >= amount, "withdraw: not good");
        updatePool(pId);
        uint256 pending = user.amount.mul(pool.accRewardTokenPerShare).div(1e12).sub(user.rewardDebt);
        safeRewardTransfer(msg.sender, pending);
        user.amount = user.amount.sub(amount);
        user.rewardDebt = user.amount.mul(pool.accRewardTokenPerShare).div(1e12);
        pool.lpToken.safeTransfer(address(msg.sender), amount);
        emit Withdraw(msg.sender, pId, amount);
    }

    // 用户向指定的lp凭证代币池，紧急提取所有额度的lp凭证代币(即，放弃奖励额度)
    function emergencyWithdraw(uint256 pId) public {
        PoolInfo storage pool = m_poolInfo[pId];
        UserInfo storage user = m_userInfo[pId][msg.sender];
        pool.lpToken.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, pId, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
    }

    // 本合约向指定用户，转账奖励额度
    function safeRewardTransfer(address to, uint256 amount) internal {
        uint256 balanceAmount = m_rewardToken.balanceOf(address(this));
        if (amount > balanceAmount) {
            m_rewardToken.safeTransfer(to, balanceAmount);
        } else {
            m_rewardToken.safeTransfer(to, balanceAmount);
        }
    } 

    // 查询本合约，暂存的奖励代币的额度
    function balanceOfRewardToken() external view returns(uint256) {
        return m_rewardToken.balanceOf(address(this));
    }
}