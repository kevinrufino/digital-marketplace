import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  nftAddress, marketAddress, phunkMint, phunkMarket
} from '../config.js'

// import Market from '../artifacts/contracts/Market.sol/Market.json'
// import PlayerNFT from '../artifacts/contracts/PlayerNFT.sol/PlayerNFT.json'
// import TownsNFT from '../artifacts/contracts/TownsNFT.sol/TownsNFT.json'
import ItemMarketplace from '../artifacts/contracts/ItemMarketplace.sol/ItemMarketplace.json'

export default function gameplay() {
  const [nfts, setNFTs] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect( () => {
    loadNFTs()
  })
  async function loadNFTs () {
    //used to read since we don't need to know about user to load NFTs
    const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.matic.today')
    // const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    // const marketContract = new ethers.Contract(marketAddress, Market.abi, provider)
    const marketContract = new ethers.Contract(phunkMarket, ItemMarketplace.abi, provider)
    
    const data = await marketContract.getAllForSale();
    console.log("all phunks for sale", data)
    // const items = await Promise.all(data.map(async i => {
    //   const tokenUri = await tokenContract.tokenURI(i.tokenId)
    //   const metaData = await axios.get(tokenUri) //gets token metadata
    //   let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
    //   let item = {
    //     price,
    //     tokenId: i.tokenId.toString(),
    //     seller: i.seller,
    //     owner: i.owner,
    //     image: metaData.data.image,
    //     name: metaData.data.name,
    //     description: metaData.data.description
    //   }
    //   return item
    // }))
    // console.log('items: ', items)

    // setNFTs(items) //sets state of NFTs
    setLoadingState('loaded')
  }

  //connect wallet
  async function buyNft(nft) {
    const web3modal =  new Web3Modal()
    const connection = web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection) //create provider using that user's address
  
    const signer = provider.getSigner() //signs tx
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer) //call the contract from the signer

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')  

    // await phunksMarket.buyPhunk(phunkId, {value: amount})
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value: price
    })
    await transaction.wait()

    loadNFTs()
  
  }

  if (loadingState == 'loaded' && !nfts.length) {
    return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  }

  return (
    <div className="flex flex-col">
      <div className="p-4" style={{ maxWidth: '1600px' }}>
        <p>For Sale</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={`https://raw.githubusercontent.com/kevinrufino/anonymice-babies-images/main/babies-png/Baby%20Mouse%20%23${nft.tokenId}.png`} className="rounded" />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                  <button className="w-full bg-pink-500 text-white font-bold mt-2 py-2 px-12 rounded" onClick={() => buyNft(nft.tokenId)}>Buy</button>
                  <button className="w-full bg-pink-500 text-white font-bold mt-2 py-2 px-12 rounded" onClick={() => buyNft(nft.tokenId)}>Bid</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div className="p-4" style={{ maxWidth: '1600px' }}>
        <p>My Bids</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={`https://raw.githubusercontent.com/kevinrufino/anonymice-babies-images/main/babies-png/Baby%20Mouse%20%23${nft.tokenId}.png`} className="rounded" />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                  <button className="w-full bg-pink-500 text-white font-bold mt-2 py-2 px-12 rounded" onClick={() => buyNft(nft)}>Withdraw</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
