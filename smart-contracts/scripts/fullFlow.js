// scripts/fullFlow.js
require("dotenv").config();
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer, hospital] = await ethers.getSigners();

  const addr = process.env.REGISTRY_ADDRESS;
  if (!addr) throw new Error("❌ Missing REGISTRY_ADDRESS in .env");

  const Registry = await ethers.getContractFactory("OrganRegistry");
  const registry = Registry.attach(addr);

  console.log("🚀 Using OrganRegistry at:", addr);

  // -------------------------------------------------
  // 1. Setup roles
  // -------------------------------------------------
  console.log("🔑 Granting roles...");
  const OPO_ROLE = await registry.OPO_ROLE();
  const HOSPITAL_ROLE = await registry.HOSPITAL_ROLE();

  await (await registry.grantRole(OPO_ROLE, deployer.address)).wait();
  await (await registry.grantRole(HOSPITAL_ROLE, hospital.address)).wait();
  console.log("✅ Roles granted (OPO -> deployer, HOSPITAL -> hospital)");

  // -------------------------------------------------
  // 2. Register donor
  // -------------------------------------------------
  const donorIdHash = ethers.id("donor1");
  const donorFileHash = ethers.id("donor1-file");

  await (await registry.connect(deployer).registerDonor(donorIdHash, donorFileHash)).wait();
  console.log("🧑‍🤝‍🧑 Donor registered:", donorIdHash);

  // -------------------------------------------------
  // 3. Register recipient
  // -------------------------------------------------
  const recipientIdHash = ethers.id("recipient1");
  const recipientFileHash = ethers.id("recipient1-file");

  await (await registry.connect(hospital).registerRecipient(recipientIdHash, recipientFileHash)).wait();
  console.log("🏥 Recipient registered:", recipientIdHash);

  // -------------------------------------------------
  // 4. List organ (Heart)
  // -------------------------------------------------
  const bloodHlaHash = ethers.id("O+|HLA-A2,B27");
  const tx = await registry.connect(deployer).listOrgan(
    2,              // 2 = Heart
    donorIdHash,
    bloodHlaHash
  );
  const receipt = await tx.wait();
  const organId = receipt.logs[0].args.organId;
  console.log("🫀 Organ listed (heart), id:", organId.toString());

  // -------------------------------------------------
  // 5. Reserve organ
  // -------------------------------------------------
  await (await registry.connect(hospital).reserveOrgan(organId, recipientIdHash)).wait();
  console.log("📌 Organ reserved for recipient:", recipientIdHash);

  // -------------------------------------------------
  // 6. Record transplant
  // -------------------------------------------------
  await (await registry.connect(hospital).recordTransplant(organId, recipientIdHash)).wait();
  console.log("✅ Transplant recorded for organ:", organId.toString());

  // -------------------------------------------------
  // 7. Show final organ state
  // -------------------------------------------------
  const organ = await registry.organs(organId);
  console.log("📊 Final organ record:");
  console.log({
    organId: organ.organId.toString(),
    organType: organ.organType.toString(),
    status: organ.status.toString(),
    donorRef: organ.donorRef,
    reservedFor: organ.reservedFor,
    transplantedAt: organ.transplantedAt.toString(),
  });
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
