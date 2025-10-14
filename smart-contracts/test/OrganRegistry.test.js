const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OrganRegistry", function () {
  it("deploys and grants roles", async function () {
    const [admin, opo, hospital] = await ethers.getSigners();
    const OrganRegistry = await ethers.getContractFactory("OrganRegistry");
    const c = await OrganRegistry.deploy(admin.address);
    await c.waitForDeployment();

    await c.connect(admin).grantRole(await c.OPO_ROLE(), opo.address);
    await c.connect(admin).grantRole(await c.HOSPITAL_ROLE(), hospital.address);

    const donorIdHash = ethers.keccak256(ethers.toUtf8Bytes("donor-001"));
    const donorDocHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://donor-doc"));
    await c.connect(opo).registerDonor(donorIdHash, donorDocHash);

    const organType = 0; // Kidney
    const bloodHlaHash = ethers.keccak256(ethers.toUtf8Bytes("O+|A2B8"));
    const organIdTx = await c.connect(opo).listOrgan(organType, donorIdHash, bloodHlaHash);
    await organIdTx.wait();

    const recipientIdHash = ethers.keccak256(ethers.toUtf8Bytes("recipient-001"));
    const recipientDocHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://recipient-doc"));
    await c.connect(hospital).registerRecipient(recipientIdHash, recipientDocHash);

    await c.connect(hospital).reserveOrgan(1, recipientIdHash);
    await c.connect(hospital).recordTransplant(1, recipientIdHash);

    const organ = await c.organs(1);
    expect(organ.status).to.equal(2); // Transplanted
  });
});
