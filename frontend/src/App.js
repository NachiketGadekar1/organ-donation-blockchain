import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import OrganRegistryABI from './OrganRegistryABI.json';
import DonorPage from './components/DonorPage';
import OrganPage from './components/OrganPage';
import RecipientPage from './components/RecipientPage';
import AdminPage from './components/AdminPage';

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Make sure this is your LATEST deployed address

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [view, setView] = useState('organs');

  const [isAdmin, setIsAdmin] = useState(false);
  const [isHospital, setIsHospital] = useState(false);
  const [isOpo, setIsOpo] = useState(false);

  const checkUserRoles = async (signerAddress, contractInstance) => {
    if (!signerAddress || !contractInstance) {
      setIsAdmin(false); setIsHospital(false); setIsOpo(false);
      return;
    }
    try {
      const adminRole = await contractInstance.DEFAULT_ADMIN_ROLE();
      const hospitalRole = await contractInstance.HOSPITAL_ROLE();
      const opoRole = await contractInstance.OPO_ROLE();

      const [hasAdmin, hasHospital, hasOpo] = await Promise.all([
        contractInstance.hasRole(adminRole, signerAddress),
        contractInstance.hasRole(hospitalRole, signerAddress),
        contractInstance.hasRole(opoRole, signerAddress)
      ]);

      setIsAdmin(hasAdmin);
      setIsHospital(hasHospital);
      setIsOpo(hasOpo);
      console.log(`Role check for ${signerAddress}: Admin=${hasAdmin}, Hospital=${hasHospital}, OPO=${hasOpo}`);
    } catch (error) {
      console.error("Error checking user roles:", error);
      setIsAdmin(false); setIsHospital(false); setIsOpo(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // --- THIS IS THE FIX ---
          // 1. Ask METAMASK who is currently connected.
          const metaMaskAccounts = await window.ethereum.request({ method: 'eth_accounts' });

          if (metaMaskAccounts.length > 0) {
            const currentUserAddress = metaMaskAccounts[0];
            setAccount(currentUserAddress);

            // 2. Now, use the JsonRpcProvider, but get the signer for the SPECIFIC user.
            const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            const signer = await provider.getSigner(currentUserAddress);

            const registryContract = new ethers.Contract(
              contractAddress.trim(),
              OrganRegistryABI.abi,
              signer
            );
            setContract(registryContract);
            await checkUserRoles(currentUserAddress, registryContract);
          }
          // --- END OF FIX ---
        } catch (error) {
          console.error("Error initializing application", error);
        }
      }
    };
    init();

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        window.location.reload();
      } else {
        setAccount(null);
      }
    });
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        window.location.reload();
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const renderView = () => {
    switch (view) {
      case 'donors':
        return <DonorPage contract={contract} account={account} isHospital={isHospital} />;
      case 'recipients':
        return <RecipientPage contract={contract} account={account} isHospital={isHospital} />;
      case 'admin':
        return <AdminPage contract={contract} account={account} />;
      case 'organs':
      default:
        return <OrganPage contract={contract} account={account} isOpo={isOpo} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Organ Donation Blockchain</h1>
        {account ? (
          <p>Connected Account: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>
      {account && (
        <nav className="main-nav">
          <button onClick={() => setView('organs')}>Organs</button>
          <button onClick={() => setView('donors')}>Donors</button>
          <button onClick={() => setView('recipients')}>Recipients</button>
          {isAdmin && <button onClick={() => setView('admin')}>Admin Panel</button>}
        </nav>
      )}
      <main>
        {account ? renderView() : <p>Please connect your wallet to continue.</p>}
      </main>
    </div>
  );
}

export default App;