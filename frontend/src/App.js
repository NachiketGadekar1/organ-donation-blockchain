
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import OrganRegistryABI from './OrganRegistryABI.json';

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [organCount, setOrganCount] = useState(null);
  const [donorId, setDonorId] = useState("");
  const [offchainHash, setOffchainHash] = useState("");

  const handleRegisterDonor = async () => {
    if (!contract || !donorId || !offchainHash) {
      alert("Please fill all fields");
      return;
    }
    try {
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


  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);

          const registryContract = new ethers.Contract(
            contractAddress,
            OrganRegistryABI.abi,
            signer
          );
          setContract(registryContract);

          const count = await registryContract.organSeq();
          setOrganCount(count.toString());

        } catch (error) {
          console.error("Error initializing contract", error);
        }
      }
    };
    init();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        window.location.reload(); // Reload to re-initialize contract with new signer
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Organ Donation Blockchain</h1>
        {account ? (
          <div>
            <p>Connected Account: {account}</p>
            {organCount !== null && (
              <p>Total Organs Listed: {organCount}</p>
            )}
            <div className="form-container">
              <h2>Register Donor</h2>
              <input
                type="text"
                placeholder="Donor ID"
                value={donorId}
                onChange={(e) => setDonorId(e.target.value)}
              />
              <input
                type="text"
                placeholder="Off-chain Hash"
                value={offchainHash}
                onChange={(e) => setOffchainHash(e.target.value)}
              />
              <button onClick={handleRegisterDonor}>Register Donor</button>
            </div>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>
    </div>
  );
}

export default App;
