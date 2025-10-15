import { useState } from 'react';

function RecipientPage({ contract, account }) {
  const [recipientId, setRecipientId] = useState("");
  const [offchainHash, setOffchainHash] = useState("");

  const handleRegisterRecipient = async () => {
    // TODO: Implement contract interaction
    alert("Feature coming soon!");
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
