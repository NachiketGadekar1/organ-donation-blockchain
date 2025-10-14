// scripts/registerDonor.js
require("dotenv").config();
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node scripts/registerDonor.js <donorId> <offchainHash>");
    process.exit(1);
  }

  const [donorId, offchainHash] = args;
  const [signer] = await ethers.getSigners();

  const registryAddr = process.env.REGISTRY_ADDRESS;
  if (!registryAddr) {
    console.error("❌ Missing REGISTRY_ADDRESS in .env");
    process.exit(1);
  }

  const registry = await ethers.getContractAt("OrganRegistry", registryAddr, signer);
  console.log(`🔗 Using OrganRegistry at ${registryAddr}`);

  const donorHash = ethers.keccak256(ethers.toUtf8Bytes(donorId));
  const offchainHashBytes = ethers.keccak256(ethers.toUtf8Bytes(offchainHash));

  try {
    const tx = await registry.registerDonor(donorHash, offchainHashBytes);
    await tx.wait();
    console.log(`✅ Donor ${donorId} registered with hash ${donorHash}`);
  } catch (err) {
    console.error("❌ Failed to register donor:", err.message);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
