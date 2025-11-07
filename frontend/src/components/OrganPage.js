import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function OrganPage({ contract, account, isOpo, isHospital }) {
  const [organType, setOrganType] = useState("0");
  const [donorId, setDonorId] = useState("");
  const [bloodHlaHash, setBloodHlaHash] = useState("");
  const [organs, setOrgans] = useState([]);
  const organTypes = ["Heart", "Liver", "Lungs", "Kidney", "Pancreas", "Intestine"];
  const organStatus = ["Available", "Reserved", "Transplanted", "Revoked"];

  const fetchOrgans = async () => {
    if (!contract) return;
    try {
      const count = await contract.organSeq();
      const organsList = [];
      for (let i = 1; i <= count; i++) {
        const organ = await contract.organs(i);
        organsList.push(organ);
      }
      setOrgans(organsList);
    } catch (error) {
      console.error("Error fetching organs:", error);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchOrgans();
    }
  }, [contract]);

  const handleListOrgan = async () => {
    if (!contract || !donorId || !bloodHlaHash) return alert("Please fill all fields");
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);
      const tx = await contract.connect(signer).listOrgan(parseInt(organType), ethers.id(donorId), ethers.id(bloodHlaHash));
      await tx.wait();
      alert("Organ listed successfully!");
      setDonorId(""); setBloodHlaHash(""); fetchOrgans();
    } catch (error) { console.error("Error listing organ:", error); alert("Error listing organ."); }
  };

  // In frontend/src/components/OrganPage.js
  
  const handleReserveOrgan = async (organId) => {
      // First prompt for the Recipient ID
      const recipientId = prompt("Please enter the Recipient ID:");
      if (!recipientId) return;
  
      // --- THIS IS THE FIX ---
      // Add a second prompt for the hospital's address
      const hospitalAddress = prompt("Please enter the address of the recipient's hospital:");
      if (!hospitalAddress || !ethers.isAddress(hospitalAddress)) {
          alert("A valid hospital address is required.");
          return;
      }
      // --- END OF FIX ---
  
      try {
          const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
          const signer = await provider.getSigner(account);
          
          // Pass all THREE arguments to the contract function
          const tx = await contract.connect(signer).reserveOrgan(organId, ethers.id(recipientId), hospitalAddress);
          
          await tx.wait();
          alert("Organ reserved successfully!");
          fetchOrgans();
      } catch (error) {
          console.error("Error reserving organ:", error);
          alert("Error reserving organ.");
      }
  };

  const handleRecordTransplant = async (organId) => {
    const recipientId = prompt("Please enter the Recipient ID to confirm:");
    if (!recipientId) return;
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);
      const tx = await contract.connect(signer).recordTransplant(organId, ethers.id(recipientId));
      await tx.wait();
      alert("Transplant recorded successfully!"); fetchOrgans();
    } catch (error) { console.error("Error recording transplant:", error); alert("Error recording transplant."); }
  };

  const handleRevokeOrgan = async (organId) => {
    const reason = prompt("Please provide a reason for revoking:");
    if (!reason) return;
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);
      const tx = await contract.connect(signer).revokeOrgan(organId, reason);
      await tx.wait();
      alert("Organ revoked successfully!"); fetchOrgans();
    } catch (error) { console.error("Error revoking organ:", error); alert("Error revoking organ."); }
  };

  return (
    <div className="page-container">
      <h2>Organs</h2>
      <div className="form-container">
        <h3>List New Organ</h3>
        {!isOpo && <p className="access-denied">You must have the OPO role to manage organs.</p>}
        <select value={organType} onChange={(e) => setOrganType(e.target.value)} disabled={!isOpo}>
          {organTypes.map((type, index) => <option key={index} value={index}>{type}</option>)}
        </select>
        <input type="text" placeholder="Registered Donor ID" value={donorId} onChange={(e) => setDonorId(e.target.value)} disabled={!isOpo} />
        <input type="text" placeholder="Blood & HLA Hash" value={bloodHlaHash} onChange={(e) => setBloodHlaHash(e.target.value)} disabled={!isOpo} />
        <button onClick={handleListOrgan} disabled={!isOpo}>List Organ</button>
      </div>
      <div className="list-container">
        <h3>Available Organs</h3>
        <div className="organ-list">
          {organs.length > 0 ? (
            organs.map((organ, index) => (
              <div key={index} className="organ-card">
                <h4>Organ ID: {organ.organId.toString()}</h4>
                <p><strong>Type:</strong> {organTypes[organ.organType]}</p>
                <p><strong>Status:</strong> <span className={`status-${organStatus[organ.status]}`}>{organStatus[organ.status]}</span></p>
                <p><strong>Listed By:</strong> {organ.listedBy.substring(0, 6)}...{organ.listedBy.substring(organ.listedBy.length - 4)}</p>
                {organ.status === 0n && isOpo && <button className="reserve-button" onClick={() => handleReserveOrgan(organ.organId)}>Reserve Organ</button>}
                
                {/* Show button group only for Reserved organs */}
                {organ.status === 1n && (
                  <div className="button-group">
                
                    {/* CONDITIONAL: Show Transplant button ONLY to the designated Hospital */}
                    {isHospital && organ.transplantHospital.toLowerCase() === account.toLowerCase() && (
                      <button className="transplant-button" onClick={() => handleRecordTransplant(organ.organId)}>Record Transplant</button>
                    )}
                
                    {/* CONDITIONAL: Show Revoke button ONLY to the OPO */}
                    {isOpo && (
                      <button className="revoke-button" onClick={() => handleRevokeOrgan(organ.organId)}>Revoke</button>
                    )}
                
                  </div>
                )}
              </div>
            ))
          ) : (<p>No organs listed yet.</p>)}
        </div>
      </div>
    </div>
  );
}

export default OrganPage;