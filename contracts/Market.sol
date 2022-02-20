// contracts/Market.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; //gives non-reentrant security to prevent multiple tx. good for any contract that talks to another
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Market is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    // uint256 listingPrice = 0.025 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    //object of each market item as a map
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    //this only keeps track of items being sold on the market
    mapping(uint256 => MarketItem) private idToMarketItem; //to keep up with all items created. This makes it easy to find items through id (helps find each market item by itemId)

    //used to listen to these events from a front end application
    //event for everytime a marketItem was created
    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address payable seller,
        address payable owner,
        uint256 price,
        bool sold
    );

    //returns listing price
    // function getListingPrice() public view returns (uint256) {
    //     return listingPrice;
    // }

    //creating a MarketItem "putting it for sale"
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be greater than 0");
        // require(
        //     msg.value == listingPrice,
        //     "Price must be equal to listing price"
        // );

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        //create and set mapping to MarketItem
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender), //seller
            payable(address(0)), //owner is set to empty address
            price,
            false //has it been sold
        );

        //transfer ownership of NFT to the contract itself
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        //TODO add cancel listing

        //emits event
        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );
    }

    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;

        require(
            msg.value == price,
            "Price submitted doesn't match the listing price"
        );

        //transfer value of tx to the seller
        idToMarketItem[itemId].seller.transfer(msg.value);
        //transfer ownership to buyer
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        // set local value for the owner the msg.sender
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        
        //transfer amount of fee to the contract owner
        // payable(owner).transfer(listingPrice);
    }

    // differnt views: returns all unsold items, all my items, and mint new items
    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current();
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                // uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[i + 1];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //TODO fetchmyNFTs gets purchased and minted
    //fetches only nfts that you've purchased
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}
