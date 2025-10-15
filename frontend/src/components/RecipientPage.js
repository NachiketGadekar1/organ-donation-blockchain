import { useState } from 'react';
import { ethers } from 'ethers';

function RecipientPage({ contract, account, isHospital }) {
  const [recipientId, setRecipientId] = useState("");
  const [offchainHash, setOffchainHash] = useState("");

  const handleRegisterRecipient = async () => {
    if (!contract || !recipientId || !offchainHash) {
      alert("Please fill all fields");
      return;
    }
    try {
      // REVERTED: Create provider and signer here
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);
      const recipientIdHash = ethers.id(recipientId);
      const offchainDataHash = ethers.id(offchainHash);

      const tx = await contract.connect(signer).registerRecipient(recipientIdHash, offchainDataHash);
      await tx.wait();
      alert("Recipient registered successfully!");
      setRecipientId("");
      setOffchainHash("");
    } catch (error) {
      console.error("Error registering recipient:", error);
      alert("Error registering recipient. Check console for details.");
    }
  };

  return (
    <div className="page-container">
      <h2>Recipients</h2>
      <div className="form-container">
        <h3>Register New Recipient</h3>
        {!isHospital && <p className="access-denied">You must have the HOSPITAL role to register recipients.</p>}
        <input type="text" placeholder="Recipient ID (e.g., 'recipient-001')" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} disabled={!isHospital} />
        <input type="text" placeholder="Off-chain Medical Record Hash" value={offchainHash} onChange={(e) => setOffchainHash(e.target.value)} disabled={!isHospital} />
        <button onClick={handleRegisterRecipient} disabled={!isHospital}>Register Recipient</button>
      </div>
    </div>
  );
}

export default RecipientPage;