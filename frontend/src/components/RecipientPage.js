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

function RecipientPage({ contract, account, isHospital }) {
  const [recipientId, setRecipientId] = useState("");
  const [offchainHash, setOffchainHash] = useState("");

  const handleRegisterRecipient = async () => {
    if (!contract || !recipientId || !offchainHash) {
      alert("Please fill all fields");
      return;
    }
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);
      const recipientIdHash = ethers.id(recipientId);
      const offchainDataHash = ethers.id(offchainHash);

      const tx = await contract.connect(signer).registerRecipient(recipientIdHash, offchainDataHash);
      await tx.wait();
      alert("Recipient registered successfully!");
      setRecipientId("");
      setOffchainHash("");
    } catch (error) {
      console.error("Error registering recipient:", error);
      alert("Error registering recipient. Check console for details.");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Recipients
      </Typography>
      <Typography variant="h6" gutterBottom>
        Register New Recipient
      </Typography>
      {!isHospital && (
        <Alert severity="error" sx={{ mb: 2 }}>
          You must have the HOSPITAL role to register recipients.
        </Alert>
      )}
      <Box component="form" noValidate autoComplete="off">
        <TextField
          fullWidth
          label="Recipient ID (e.g., 'recipient-001')"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
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
          onClick={handleRegisterRecipient}
          disabled={!isHospital}
          fullWidth
          sx={{ mt: 2 }}
        >
          Register Recipient
        </Button>
      </Box>
    </Paper>
  );
}

export default RecipientPage;
