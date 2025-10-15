import { useState, useEffect } from 'react';

function OrganPage({ contract }) {
  // State for the form inputs
  const [organType, setOrganType] = useState("0"); // Default to Heart
  const [donorId, setDonorId] = useState("");
  const [bloodHlaHash, setBloodHlaHash] = useState("");

  // State for the list of organs
  const [organs, setOrgans] = useState([]);

  const organTypes = ["Heart", "Liver", "Lungs", "Kidney", "Pancreas", "Intestine"];

  // Function to handle listing a new organ
  const handleListOrgan = async () => {
    // TODO: Implement contract interaction
    alert("Feature coming soon!");
  };

  // Function to fetch organs from the contract
  const fetchOrgans = async () => {
    // TODO: Implement logic to fetch all organs
    console.log("Fetching organs...");
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
        {/* This will be replaced with a dynamic list */}
        <p>Organ list will appear here.</p>
      </div>
    </div>
  );
}

export default OrganPage;
