// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../contracts_openzeppelin/token/ERC20/ERC20.sol";
import "../../contracts_openzeppelin/access/Ownable.sol";

contract Mock_USDT is ERC20, Ownable {
    uint8 internal _decimals = 6;

    constructor(
        string memory name,
        string memory symbol,
        uint8 initDecimals
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = initDecimals;
    }

    function decimals() public view virtual override returns (uint8) {
        // 真实的泰达币，就是小数位是6
        return _decimals;
    }    

    function mint(address to, uint256 amount) public onlyOwner {
        // amount 指定是数额，单位是最小单位。
        _mint(to, amount);
    }
}