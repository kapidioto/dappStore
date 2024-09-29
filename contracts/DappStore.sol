// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DappStore is Ownable(msg.sender){

    struct Item {
        uint id;
        string name;
        string category;
        string img_url;
        uint cost;
        uint rating; 
        uint stock;
    }

    struct Order {
        uint timestamp;
        Item item;
    }

    event List(string name, uint cost, uint quantity);
    event Buy(address customer, uint orderId, uint itemId);

    mapping (uint => Item) public items;
    mapping(address => uint) public orderCount;
    mapping(address => mapping(uint => Order)) public orders;

    string public name;
    constructor(){
        name = "DappStore";
    }

    //list

    function list(
        uint _id, 
        string memory _name, 
        string memory _category, 
        string memory _img_url, 
        uint _cost, 
        uint _rating, 
        uint _stock
    ) public onlyOwner {
        require(items[_id].cost == 0, "This item alredy exists");
        
        //create item struct
        Item memory item = Item(
            _id, 
            _name, 
            _category, 
            _img_url, 
            _cost, 
            _rating, 
            _stock
        );

        //save item struct
        items[_id] = item;
        emit List(_name, _cost, _stock);
    }

    //buy

    function buy(uint _id) payable public {
        require(msg.value >= items[_id].cost, "There are not enought funds to finish the transaction");
        require(items[_id].stock > 0, "Sold out");
        //create an order

        Order memory order = Order(block.timestamp, items[_id]);
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;
        //substance stack

        items[_id].stock--;

        //emit event
        emit Buy(msg.sender, orderCount[msg.sender], _id);
    }

    //withdraw

    function withdraw() public onlyOwner {
        (bool sucsess,) = owner().call{value: address(this).balance}("");
        require(sucsess);
    }
}
