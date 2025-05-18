import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const { 
  PRIVATE_KEY, 
  PRIVATE_KEY1, 
  PRIVATE_KEY2,
  SEPOLIA_JSON_URL,
  ASSET_HUB_WESTEND_URL,
  ETHERSCAN_API_KEY,
} = process.env

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: SEPOLIA_JSON_URL || "",
      accounts: [PRIVATE_KEY, PRIVATE_KEY1, PRIVATE_KEY2],
      chainId: 11155111,
    },
    ah: {
      url: ASSET_HUB_WESTEND_URL || "",
      accounts: [PRIVATE_KEY, PRIVATE_KEY1, PRIVATE_KEY2],
      chainId: 420420421,
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY || ""
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};

export default config;