require("@nomicfoundation/hardhat-ethers");

require("dotenv").config();

const { ALCHEMY_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    ...(ALCHEMY_URL
      ? {
          sepolia: {
            url: ALCHEMY_URL,
          },
        }
      : {}),
  },
};
