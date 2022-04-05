// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const PhunkNFT = await hre.ethers.getContractFactory("TownsNFT");
  const phunkNFT = await PhunkNFT.deploy();

  await phunkNFT.deployed();

  console.log("TownNFT deployed to:", phunkNFT.address);

  const PhunkMarket = await hre.ethers.getContractFactory("ItemMarketplace");
  const phunkMarket = await PhunkMarket.deploy(phunkNFT.address);

  await phunkMarket.deployed();

  console.log("ItemMarket deployed to:", phunkMarket.address);

  const OpenMining = await hre.ethers.getContractFactory("OpenMining");
  const openMining = await OpenMining.deploy();

  await openMining.deployed();

  console.log("OpenMining deployed to:", openMining.address);

  const PlayerNFT = await hre.ethers.getContractFactory("PlayerNFT");
  const playerNFT = await PlayerNFT.deploy(phunkNFT.address);

  await playerNFT.deployed();

  console.log("PlayerNFT deployed to:", playerNFT.address);

  const Raid = await hre.ethers.getContractFactory("Raid");
  const raid = await Raid.deploy();

  await raid.deployed();

  console.log("Raid deployed to:", raid.address);

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
