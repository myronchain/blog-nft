// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {upgrades} = require("hardhat");
const hre = require("hardhat");


// Constants
const network_configs = {
    mumbai: {
        metadata_uri: "https://ipfs.io/ip/",
    }, polygon: {
        metadata_uri: "https://ipfs.io/ip/",
    },
}
let config;

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the Assets contract to deploy

    if (hre.network.name === "polygon") {
        config = network_configs.polygon
    } else {
        config = network_configs.mumbai
    }

    console.log("Network: ", hre.network.name)
    console.log("Metadata URI: ", config.metadata_uri)

    const assets = await hre.ethers.getContractFactory("BlogNFTAsset");
    let upgradedAssets = await upgrades.deployProxy(assets, ["Blog NFT Asset", "BNA", config.metadata_uri], {
        initializer: "initialize",
        kind: 'uups'
    })
    let bna = await upgradedAssets.deployed();
    const implAddress = await upgrades.erc1967.getImplementationAddress(bna.address);
    const adminAddress = await upgrades.erc1967.getAdminAddress(bna.address)
    console.log("upgradedAssets proxy deployed to:", bna.address);
    console.log("upgradedAssets implementation deployed to", implAddress);
    // TODO 这里输出不对
    console.log("upgradedAssets admin deployed to", adminAddress);

    // verify the contracts
    await hre.run("verify:verify", {
        address: implAddress,
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
