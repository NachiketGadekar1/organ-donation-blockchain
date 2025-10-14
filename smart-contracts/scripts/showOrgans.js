// scripts/showOrgans.js
require("dotenv").config();
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [signer] = await ethers.getSigners();
  const registryAddr = process.env.REGISTRY_ADDRESS;

  if (!registryAddr) {
    console.error("❌ Missing REGISTRY_ADDRESS in .env");
    process.exit(1);
  }

  const registry = await ethers.getContractAt("OrganRegistry", registryAddr, signer);
  console.log(`🔗 Using OrganRegistry at ${registryAddr}`);

  const organSeq = await registry.organSeq();
  console.log(`📊 Total organs listed: ${organSeq}`);

  for (let i = 1; i <= organSeq; i++) {
    const organ = await registry.organs(i);

    console.log(`\n🫀 Organ #${organ.organId}`);
    console.log(`   Type: ${organ.organType}`);
    console.log(`   DonorRef: ${organ.donorRef}`);
    console.log(`   Blood/HLA hash: ${organ.bloodHlaHash}`);
    console.log(`   Status: ${organ.status}`);
    console.log(`   Listed by: ${organ.listedBy}`);
    console.log(`   Reserved for: ${organ.reservedFor}`);
    console.log(`   Reserved at: ${organ.reservedAt}`);
    console.log(`   Transplanted at: ${organ.transplantedAt}`);
  }
}

main().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
