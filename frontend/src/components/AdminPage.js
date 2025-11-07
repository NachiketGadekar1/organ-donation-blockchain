import { useState } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';

function AdminPage({ contract, account }) {
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("HOSPITAL");

  const handleGrantRole = async () => {
    if (!contract || !ethers.isAddress(address)) {
      alert("Please enter a valid Ethereum address.");
      return;
    }
    try {
      let roleHash = (role === 'HOSPITAL') 
        ? await contract.HOSPITAL_ROLE() 
        : await contract.OPO_ROLE();
      
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);

      const tx = await contract.connect(signer).grantRole(roleHash, address);
      await tx.wait();
      alert(`Successfully granted ${role} role to ${address}`);
      setAddress("");
    } catch (error) {
      console.error("Error granting role:", error);
      alert("Error granting role. Check console.");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Admin Panel
      </Typography>
      <Typography variant="h6" gutterBottom>
        Grant a New Role
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          fullWidth
          label="User Address (e.g., 0x...)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            label="Role"
          >
            <MenuItem value="HOSPITAL">Hospital Role</MenuItem>
            <MenuItem value="OPO">OPO Role</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGrantRole}
          fullWidth
          sx={{ mt: 2 }}
        >
          Grant Role
        </Button>
      </Box>
    </Paper>
  );
}

export default AdminPage;
