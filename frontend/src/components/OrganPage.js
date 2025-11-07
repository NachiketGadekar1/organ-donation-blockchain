import { useState, useEffect } from 'react';
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
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';

function OrganPage({ contract, account, isOpo, isHospital }) {
  const [organType, setOrganType] = useState("0");
  const [donorId, setDonorId] = useState("");
  const [bloodHlaHash, setBloodHlaHash] = useState("");
  const [organs, setOrgans] = useState([]);
  const [loading, setLoading] = useState(true);
  const organTypes = ["Heart", "Liver", "Lungs", "Kidney", "Pancreas", "Intestine"];
  const organStatus = ["Available", "Reserved", "Transplanted", "Revoked"];

  const fetchOrgans = async () => {
    if (!contract) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchOrgans();
    }
  }, [contract]);

  const handleListOrgan = async () => {
    if (!contract || !donorId || !bloodHlaHash) return alert("Please fill all fields");
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);
      const tx = await contract.connect(signer).listOrgan(parseInt(organType), ethers.id(donorId), ethers.id(bloodHlaHash));
      await tx.wait();
      alert("Organ listed successfully!");
      setDonorId(""); setBloodHlaHash(""); fetchOrgans();
    } catch (error) { console.error("Error listing organ:", error); alert("Error listing organ."); }
  };

  const handleReserveOrgan = async (organId) => {
      const recipientId = prompt("Please enter the Recipient ID:");
      if (!recipientId) return;
  
      const hospitalAddress = prompt("Please enter the address of the recipient's hospital:");
      if (!hospitalAddress || !ethers.isAddress(hospitalAddress)) {
          alert("A valid hospital address is required.");
          return;
      }
  
      try {
          const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
          const signer = await provider.getSigner(account);
          
          const tx = await contract.connect(signer).reserveOrgan(organId, ethers.id(recipientId), hospitalAddress);
          
          await tx.wait();
          alert("Organ reserved successfully!");
          fetchOrgans();
      } catch (error) {
          console.error("Error reserving organ:", error);
          alert("Error reserving organ.");
      }
  };

  const handleRecordTransplant = async (organId) => {
    const recipientId = prompt("Please enter the Recipient ID to confirm:");
    if (!recipientId) return;
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);
      const tx = await contract.connect(signer).recordTransplant(organId, ethers.id(recipientId));
      await tx.wait();
      alert("Transplant recorded successfully!"); fetchOrgans();
    } catch (error) { console.error("Error recording transplant:", error); alert("Error recording transplant."); }
  };

  const handleRevokeOrgan = async (organId) => {
    const reason = prompt("Please provide a reason for revoking:");
    if (!reason) return;
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(account);
      const tx = await contract.connect(signer).revokeOrgan(organId, reason);
      await tx.wait();
      alert("Organ revoked successfully!"); fetchOrgans();
    } catch (error) { console.error("Error revoking organ:", error); alert("Error revoking organ."); }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 0: return "success"; // Available
      case 1: return "warning"; // Reserved
      case 2: return "primary"; // Transplanted
      case 3: return "error";   // Revoked
      default: return "default";
    }
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>List New Organ</Typography>
        {!isOpo && (
          <Alert severity="error" sx={{ mb: 2 }}>
            You must have the OPO role to manage organs.
          </Alert>
        )}
        <Box component="form" noValidate autoComplete="off">
          <FormControl fullWidth margin="normal" disabled={!isOpo}>
            <InputLabel>Organ Type</InputLabel>
            <Select value={organType} onChange={(e) => setOrganType(e.target.value)} label="Organ Type">
              {organTypes.map((type, index) => <MenuItem key={index} value={index}>{type}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Registered Donor ID"
            value={donorId}
            onChange={(e) => setDonorId(e.target.value)}
            margin="normal"
            disabled={!isOpo}
          />
          <TextField
            fullWidth
            label="Blood & HLA Hash"
            value={bloodHlaHash}
            onChange={(e) => setBloodHlaHash(e.target.value)}
            margin="normal"
            disabled={!isOpo}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleListOrgan}
            disabled={!isOpo}
            fullWidth
            sx={{ mt: 2 }}
          >
            List Organ
          </Button>
        </Box>
      </Paper>

      <Typography variant="h4" gutterBottom align="center">Available Organs</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {organs.length > 0 ? (
            organs.map((organ, index) => (
              <Grid item xs={12} sm={6} md={6} key={index}>
                <Card variant="outlined" elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: 'border.main' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Organ ID: {organ.organId.toString()}
                    </Typography>
                    <Typography variant="body1"><strong>Type:</strong> {organTypes[organ.organType]}</Typography>
                    <Box sx={{ my: 1 }}>
                      <Chip label={organStatus[organ.status]} color={getStatusChipColor(Number(organ.status))} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Listed By: {organ.listedBy.substring(0, 6)}...{organ.listedBy.substring(organ.listedBy.length - 4)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {organ.status === 0n && isOpo && (
                      <Button size="small" color="primary" variant="contained" onClick={() => handleReserveOrgan(organ.organId)}>
                        Reserve
                      </Button>
                    )}
                    {organ.status === 1n && isHospital && organ.transplantHospital.toLowerCase() === account.toLowerCase() && (
                      <Button size="small" color="primary" variant="contained" onClick={() => handleRecordTransplant(organ.organId)}>
                        Record Transplant
                      </Button>
                    )}
                    {organ.status === 1n && isOpo && (
                      <Button size="small" color="secondary" variant="outlined" onClick={() => handleRevokeOrgan(organ.organId)}>
                        Revoke
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" align="center">No organs listed yet.</Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}

export default OrganPage;
