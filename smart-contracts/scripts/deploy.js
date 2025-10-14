// scripts/deploy.js
require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [admin] = await ethers.getSigners();
  console.log("Deploying contracts with:", admin.address);

  // Deploy OrganRegistry
  const Registry = await ethers.getContractFactory("OrganRegistry");
  const registry = await Registry.deploy(admin.address);

  // ✅ Wait for deployment
  await registry.waitForDeployment();
  const addr = await registry.getAddress();

  console.log("OrganRegistry deployed to:", addr);

  // Grant default roles (optional)
  await registry.grantRole(await registry.HOSPITAL_ROLE(), admin.address);
  console.log("✅ Granted HOSPITAL_ROLE to", admin.address);

  await registry.grantRole(await registry.OPO_ROLE(), admin.address);
  console.log("✅ Granted OPO_ROLE to", admin.address);

  // --- update .env automatically ---
  let env = fs.readFileSync(".env", "utf8").split("\n");
  const newEnv = env.filter(line => !line.startsWith("REGISTRY_ADDRESS="));
  newEnv.push(`REGISTRY_ADDRESS=${addr}`);
  fs.writeFileSync(".env", newEnv.join("\n"));
  console.log("✅ Updated .env with REGISTRY_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
