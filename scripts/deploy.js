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

  // We get the Assets contract to deploy
  const assets = await hre.ethers.getContractFactory("BlogAsset");
  const asset = await assets.deploy("BlogAsset Assets", "BA", "https://ipfs.io/ip/");

  await asset.deployed();

  console.log("Asset deployed to:", asset.address);

  // verify the contracts
  await hre.run("verify:verify", {
    address: asset.address,
    constructorArguments: ["BlogAsset Assets", "BA", "https://ipfs.io/ip/"],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
