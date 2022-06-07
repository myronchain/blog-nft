require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-solhint");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-contract-sizer");
require("hardhat-interface-generator");

const { task } = require("hardhat/config");

// const PRIVATE_KEY = process.env.PRIVATE_KEY;
const withOptimizations = false;
const defaultNetwork = "hardhat"; // "hardhat" for tests

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: withOptimizations,
        runs: 200,
      },
    },
  },
  defaultNetwork: defaultNetwork,
  networks: {
     hardhat: {
      allowUnlimitedContractSize: true,
      chainId: !!process.env.HARDHATCHAINID ? process.env.HARDHATCHAINID : undefined,
      timeout: 99999 * 2,
      gas: process.env.HARDHATCHAINID === 137 ? 19_000_000 :
        process.env.HARDHATCHAINID === 80001 ? 19_000_000 :
          undefined,
      forking: !!process.env.HARDHATCHAINID && process.env.HARDHATCHAINID !== 31337 ? {
        url:
          process.env.HARDHATCHAINID === 137 ? process.env.maticRpcUrl :
          process.env.HARDHATCHAINID === 250 ? process.env.ftmRpcUrl :
            process.env.HARDHATCHAINID === 80001 ? process.env.MUMBAI_URL :
              undefined,
        blockNumber:
          process.env.HARDHATCHAINID === 137 ? process.env.maticForkBlock !== 0 ? process.env.maticForkBlock : undefined :
          process.env.HARDHATCHAINID === 250 ? process.env.ftmForkBlock !== 0 ? process.env.ftmForkBlock : undefined :
            process.env.HARDHATCHAINID === 80001 ? process.env.MUMBAI_BLOCK !== 0 ? process.env.MUMBAI_BLOCK : undefined :
              undefined
      } : undefined,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        accountsBalance: "100000000000000000000000000000"
      },
    },
    hardhat: {
      blockGasLimit: 10000000,
      allowUnlimitedContractSize: !withOptimizations,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/PZd297vs-VHFPPcF4mRaayWFRgdHKn6I`,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/19de54b594234ffb978a4e81f18a9827`,
      accounts: [process.env.PRIVATE_KEY],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/yDmZwRGPvSI_OFe0QWvatH4Qcg_y_N4C`,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  contractSizer: {
    alphaSort: false,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: false,
  },
  mocha: {
    timeout: 9999999999
  },
};
