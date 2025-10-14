require("@nomicfoundation/hardhat-ethers");

require("dotenv").config();

const { ALCHEMY_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    ...(ALCHEMY_URL && PRIVATE_KEY
      ? {
          sepolia: {
            url: ALCHEMY_URL,
            accounts: [PRIVATE_KEY],
          },
        }
      : {}),
  },
};
