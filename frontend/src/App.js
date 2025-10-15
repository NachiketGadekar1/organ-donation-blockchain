import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import OrganRegistryABI from './OrganRegistryABI.json';
import DonorPage from './components/DonorPage';
import OrganPage from './components/OrganPage';
import RecipientPage from './components/RecipientPage';

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [view, setView] = useState('organs'); // Default view

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
          const accounts = await provider.send("eth_accounts", []);
          
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setAccount(address);

            const registryContract = new ethers.Contract(
              contractAddress,
              OrganRegistryABI.abi,
              signer
            );
            setContract(registryContract);
          }
        } catch (error) {
          console.error("Error initializing application", error);
        }
      }
    };
    init();

    // Listen for account changes
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
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
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
        return <DonorPage contract={contract} account={account} />;
      case 'recipients':
        return <RecipientPage contract={contract} account={account} />;
      case 'organs':
      default:
        return <OrganPage contract={contract} account={account} />;
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
        </nav>
      )}

      <main>
        {account ? renderView() : <p>Please connect your wallet to continue.</p>}
      </main>
    </div>
  );
}

export default App;