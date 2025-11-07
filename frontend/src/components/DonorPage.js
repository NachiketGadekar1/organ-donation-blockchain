import { useState } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';

function DonorPage({ contract, account, isHospital }) {
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

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Donors
      </Typography>
      <Typography variant="h6" gutterBottom>
        Register New Donor
      </Typography>
      {!isHospital && (
        <Alert severity="error" sx={{ mb: 2 }}>
          You must have the HOSPITAL role to register donors.
        </Alert>
      )}
      <Box component="form" noValidate autoComplete="off">
        <TextField
          fullWidth
          label="Donor ID (e.g., 'donor-001')"
          value={donorId}
          onChange={(e) => setDonorId(e.target.value)}
          margin="normal"
          disabled={!isHospital}
        />
        <TextField
          fullWidth
          label="Off-chain Medical Record Hash"
          value={offchainHash}
          onChange={(e) => setOffchainHash(e.target.value)}
          margin="normal"
          disabled={!isHospital}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleRegisterDonor}
          disabled={!isHospital}
          fullWidth
          sx={{ mt: 2 }}
        >
          Register Donor
        </Button>
      </Box>
    </Paper>
  );
}

export default DonorPage;
