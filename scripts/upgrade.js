// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {upgrades} = require("hardhat");
const hre = require("hardhat");


// Proxy contract address
const PROXY_CONTRACT_ADDRESS = "0x09236345EC74FBa8F9fC7047c2a3916D7735DcE3"

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the Assets contract to deploy
    const bna = await hre.ethers.getContractFactory("BlogNFTAsset");
    console.log("Deploying BlogNFTAsset...")
    const bnaUpgrades = await upgrades.upgradeProxy(PROXY_CONTRACT_ADDRESS, bna);
    console.log("upgradedAssets proxy deployed to", bnaUpgrades.address);

    await bnaUpgrades.deployTransaction.wait([(confirms = 3)]);
    // verify the contracts
    const implAddress = await upgrades.erc1967.getImplementationAddress(bnaUpgrades.address);
    console.log("upgradedAssets implementation deployed to", implAddress);

    // verify the contracts
    await hre.run("verify:verify", {
        address: implAddress,
    });

    console.log("BlogNFTAsset upgraded");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
