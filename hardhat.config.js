/** @type import('hardhat/config').HardhatUserConfig */
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      // forking: {
      //   url: MAINNET_URL,
      // },
    },
  },
};
