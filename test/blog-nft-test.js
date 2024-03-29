// const { describe, beforeEach, it } = require('mocha');
const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");

// eslint-disable-next-line no-undef
describe("BlogNFTAsset contract", function () {
    let admin;
    let maintainer;
    let minter;
    // eslint-disable-next-line no-unused-vars
    let addr1;
    // eslint-disable-next-line no-unused-vars
    let addr2;
    // eslint-disable-next-line no-unused-vars
    let addrs;

    let BlogFactory;
    let nft;

    // constants
    const ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const MAINTAIN_ROLE = "0x339759585899103d2ace64958e37e18ccb0504652c81d4a1b8aa80fe2126ab95";
    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

    // IPFS hash
    const IPFS_HASH = "QmRBGo4gCfwhyT8uFWeftPnHx5UbrHaf1mA2Eg5uTNu1yn";

    // baseURI
    const BASE_URI = "https://ipfs.io/ip/";

    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    // eslint-disable-next-line no-undef
    beforeEach(async function () {
        [admin, maintainer, minter, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Get the ContractFactory
        BlogFactory = await ethers.getContractFactory("BlogNFTAsset");
        nft = await upgrades.deployProxy(BlogFactory,
            ["Blog NFT Asset", "BNA", BASE_URI],
            {initializer: "initialize", kind: 'uups'})
        await nft.deployed();

        let tx = await nft.grantRole(MAINTAIN_ROLE, maintainer.address);
        await tx.wait();

        tx = await nft.grantRole(MINTER_ROLE, minter.address);
        await tx.wait();

        tx = await nft.grantRole(MINTER_ROLE, admin.address);
        await tx.wait();
    });

    // eslint-disable-next-line no-undef
    describe("Deployment", function () {
        // eslint-disable-next-line no-undef
        it("Should set the right admin / maintainer / minter", async function () {
            const isAdmin = await nft.hasRole(ADMIN_ROLE, admin.address);
            expect(isAdmin).to.equal(true);

            const isMaintainer = await nft.hasRole(MAINTAIN_ROLE, maintainer.address);
            expect(isMaintainer).to.equal(true);

            const isMinter = await nft.hasRole(MINTER_ROLE, minter.address);
            expect(isMinter).to.equal(true);
        });
    });

    // eslint-disable-next-line no-undef
    describe("Transactions", function () {
        // eslint-disable-next-line no-undef
        it("Should mint correctly", async function () {
            const tx = await nft.mint(admin.address, 1, 1);
            await tx.wait();
            const _balance = await nft.balanceOf(admin.address);
            expect(_balance).to.equal(1);
        });

        // eslint-disable-next-line no-undef
        it("Should mint with correct token ID", async function () {
            let tx = await nft.mint(admin.address, 1, IPFS_HASH);
            let rc = await tx.wait();
            let event = rc.events.find((event) => event.event === "Transfer");
            let [from, to, value] = event.args;
            expect(value.eq(1)).to.be.true;

            tx = await nft.mint(admin.address, 2, 1);
            rc = await tx.wait();
            event = rc.events.find((event) => event.event === "Transfer");
            [from, to, value] = event.args;
            expect(value.eq(2)).to.be.true;

        });

        // eslint-disable-next-line no-undef
        it("Should not able to transfer when paused", async function () {
            let tx, rc, event;
            tx = await nft.mint(admin.address, 1, IPFS_HASH);
            rc = await tx.wait();
            event = rc.events.find((event) => event.event === "Transfer");
            let [from, to, tokenId] = event.args;

            tx = await nft.pause();
            await tx.wait();

            await expect(nft.mint(admin.address, 2, IPFS_HASH)).to.be.revertedWith("ERC721Pausable: token transfer while paused");

            await expect(nft.transferFrom(admin.address, maintainer.address, tokenId)).to.be.revertedWith("ERC721Pausable: token transfer while paused");

            tx = await nft.unpause();
            await tx.wait();

            tx = await nft.mint(admin.address, 2, IPFS_HASH);
            await tx.wait();
        });

        // eslint-disable-next-line no-undef
        it("Should have correct token URI", async function () {
            let tx, rc, event;
            tx = await nft.mint(admin.address, 1, IPFS_HASH);
            rc = await tx.wait();
            event = rc.events.find((event) => event.event === "Transfer");
            let [from, to, tokenId] = event.args;
            console.log()
            let uri = await nft.tokenURI(tokenId);
            expect(uri).to.equal(BASE_URI + IPFS_HASH)
        })

        // eslint-disable-next-line no-undef
        it("MintBatch should mint correct amount", async function () {
            let tx, rc, event;
            tx = await nft.mint(admin.address, 1, IPFS_HASH);
            await tx.wait();
            tx = await nft.mint(admin.address, 2, IPFS_HASH);
            await tx.wait();
            tx = await nft.mint(admin.address, 3, IPFS_HASH);
            await tx.wait();
            let _balance = await nft.balanceOf(admin.address);
            expect(_balance).to.equal(3);
        })

        // eslint-disable-next-line no-undef
        it("Should transfer to addresses batch correct", async function () {
            let tx, rc, event;
            tx = await nft.mint(admin.address, 1, IPFS_HASH);
            await tx.wait();
            tx = await nft.mint(admin.address, 2, IPFS_HASH);
            await tx.wait();
            tx = await nft.mint(admin.address, 3, IPFS_HASH);
            await tx.wait();
            tx = await nft.safeTransferFromToAddresses(admin.address, [addr1.address, addr2.address], [1, 2]);
            await tx.wait();
            let _balance1 = await nft.balanceOf(admin.address);
            expect(_balance1).to.equal(1);
            let _balance2 = await nft.balanceOf(addr1.address);
            expect(_balance2).to.equal(1);
            let _balance3 = await nft.balanceOf(addr2.address);
            expect(_balance3).to.equal(1);
        })


        // eslint-disable-next-line no-undef
        it("Should transfer batch correct", async function () {
            let tx, rc, event;
            tx = await nft.mint(admin.address, 1, IPFS_HASH);
            await tx.wait();
            tx = await nft.mint(admin.address, 2, IPFS_HASH);
            await tx.wait();
            tx = await nft.safeTransferFromBatch(admin.address, addr1.address, [1, 2]);
            await tx.wait();
            let _balance1 = await nft.balanceOf(admin.address);
            expect(_balance1).to.equal(0);
            let _balance2 = await nft.balanceOf(addr1.address);
            expect(_balance2).to.equal(2);
        })
    });
});
