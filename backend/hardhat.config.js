require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-truffle5");
require("dotenv");


const PK = process.env.PK || "";
const RPC_URL = process.env.RPC_URL || "";
const ETHERSCAN = process.env.ETHERSCAN || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "goerli",
  networks: {
    goerli: {
      url: RPC_URL,
      accounts: [`0x${PK``}`],
      chainID: 5,
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.18"
      }
    ]
  },
};