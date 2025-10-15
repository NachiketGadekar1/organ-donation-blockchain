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
                <p><strong>Status:</strong> {organStatus[organ.status]}</p>
                <p><strong>Listed By:</strong> {organ.listedBy.substring(0, 6)}...{organ.listedBy.substring(organ.listedBy.length - 4)}</p>
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
