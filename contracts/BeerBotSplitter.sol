// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BmClubSplitter is PaymentSplitter, Ownable {
    constructor(address[] memory _payees, uint256[] memory  _shares) PaymentSplitter(_payees, _shares) payable{
        
    }

    function release(address payable account) 
        public 
        virtual 
        override
        onlyOwner
        {
            super.release(account);
        }

    function withdraw() 
        public 
        payable
        onlyOwner
        {
            (bool sent, ) = payable(msg.sender).call{value: address(this).balance}("");
            require(sent, "Withdraw failed");
        }
}