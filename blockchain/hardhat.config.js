import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config({ path: "../backend/.env" });

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.20",
    networks: {
        sepolia: {
            url: process.env.RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/your-api-key",
            accounts: process.env.WALLET_PRIVATE_KEY ? [process.env.WALLET_PRIVATE_KEY] : [],
        },
    },
};
