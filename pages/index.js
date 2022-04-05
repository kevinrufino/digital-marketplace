import { useState } from 'react'
import { ethers } from 'ethers'
// import { create as ipfsHttpClient } from 'ipfs-http-client'
// import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftAddress, marketAddress, phunkMint
} from '../config'

import PlayerNFT from '../artifacts/contracts/PlayerNFT.sol/PlayerNFT.json'
import TownsNFT from '../artifacts/contracts/TownsNFT.sol/TownsNFT.json'
import Market from '../artifacts/contracts/Market.sol/Market.json'

export default function Home() {

  async function createMarket() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()

    /* next, create the item */
    let contract = new ethers.Contract(nftAddress, PlayerNFT.abi, signer)
    let transaction = await contract.mint(1)
    let tx = await transaction.wait()
    let supply = await contract.totalSupply()
    let supplyNum = supply.toNumber()
    // console.log(supply)
    console.log("player total supply: ",supplyNum)

    //find token id of selected item and allow user to select sale price
    const listPrice = ethers.utils.parseUnits('.0025', 'ether')

    /* then list the item for sale on the marketplace */
    // let contract2 = new ethers.Contract(marketAddress, Market.abi, signer)
    // transaction = await contract2.createMarketItem(nftAddress, supply, listPrice)
    // await transaction.wait()
  }

  async function mintTown() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()

    /* next, create the item */
    let contract = new ethers.Contract(phunkMint, TownsNFT.abi, signer)
    // await contract.startSale()
    // await contract.setBaseURI("https://raw.githubusercontent.com/jozanza/anonymice-images/main/");
    let transaction = await contract.mint(10)
    let tx = await transaction.wait()


    let supply = await contract.numTotalPhunks()
    let supplyNum = supply.toNumber()
    console.log("phunks supply",supply)
    console.log("phunks supply num:",supplyNum)

    //find token id of selected item and allow user to select sale price
    // const listPrice = ethers.utils.parseUnits('.0025', 'ether')

    /* then list the item for sale on the marketplace */
    // let contract2 = new ethers.Contract(marketAddress, Market.abi, signer)
    // transaction = await contract2.createMarketItem(nftAddress, supply, listPrice)
    // await transaction.wait()
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        {/* <input
          placeholder="How much would you liek to list the item for in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        /> */}
        <button onClick={createMarket} className="font-bold mt-4 bg-gray-500 text-white rounded p-4 shadow-lg">
          Mint Player
        </button>
        <button onClick={mintTown} className="font-bold mt-4 bg-gray-500 text-white rounded p-4 shadow-lg">
          Mint Town
        </button>
      </div>
    </div>
  )
}