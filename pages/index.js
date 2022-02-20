import { useState } from 'react'
import { ethers } from 'ethers'
// import { create as ipfsHttpClient } from 'ipfs-http-client'
// import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftAddress, marketAddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/Market.json'

export default function Home() {
  // const [fileUrl, setFileUrl] = useState(null)
  // const [formInput, updateFormInput] = useState({ price: ''})
  // const router = useRouter()

  // async function onChange(e) {
  //   const file = e.target.files[0]
  //   try {
  //     const added = await client.add(
  //       file,
  //       {
  //         progress: (prog) => console.log(`received: ${prog}`)
  //       }
  //     )
  //     const url = `https://ipfs.infura.io/ipfs/${added.path}`
  //     setFileUrl(url)
  //   } catch (error) {
  //     console.log('Error uploading file: ', error)
  //   }  
  // }

  async function createMarket() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()

    /* next, create the item */
    let contract = new ethers.Contract(nftAddress, NFT.abi, signer)
    let transaction = await contract.mint(1)
    let tx = await transaction.wait()
    let supply = await contract.totalSupply()
    let supplyNum = supply.toNumber()
    console.log(supply)
    console.log(supplyNum)

    //find token id of selected item and allow user to select sale price
    const listPrice = ethers.utils.parseUnits('.0025', 'ether')

    /* then list the item for sale on the marketplace */
    let contract2 = new ethers.Contract(marketAddress, Market.abi, signer)
    transaction = await contract2.createMarketItem(nftAddress, supply, listPrice)
    await transaction.wait()
  }

  // async function createSale() {
  //   const web3Modal = new Web3Modal()
  //   const connection = await web3Modal.connect()
  //   const provider = new ethers.providers.Web3Provider(connection)    
  //   const signer = provider.getSigner()

  //   /* next, create the item */
  //   let contract = new ethers.Contract(nftAddress, NFT.abi, signer)
  //   let transaction = await contract.mint(1)
  //   let tx = await transaction.wait()
  //   let event = tx.events[0]
  //   let value = event.args[2]

  //   //find token id of selected item and allow user to select sale price
  //   let tokenId = value.toNumber()
  //   const price = ethers.utils.parseUnits(formInput.price, 'ether')

  //   /* then list the item for sale on the marketplace */
  //   contract = new ethers.Contract(marketAddress, Market.abi, signer)

  //   transaction = await contract.createMarketItem(nftAddress, tokenId, price)
  //   await transaction.wait()
  //   router.push('/market') //pushes user to market page
  // }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        {/* <input
          placeholder="How much would you liek to list the item for in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        /> */}
        <button onClick={createMarket} className="font-bold mt-4 bg-gray-500 text-white rounded p-4 shadow-lg">
          MINT
        </button>
      </div>
    </div>
  )
}