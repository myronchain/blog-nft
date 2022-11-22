# Blog NFT Asset

Blog NFT Asset 是将博客作为NFT，博客内容使用IPFS进行存储，链上存储Hash。基于Openzeppelin的可升级合约库ERC721进行实现

Solidity版本为0.8.4

Nodejs版本为v14.15.3

目前已经部署到Polygon上(测试使用mumbai网络)，合约地址：
- upgradedAssets proxy deployed to: [0xEB4881FbC0793BB61fD455e0A2e1b3627a6ca1EA](https://polygonscan.com/address/0xEB4881FbC0793BB61fD455e0A2e1b3627a6ca1EA)
- upgradedAssets implementation deployed to [0xe1F643A2CE9765C288DBFd0374c269269E438460](https://polygonscan.com/address/0xe1F643A2CE9765C288DBFd0374c269269E438460)

## Hardhat使用
1. 准备配置文件
```shell
cp .env.example .env
```
2. 安装环境依赖
```shell
npm install
```
3. 使用方法
```shell
# 帮助信息
npx hardhat help
```
4. Runs mocha tests
```shell
# 运行测试脚本
npx hardhat test --network hardhat
# 运行测试脚本，报告gas
REPORT_GAS=true npx hardhat test --network hardhat
# 测试覆盖率
npx hardhat coverage --network hardhat
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

6. 升级合约

将代理合约地址写入scripts/upgrade.js中的PROXY_CONTRACT_ADDRESS变量
```shell
npx hardhat --network mumbai run scripts/upgrade.js
```
