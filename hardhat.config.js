require('dotenv').config()
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: false
      }
    }
  },
  mocha: {
    timeout: 100000000
  },
  networks: {    
    polygon_mumbai: {
      url: process.env.polygon_mumbai_url,
      accounts: [
        process.env.polygon_mumbai_account
      ]
    },
    bsc_testnet: {      
      url: process.env.bsc_tesnet_node_url,
      chainId: 97,      
      accounts: [
        process.env.bsc_tesnet_account
      ]
    },
    bsc_mainnet: {
      url: process.env.bsc_mainnet_node_url,
      chainId: 56,      
      accounts: [
        process.env.bsc_mainnet_account
      ]
    }
  }
};