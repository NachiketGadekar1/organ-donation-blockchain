// scripts/addOrgan.js
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [admin, ...others] = await ethers.getSigners();
  const registryAddr = process.env.REGISTRY_ADDRESS;
  if (!registryAddr) throw new Error("❌ REGISTRY_ADDRESS missing in .env");

  const Registry = await ethers.getContractFactory("OrganRegistry");
  const registry = Registry.attach(registryAddr);

  // find a signer with OPO_ROLE
  const opoRole = await registry.OPO_ROLE();
  let opoSigner;
  for (const s of [admin, ...others]) {
    if (await registry.hasRole(opoRole, s.address)) {
      opoSigner = s;
      break;
    }
  }
  if (!opoSigner) throw new Error("❌ No signer has OPO_ROLE");
  console.log("🔑 Using OPO account:", opoSigner.address);

  // args
  const [organTypeStr, donorId, bloodHla] = process.argv.slice(2);
  if (!organTypeStr || !donorId || !bloodHla) {
    throw new Error("Usage: node scripts/addOrgan.js <organType> <donorId> <blood+HLA>");
  }

  // map organ string to enum
  const organTypes = { kidney: 0, liver: 1, heart: 2, lung: 3, pancreas: 4, intestine: 5, cornea: 6, other: 7 };
  const organType = organTypes[organTypeStr.toLowerCase()];
  if (organType === undefined) throw new Error(`Unknown organType: ${organTypeStr}`);

  const donorIdHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(donorId));
  const bloodHlaHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(bloodHla));

  // ensure donor exists
  try {
    const donor = await registry.donors(donorIdHash);
    if (donor.createdBy === ethers.constants.AddressZero) {
      console.log("➡️ Registering donor...");
      const tx1 = await registry.connect(opoSigner).registerDonor(donorIdHash, donorIdHash);
      await tx1.wait();
      console.log("✅ Donor registered");
    }
  } catch (e) {
    console.log("⚠️ Could not query donor, will try register anyway");
    const tx1 = await registry.connect(opoSigner).registerDonor(donorIdHash, donorIdHash);
    await tx1.wait();
  }

  // list organ
  const tx2 = await registry.connect(opoSigner).listOrgan(organType, donorIdHash, bloodHlaHash);
  const rc = await tx2.wait();
  const event = rc.events?.find(e => e.event === "OrganListed");
  if (event) {
    console.log(`✅ Organ listed with ID ${event.args.organId.toString()}`);
  } else {
    console.log("⚠️ OrganListed event not found, logs:", rc.logs);
  }
}

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
