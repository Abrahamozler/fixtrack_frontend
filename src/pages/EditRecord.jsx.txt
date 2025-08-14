import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import {
  Container, Box, TextField, Button, Typography, Paper, Grid,
  Select, MenuItem, FormControl, InputLabel, IconButton, Alert, CircularProgress, Toolbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const EditRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [spareParts, setSpareParts] = useState([{ name: '', price: '' }]);
  const [totalPrice, setTotalPrice] = useState(0); // Add total price state
  const [error, setError] = useState('');

  // Auto-calculate total price whenever parts or service charge change
  useEffect(() => {
    if (!loading) { // Only calculate after initial data has loaded
      const partsTotal = spareParts.reduce((acc, part) => {
        const price = parseFloat(part.price);
        return isNaN(price) ? acc : acc + price;
      }, 0);
      const service = parseFloat(formData.serviceCharge);
      const serviceTotal = isNaN(service) ? 0 : service;
      setTotalPrice(partsTotal + serviceTotal);
    }
  }, [spareParts, formData.serviceCharge, loading]);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const { data } = await api.get(`/records/${id}`);
        setFormData({
            mobileModel: data.mobileModel || '',
            customerName: data.customerName || '',
            customerPhone: data.customerPhone || '',
            complaint: data.complaint || '',
            serviceCharge: data.serviceCharge || '',
            paymentStatus: data.paymentStatus || 'Pending',
        });
        setSpareParts(data.spareParts && data.spareParts.length > 0 ? data.spareParts : [{ name: '', price: '' }]);
      } catch (err) {
        setError('Failed to fetch record data.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePartChange = (index, e) => {
    const newParts = [...spareParts];
    newParts[index][e.target.name] = e.target.value;
    setSpareParts(newParts);
  };
  const addPart = () => setSpareParts([...spareParts, { name: '', price: '' }]);
  const removePart = (index) => {
    if (spareParts.length > 1) {
      setSpareParts(spareParts.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    const validSpareParts = spareParts.filter(part => part.name.trim() !== '' && part.price.toString().trim() !== '');
    data.append('spareParts', JSON.stringify(validSpareParts));

    try {
      await api.put(`/records/${id}`, data, config);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update record.');
    }
  };

  if (loading) return <Container sx={{mt:5, textAlign:'center'}}><CircularProgress /></Container>;

  return (
    <Container maxWidth="md">
      <Toolbar />
      <Paper sx={{ p: { xs: 2, sm: 4 }, mt: 4 }}>
        <Typography variant="h4" gutterBottom>Edit Repair Record</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Form Fields */}
            <Grid item xs={12} sm={6}><TextField fullWidth label="Mobile Model" name="mobileModel" value={formData.mobileModel} onChange={handleFormChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Customer Name" name="customerName" value={formData.customerName} onChange={handleFormChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Customer Phone (Optional)" name="customerPhone" value={formData.customerPhone} onChange={handleFormChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Complaint Details" name="complaint" multiline rows={3} value={formData.complaint} onChange={handleFormChange} required /></Grid>
            
            {/* Spare Parts */}
            <Grid item xs={12}><Typography variant="h6">Spare Parts</Typography></Grid>
            {spareParts.map((part, index) => (
              <Grid container item spacing={2} key={index} alignItems="center">
                <Grid item xs={6} sm={7}><TextField fullWidth label="Part Name" name="name" value={part.name} onChange={e => handlePartChange(index, e)} /></Grid>
                <Grid item xs={4} sm={3}><TextField fullWidth label="Price" name="price" type="number" value={part.price} onChange={e => handlePartChange(index, e)} /></Grid>
                <Grid item xs={2} sm={2}><IconButton onClick={() => removePart(index)}><RemoveIcon /></IconButton></Grid>
              </Grid>
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
            {/* Total Price Display */}
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Total Price (INR)" value={totalPrice.toFixed(2)} InputProps={{ readOnly: true }} variant="filled" />
            </Grid>
            
            <Grid item xs={12}><Button type="submit" variant="contained" color="primary" size="large">Update Record</Button></Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditRecord;
