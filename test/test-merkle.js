const { expect } = require("chai");
const { ethers } = require("hardhat");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

function encodeLeaf(address, spots) {
  // Same as `abi.encodePacked` in Solidity
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint64"],
    [address, spots]
  );
}

describe("Check if merkle root is working", function () {
  it("Should be able to verify if a given address is in whitelist or not", async function () {
  
    // Get a bunch of test addresses
    const [owner, addr1, addr2, addr3, addr4, addr5] =
      await ethers.getSigners();
    
    // Create an array of elements you wish to encode in the Merkle Tree
    const list = [
      encodeLeaf(owner.address, 2),
      encodeLeaf(addr1.address, 2),
      encodeLeaf(addr2.address, 2),
      encodeLeaf(addr3.address, 2),
      encodeLeaf(addr4.address, 2),
      encodeLeaf(addr5.address, 2),
    ];
    // console.log("owner.address: "+owner.address);
    // console.log("addr1.address: "+addr1.address);
    // console.log("addr2.address: "+addr2.address);
    // console.log("addr3.address: "+addr3.address);
    // console.log("addr4.address: "+addr4.address);
    // console.log("addr5.address: "+addr5.address);

    // Create the Merkle Tree using the hashing algorithm `keccak256`
    // Make sure to sort the tree so that it can be produced deterministically regardless
    // of the order of the input list
    const merkleTree = new MerkleTree(list, keccak256, {
      hashLeaves: true,
      sortPairs: true,
    });
    // Compute the Merkle Root
    const root = merkleTree.getHexRoot();
    // console.log("root: "+root);

    // Deploy the Whitelist contract
    const whitelist = await ethers.getContractFactory("Whitelist");
    const Whitelist = await whitelist.deploy(root);
    await Whitelist.deployed();

    // Compute the Merkle Proof of the owner address (0'th item in list)
    // off-chain. The leaf node is the hash of that value.
    const leaf = keccak256(list[0]);
    const proof = merkleTree.getHexProof(leaf);
    // console.log("leaf: "+leaf);
    // console.log("proof: "+proof);

    // Provide the Merkle Proof to the contract, and ensure that it can verify
    // that this leaf node was indeed part of the Merkle Tree
    let verified = await Whitelist.checkInWhitelist(proof, 2);
    expect(verified).to.equal(true);
    
    // Provide an invalid Merkle Proof to the contract, and ensure that
    // it can verify that this leaf node was NOT part of the Merkle Tree
    verified = await Whitelist.checkInWhitelist([], 2);
    expect(verified).to.equal(false);
  });
});
