// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {MerkleProofLib} from "./solmate/utils/MerkleProofLib.sol";

contract Whitelist {

    bytes32 public merkleRoot;

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    /// Gas cost: 
    ///     - openzeppelin: 28626
    ///     - solmate: 27619
    function checkInWhitelist(bytes32[] calldata proof, uint64 maxAllowanceToMint) view public returns (bool) {
        bytes32 leaf = keccak256(abi.encode(msg.sender, maxAllowanceToMint));
        bool verified = MerkleProofLib.verify(proof, merkleRoot, leaf);
        return verified;
    }
    
}