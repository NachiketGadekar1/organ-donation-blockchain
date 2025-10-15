import { useState } from 'react';
import { ethers } from 'ethers';

function RecipientPage({ contract, account }) {
  const [recipientId, setRecipientId] = useState("");
  const [offchainHash, setOffchainHash] = useState("");

  const handleRegisterRecipient = async () => {
    if (!contract || !recipientId || !offchainHash) {
      alert("Please fill all fields");
      return;
    }
    try {
      // We create a new provider and signer to ensure we are interacting with the local node
      // This pattern matches the one in DonorPage.js
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);

      // The contract expects bytes32 hashes, so we convert the string IDs
      const recipientIdHash = ethers.id(recipientId);
      const offchainDataHash = ethers.id(offchainHash);

      // Call the 'registerRecipient' function on the contract
      const tx = await contract.connect(signer).registerRecipient(recipientIdHash, offchainDataHash);
      await tx.wait(); // Wait for the transaction to be mined

      alert("Recipient registered successfully!");
      
      // Clear the form fields after successful registration
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
        <input
          type="text"
          placeholder="Recipient ID (e.g., 'recipient-001')"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Off-chain Medical Record Hash"
          value={offchainHash}
          onChange={(e) => setOffchainHash(e.target.value)}
        />
        <button onClick={handleRegisterRecipient}>Register Recipient</button>
      </div>
    </div>
  );
}

export default RecipientPage;
