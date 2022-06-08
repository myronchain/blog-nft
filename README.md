# Blog NFT

ERC721 Contracts

主要功能室基础的ERC721合约功能

## Hardhat使用
0. 准备配置文件
```shell
cp .env.example .env
```
1. 安装Hardhat
```shell
npm install --save-dev hardhat
```
2. 使用方法
```shell
# 帮助信息
npx hardhat help
```
3. Runs mocha tests
```shell
# 运行测试脚本
npx hardhat test
# ?
REPORT_GAS=true npx hardhat test
# 测试覆盖率
npx hardhat coverage
```
4. 部署到测试网
```shell
npx hardhat --network mumbai run scripts/deploy.js
```
5. 验证部署结果(4也输出该结果)
```shell
npm install @nomiclabs/hardhat-etherscan
# DEPLOYED_CONTRACT_ADDRESS: 0x5142682C37A1b02f45E2Ada0B9eC9e42F446C8C5
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS 'BlogAsset Assets' 'BA' 'https://ipfs.io/ip/'
```
Successfully verified contract Assets on Polygonscan Testnet.
https://mumbai.polygonscan.com/address/DEPLOYED_CONTRACT_ADDRESS#code
