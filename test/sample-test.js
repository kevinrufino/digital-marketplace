const { expect } = require("chai");
const { ethers } = require("hardhat");

//similate deployment and calling those functions
describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    /* deploy the marketplace */
    const Market = await ethers.getContractFactory("Market")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    /* deploy the NFT contract */
    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    // check listing price
    // let listingPrice = await market.getListingPrice()
    // listingPrice = listingPrice.toString()

    const auctionPrice1 = ethers.utils.parseUnits('1', 'ether')
    const auctionPrice2 = ethers.utils.parseUnits('2', 'ether')

    /* create two tokens */
    await nft.mint(2) //token id 1

    /* put both tokens for sale */
    await market.createMarketItem(nftContractAddress, 1, auctionPrice1)
    await market.createMarketItem(nftContractAddress, 2, auctionPrice2)

    // how can we get different addresses from different users
    const [_, buyerAddress] = await ethers.getSigners()
    console.log("buyer address: ", buyerAddress)

    /* query for and return the unsold items */
    items = await market.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)

    /* execute sale of token to another user */
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice1})
    
    /* query for and return all my items */
    myitems = await market.fetchMyNFTs()
    myitems = await Promise.all(myitems.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('my items: ', myitems)
  });
});
