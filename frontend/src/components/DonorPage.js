import { useState } from 'react';
import { ethers } from 'ethers';

function DonorPage({ contract, account, isHospital }) {
  const [donorId, setDonorId] = useState("");
  const [offchainHash, setOffchainHash] = useState("");

  const handleRegisterDonor = async () => {
    if (!contract || !donorId || !offchainHash) {
      alert("Please fill all fields");
      return;
    }
    try {
      // REVERTED: Create provider and signer here
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);
      const donorIdHash = ethers.id(donorId);
      const offchainDataHash = ethers.id(offchainHash);

      const tx = await contract.connect(signer).registerDonor(donorIdHash, offchainDataHash);
      await tx.wait();
      alert("Donor registered successfully!");
      setDonorId("");
      setOffchainHash("");
    } catch (error) {
      console.error("Error registering donor:", error);
      alert("Error registering donor. Check console for details.");
    }
  };

  return (
    <div className="page-container">
      <h2>Donors</h2>
      <div className="form-container">
        <h3>Register New Donor</h3>
        {!isHospital && <p className="access-denied">You must have the HOSPITAL role to register donors.</p>}
        <input type="text" placeholder="Donor ID (e.g., 'donor-001')" value={donorId} onChange={(e) => setDonorId(e.target.value)} disabled={!isHospital} />
        <input type="text" placeholder="Off-chain Medical Record Hash" value={offchainHash} onChange={(e) => setOffchainHash(e.target.value)} disabled={!isHospital} />
        <button onClick={handleRegisterDonor} disabled={!isHospital}>Register Donor</button>
      </div>
    </div>
  );
}

export default DonorPage;