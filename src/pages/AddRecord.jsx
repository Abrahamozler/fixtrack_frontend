import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import {
  Container, Box, TextField, Button, Typography, Paper, Grid,
  Select, MenuItem, FormControl, InputLabel, Alert, Toolbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SparePartRow from '../components/SparePartRow'; // <-- IMPORT THE REUSABLE COMPONENT

const AddRecord = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    recordDate: new Date().toISOString().split('T')[0], // Default to today
    mobileModel: '',
    customerName: '',
    customerPhone: '',
    complaint: '',
    serviceCharge: '',
    paymentStatus: 'Pending',
  });
  // UPDATED state to match the structure needed by SparePartRow
  const [spareParts, setSpareParts] = useState([{ name: '', customName: '', price: '' }]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [error, setError] = useState('');

  // useEffect for total price calculation (no changes needed here)
  useEffect(() => {
    const partsTotal = spareParts.reduce((acc, part) => {
      const price = parseFloat(part.price);
      return isNaN(price) ? acc : acc + price;
    }, 0);
    const service = parseFloat(formData.serviceCharge);
    const serviceTotal = isNaN(service) ? 0 : service;
    setTotalPrice(partsTotal + serviceTotal);
  }, [spareParts, formData.serviceCharge]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // UPDATED handler to manage the more complex part state
  const handlePartChange = (index, e) => {
    const { name, value } = e.target;
    const newParts = [...spareParts];
    newParts[index] = { ...newParts[index], [name]: value };

    if (name === 'name' && value !== 'Custom') {
      newParts[index].customName = '';
    }
    setSpareParts(newParts);
  };

  const addPart = () => {
    setSpareParts([...spareParts, { name: '', customName: '', price: '' }]);
  };

  const removePart = (index) => {
    if (spareParts.length > 1) {
      setSpareParts(spareParts.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    // UPDATED logic to correctly format spare parts for submission
    const validSpareParts = spareParts
      .filter(part => {
        const hasPrice = part.price && part.price.toString().trim() !== '';
        if (part.name === 'Custom') {
          return part.customName && part.customName.trim() !== '' && hasPrice;
        }
        return part.name && part.name.trim() !== '' && hasPrice;
      })
      .map(part => ({
        name: part.name === 'Custom' ? part.customName.trim() : part.name,
        price: part.price
      }));

    data.append('spareParts', JSON.stringify(validSpareParts));

    if (beforePhoto) data.append('beforePhoto', beforePhoto);
    if (afterPhoto) data.append('afterPhoto', afterPhoto);

    try {
      await api.post('/records', data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add record.');
    }
  };

  return (
    <Container maxWidth="md">
      <Toolbar />
      <Paper sx={{ p: { xs: 2, sm: 4 }, mt: 4 }}>
        <Typography variant="h4" gutterBottom>Add New Repair Record</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Form Fields */}
            <Grid item xs={12} sm={6}><TextField fullWidth label="Mobile Model" name="mobileModel" value={formData.mobileModel} onChange={handleFormChange} required /></Grid>
            {/* NEW Record Date Field */}
            <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Record Date" name="recordDate" value={formData.recordDate} onChange={handleFormChange} InputLabelProps={{ shrink: true }} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Customer Name" name="customerName" value={formData.customerName} onChange={handleFormChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Customer Phone (Optional)" name="customerPhone" value={formData.customerPhone} onChange={handleFormChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Complaint Details" name="complaint" multiline rows={3} value={formData.complaint} onChange={handleFormChange} required /></Grid>

            {/* --- REFACTORED SPARE PARTS SECTION --- */}
            <Grid item xs={12}><Typography variant="h6">Spare Parts</Typography></Grid>
            {spareParts.map((part, index) => (
              <SparePartRow
                key={index}
                index={index}
                part={part}
                onPartChange={handlePartChange}
                onRemovePart={removePart}
                canRemove={spareParts.length > 1}
              />
            ))}
            <Grid item xs={12}><Button startIcon={<AddIcon />} onClick={addPart}>Add Part</Button></Grid>

            {/* Financials */}
            <Grid item xs={12} sm={4}><TextField fullWidth label="Service Charge (INR)" name="serviceCharge" type="number" value={formData.serviceCharge} onChange={handleFormChange} required /></Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth><InputLabel>Payment Status</InputLabel>
                <Select name="paymentStatus" value={formData.paymentStatus} label="Payment Status" onChange={handleFormChange}>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Total Price (INR)" value={totalPrice.toFixed(2)} InputProps={{ readOnly: true }} variant="filled" />
            </Grid>

            {/* File Uploads (Unchanged) */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">Before Photo:</Typography>
              <Button variant="contained" component="label">Upload File <input type="file" hidden accept="image/*" onChange={e => setBeforePhoto(e.target.files[0])} /></Button>
              {beforePhoto && <Typography variant="caption" sx={{ ml: 1 }}>{beforePhoto.name}</Typography>}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">After Photo:</Typography>
              <Button variant="contained" component="label">Upload File <input type="file" hidden accept="image/*" onChange={e => setAfterPhoto(e.target.files[0])} /></Button>
              {afterPhoto && <Typography variant="caption" sx={{ ml: 1 }}>{afterPhoto.name}</Typography>}
            </Grid>

            <Grid item xs={12}><Button type="submit" variant="contained" color="primary" size="large">Submit Record</Button></Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddRecord;
