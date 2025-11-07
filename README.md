
---

# Organ Donation Blockchain Registry

This is a decentralized application (dApp) built for a university project to demonstrate a transparent, secure, and auditable system for managing an organ donation registry. The project leverages a blockchain to act as a trust layer, ensuring data integrity and clear access control, while keeping sensitive patient information private using a hybrid on-chain/off-chain data model.

## Core Concepts

This project is built on three fundamental concepts:

1.  **Blockchain as a Trust Layer:** The application uses a smart contract on a local Ethereum blockchain (Hardhat) to serve as an immutable ledger. All critical actions (registering a donor, listing an organ, recording a transplant) are recorded as transactions, creating a permanent and tamper-proof audit trail.

2.  **Role-Based Access Control (RBAC):** Not all users have the same permissions. The smart contract enforces a strict RBAC system to ensure that only authorized entities can perform specific actions:
    *   **Admin:** The administrator of the system (the contract deployer by default). Their primary role is to grant and revoke roles for other participants.
    *   **Hospital:** An accredited hospital. Hospitals are responsible for registering new donors and recipients into the system and for confirming when a transplant surgery has been successfully completed.
    *   **OPO (Organ Procurement Organization):** A central coordinating body. OPOs are responsible for validating and listing donated organs on the registry, and for allocating (reserving) organs for specific hospitals based on matching criteria.

3.  **Hybrid On-Chain/Off-Chain Data Model:** To protect patient privacy, no Personally Identifiable Information (PII) or sensitive medical data is ever stored on the blockchain. Instead:
    *   **Off-Chain Data:** All sensitive files (donor consent forms, recipient medical records, detailed organ compatibility reports) are stored in secure, private, off-chain systems (e.g., a hospital's HIPAA-compliant database).
    *   **On-Chain Hashes:** A cryptographic hash (a unique digital fingerprint) of each off-chain file is calculated and stored on the blockchain. This hash acts as an immutable "anchor" or proof-of-existence. It allows anyone to verify that an off-chain file is authentic and has not been altered since it was registered, without ever seeing the private data itself.

## Architecture & Tech Stack

The application consists of two main components:

*   **Frontend (React):** A web-based user interface built with React and the `ethers.js` library to interact with the blockchain.
*   **Smart Contract (Solidity):** The `OrganRegistry.sol` contract deployed on a local Hardhat blockchain network.



*   **Frontend:** `React`, `ethers.js`, `CSS`
*   **Blockchain:** `Solidity`
*   **Development Environment:** `Hardhat`, `Node.js`

## Directory Structure

```
/
├── smart-contracts/
│   ├── contracts/
│   │   └── OrganRegistry.sol   # The main smart contract
│   ├── scripts/
│   │   └── deploy.js           # Deployment script
│   └── hardhat.config.cjs      # Hardhat configuration
│
└── frontend/
    ├── src/
    │   ├── components/         # React components for each page
    │   │   ├── AdminPage.js
    │   │   ├── DonorPage.js
    │   │   ├── OrganPage.js
    │   │   └── RecipientPage.js
    │   ├── App.js              # Main application component and logic
    │   └── OrganRegistryABI.json # ABI for frontend-contract interaction
    └── package.json
```

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [MetaMask](https://metamask.io/) browser extension

### 1. Clone & Install Dependencies

First, clone the repository and install the necessary packages for both the smart contract and the frontend.

```bash
# Clone the repository (if you haven't already)
git clone <your-repo-url>
cd organ-donation-blockchain

# Install smart contract dependencies
cd smart-contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Run the Local Blockchain

You will need **two separate terminals** running in the `smart-contracts` directory.

**In Terminal 1 - Start the Node:**
This will start a local blockchain instance and generate 20 test accounts with private keys.

```bash
cd smart-contracts
npx hardhat node
```
**Leave this terminal running.**

**In Terminal 2 - Deploy the Contract:**
This will compile and deploy the `OrganRegistry.sol` contract to the local node you just started.

```bash
cd smart-contracts
npx hardhat run scripts/deploy.js --network localhost
```
After running, it will print the address of the newly deployed contract. **Copy this address.**

### 3. Configure the Frontend

You must connect the frontend to the newly deployed contract.

1.  **Update Contract Address:** Open `frontend/src/App.js` and paste the new contract address you just copied into the `contractAddress` variable.
2.  **Update Contract ABI:** Copy the entire content of `smart-contracts/artifacts/contracts/OrganRegistry.sol/OrganRegistry.json` and paste it into `frontend/src/OrganRegistryABI.json`, replacing the existing content.

### 4. Run the Frontend Application

Now, start the React development server.

```bash
# From the /frontend directory
cd frontend
npm start
```
Your browser should open to `http://localhost:3000`.

### 5. Configure MetaMask

1.  **Add Local Network:**
    *   Open MetaMask, click the network dropdown, and select "Add network".
    *   Choose "Add a network manually".
    *   Fill in the details:
        *   **Network Name:** `Hardhat Local`
        *   **New RPC URL:** `http://127.0.0.1:8545`
        *   **Chain ID:** `1337`
        *   **Currency Symbol:** `ETH`
    *   Click "Save".

2.  **Import Test Accounts:**
    *   Your Hardhat node (in Terminal 1) printed a list of accounts and their private keys.
    *   In MetaMask, click the circle icon -> "Import account".
    *   Copy and paste the **private key** for `Account #0`, `Account #1`, and `Account #2` to import them. They will come pre-funded with 10000 ETH.

## Application Workflow & Usage

To test the full functionality, follow this workflow using the imported Hardhat accounts.

**Account Roles:**
*   **Account #0:** Admin (by default, as it deployed the contract)
*   **Account #1:** Will be assigned the Hospital role.
*   **Account #2:** Will be assigned the OPO role.

**Step 1: Grant Roles (as Admin)**
1.  In MetaMask, make sure you are connected with **Account #0**.
2.  In the dApp, click "Connect Wallet". The "Admin Panel" button should appear.
3.  Navigate to the "Admin Panel".
4.  To grant the Hospital role:
    *   Enter the address of **Account #1** in the "User Address" field.
    *   Select "Hospital Role".
    *   Click "Grant Role" and confirm in MetaMask.
5.  To grant the OPO role:
    *   Enter the address of **Account #2** in the "User Address" field.
    *   Select "OPO Role".
    *   Click "Grant Role" and confirm.

**Step 2: Register a Donor (as Hospital)**
1.  In MetaMask, switch to **Account #1**. The page will refresh.
2.  Navigate to the "Donors" page. The form fields should be enabled.
3.  Enter a unique Donor ID (e.g., `donor-001`) and an Off-chain Hash (e.g., `hash-of-medical-record`).
4.  Click "Register Donor" and confirm.

**Step 3: List an Organ (as OPO)**
1.  In MetaMask, switch to **Account #2**.
2.  Navigate to the "Organs" page. The "List New Organ" form should be enabled.
3.  Select an organ type, enter the Donor ID you just registered (`donor-001`), and a Blood & HLA Hash.
4.  Click "List Organ" and confirm. The new organ will appear in the "Available Organs" list.

**Step 4: Reserve an Organ (as OPO)**
1.  While still connected as **Account #2 (OPO)**, find the organ you just listed.
2.  Click the "Reserve Organ" button.
3.  A prompt will appear. Enter a Recipient ID (e.g., `recipient-xyz`).
4.  A second prompt will appear. Enter the hospital address this organ is for (**Account #1's address**).
5.  Confirm the transaction. The organ's status will change to "Reserved".

**Step 5: Record Transplant (as Hospital)**
1.  In MetaMask, switch back to **Account #1 (Hospital)**.
2.  On the "Organs" page, find the reserved organ. A "Record Transplant" button will be visible.
3.  Click "Record Transplant". You will be prompted to confirm the Recipient ID.
4.  Enter the same Recipient ID (`recipient-xyz`) and confirm the transaction.
5.  The organ's status will update to "Transplanted", completing the workflow.

---

## License

This project is licensed under the MIT License.