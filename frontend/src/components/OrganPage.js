import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function OrganPage({ contract, account }) {
  // State for the form inputs
  const [organType, setOrganType] = useState("0"); // Default to Heart
  const [donorId, setDonorId] = useState("");
  const [bloodHlaHash, setBloodHlaHash] = useState("");

  // State for the list of organs
  const [organs, setOrgans] = useState([]);

  const organTypes = ["Heart", "Liver", "Lungs", "Kidney", "Pancreas", "Intestine"];
  const organStatus = ["Available", "Reserved", "Transplanted", "Revoked"];

  // Function to handle listing a new organ
  const handleListOrgan = async () => {
    if (!contract || !donorId || !bloodHlaHash) {
      alert("Please fill all fields");
      return;
    }
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);

      // Convert inputs to the required types
      const organTypeInt = parseInt(organType);
      const donorIdBytes32 = ethers.id(donorId);
      const bloodHlaBytes32 = ethers.id(bloodHlaHash);

      const tx = await contract.connect(signer).listOrgan(organTypeInt, donorIdBytes32, bloodHlaBytes32);
      await tx.wait();

      alert("Organ listed successfully!");
      // Clear form and refresh organ list
      setDonorId("");
      setBloodHlaHash("");
      fetchOrgans();

    } catch (error) {
      console.error("Error listing organ:", error);
      alert("Error listing organ. Check console for details.");
    }
  };
  
  // Add this new function after the handleListOrgan function
    const handleReserveOrgan = async (organId) => {
      if (!contract) return;
  
      const recipientId = prompt("Please enter the Recipient ID to reserve this organ for:");
  
      if (!recipientId) {
        alert("Recipient ID is required to reserve an organ.");
        return;
      }
  
      try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const signer = await provider.getSigner(account);
  
        const recipientIdHash = ethers.id(recipientId);
  
        console.log(`Reserving Organ ID: ${organId} for Recipient Hash: ${recipientIdHash}`);
  
        const tx = await contract.connect(signer).reserveOrgan(organId, recipientIdHash);
        await tx.wait();
  
        alert(`Organ ID ${organId} successfully reserved for ${recipientId}!`);
        fetchOrgans(); // Refresh the list to show the new status
      } catch (error) {
        console.error("Error reserving organ:", error);
        // Check for a common error where the recipient is not registered
        if (error.message.includes("Recipient not registered or inactive")) {
          alert("Error: Recipient ID not found or is inactive. Please register the recipient first.");
        } else {
          alert("Error reserving organ. Check console for details.");
        }
      }
    };

    // Add this new function after the handleReserveOrgan function
      const handleRecordTransplant = async (organId) => {
        if (!contract) return;
    
        // The contract requires the recipient ID again for verification
        const recipientId = prompt("Please enter the Recipient ID to confirm the transplant:");
    
        if (!recipientId) {
          alert("Recipient ID is required to record the transplant.");
          return;
        }
    
        try {
          const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
          const signer = await provider.getSigner(account);
          const recipientIdHash = ethers.id(recipientId);
    
          console.log(`Recording transplant for Organ ID: ${organId} with Recipient Hash: ${recipientIdHash}`);
    
          const tx = await contract.connect(signer).recordTransplant(organId, recipientIdHash);
          await tx.wait();
    
          alert(`Transplant successfully recorded for Organ ID ${organId}!`);
          fetchOrgans(); // Refresh the list to show the new "Transplanted" status
        } catch (error) {
          console.error("Error recording transplant:", error);
          // The contract might have checks, e.g., if the recipient ID doesn't match the reservation
          if (error.message.includes("Organ not reserved for this recipient")) {
            alert("Error: The provided Recipient ID does not match the one this organ was reserved for.");
          } else {
            alert("Error recording transplant. Check console for details.");
          }
        }
      };
    
      // Add this new function after the handleRecordTransplant function
        const handleRevokeOrgan = async (organId) => {
          if (!contract) return;
      
          const reason = prompt("Please provide a reason for revoking this organ:");
      
          if (!reason) {
            alert("A reason is required to revoke an organ reservation.");
            return;
          }
      
          try {
            const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            const signer = await provider.getSigner(account);
      
            console.log(`Revoking Organ ID: ${organId} for reason: ${reason}`);
      
            const tx = await contract.connect(signer).revokeOrgan(organId, reason);
            await tx.wait();
      
            alert(`Organ ID ${organId} successfully revoked.`);
            fetchOrgans(); // Refresh the list to show the new "Revoked" status
          } catch (error) {
            console.error("Error revoking organ:", error);
            alert("Error revoking organ. Check console for details.");
          }
        };
      
  // Function to fetch organs from the contract
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

  return (
    <div className="page-container">
      <h2>Organs</h2>
      <div className="form-container">
        <h3>List New Organ</h3>
        <select value={organType} onChange={(e) => setOrganType(e.target.value)}>
          {organTypes.map((type, index) => (
            <option key={index} value={index}>{type}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Registered Donor ID"
          value={donorId}
          onChange={(e) => setDonorId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Blood & HLA Hash"
          value={bloodHlaHash}
          onChange={(e) => setBloodHlaHash(e.target.value)}
        />
        <button onClick={handleListOrgan}>List Organ</button>
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
                        
                        {/* Button for AVAILABLE organs */}
                        {organ.status === 0n && (
                          <button 
                            className="reserve-button" 
                            onClick={() => handleReserveOrgan(organ.organId)}>
                            Reserve Organ
                          </button>
                        )}
        
                        {/* --- UPDATED PART --- */}
                        {/* Buttons for RESERVED organs (status index 1) */}
                        {organ.status === 1n && (
                          <div className="button-group">
                            <button
                              className="transplant-button"
                              onClick={() => handleRecordTransplant(organ.organId)}>
                              Record Transplant
                            </button>
                            <button
                              className="revoke-button"
                              onClick={() => handleRevokeOrgan(organ.organId)}>
                              Revoke
                            </button>
                          </div>
                        )}
                        {/* --- END UPDATED PART --- */}
        
                      </div>
                    ))
                  ) : (
                    <p>No organs listed yet.</p>
                  )}
                </div>
      </div>
    </div>
  );
}

export default OrganPage;
