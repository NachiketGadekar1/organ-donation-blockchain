import { useState } from 'react';
import { ethers } from 'ethers';

function AdminPage({ contract, account }) {
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("HOSPITAL");

  const handleGrantRole = async () => {
    if (!contract || !ethers.isAddress(address)) {
      alert("Please enter a valid Ethereum address.");
      return;
    }
    try {
      let roleHash = (role === 'HOSPITAL') 
        ? await contract.HOSPITAL_ROLE() 
        : await contract.OPO_ROLE();
      
      // REVERTED: Create provider and signer here
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);

      const tx = await contract.connect(signer).grantRole(roleHash, address);
      await tx.wait();
      alert(`Successfully granted ${role} role to ${address}`);
      setAddress("");
    } catch (error) {
      console.error("Error granting role:", error);
      alert("Error granting role. Check console.");
    }
  };

  return (
    <div className="page-container">
      <h2>Admin Panel - Grant Roles</h2>
      <div className="form-container">
        <h3>Grant a New Role</h3>
        <input type="text" placeholder="User Address (e.g., 0x...)" value={address} onChange={(e) => setAddress(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="HOSPITAL">Hospital Role</option>
          <option value="OPO">OPO Role</option>
        </select>
        <button onClick={handleGrantRole}>Grant Role</button>
      </div>
    </div>
  );
}

export default AdminPage;