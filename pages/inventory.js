import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
    nftAddress, marketAddress
} from '../config'

import Market from '../artifacts/contracts/Market.sol/Market.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [sellMode, setSellMode] = useState(false)
  const [price, setPrice] = useState(0)
  useEffect(() => {
    loadNFTs()
  }, [])

  function updateSellMode() {
    if (sellMode == false) {
        setSellMode(true)
    }
    else if (sellMode == true) {
        setSellMode(false)
    }
  }

  async function listItem(tokenId) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()

    //find token id of selected item and allow user to select sale price
    const listPrice = ethers.utils.parseUnits(price, 'ether')

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(marketAddress, Market.abi, signer)

    transaction = await contract.createMarketItem(nftAddress, tokenId, listPrice)
    await transaction.wait()
    router.push('/market') //pushes user to market page
  }

  //TODO provider and signer seem to not work?
  //fetchMyNFTs currently returns all nfts
  //Market.sol only adds and maps items that are posted on the market...
  async function loadNFTs() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    console.log("signer", signer)
    const wallet = await signer.getAddress();
    console.log("wallet of signer", wallet)
    const marketContract = new ethers.Contract(marketAddress, Market.abi, provider)
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const data = await marketContract.fetchMyNFTs()
    // console.log("inventory nfts", data)
    

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
      }
      return item
    }))
    console.log("all items", items)
    setNfts(items)
    setLoadingState('loaded') 
  }

  let list = (tokenId) => {
    if (sellMode == true) {
        return (
            <>
                <input
                    placeholder="Price in Eth"
                    className="mt-2 border rounded p-4"
                    onChange={e => setPrice(e.target.value)}
                />
                <button onClick={listItem(tokenId)}>List Item</button>
            </>
        )
    }
    else if (sellMode == false) {
        return <></>
    }
  };
  
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)
  return (
    <div className="flex justify-center">
      <div>
        <button onClick={updateSellMode} className="font-bold mt-4 bg-gray-500 text-white rounded p-4 shadow-lg">Sell Mode</button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                </div>
                {/* hopefully nft.tokenId actually has the token Id */}
                {list(nft.tokenId)} 
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}