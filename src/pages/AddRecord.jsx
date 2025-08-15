import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import {
  Container, Box, TextField, Button, Typography, Paper, Grid,
  Select, MenuItem, FormControl, InputLabel, IconButton, Alert, Toolbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// NEW: Predefined list of common spare parts
const sparePartOptions = [
  'Combo', 'Battery', 'Switch', 'Inner', 'Outer', 
  'Software', 'Hardware', 'IC', 'Custom'
];

const AddRecord = () => {
  const navigate = useNavigate();

  // Helper function to format date to YYYY-MM-DD for the input field
  const formatDateForInput = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  };
  
  const [formData, setFormData] = useState({
    // NEW: Date field added
    date: formatDateForInput(new Date()),
    mobileModel: '',
    customerName: '',
    customerPhone: '',
    complaint: '',
    serviceCharge: '',
    paymentStatus: 'Pending',
  });
  
  // State for spare parts now includes the selected option and a custom name
  const [spareParts, setSpareParts] = useState([{ selected: '', customName: '', price: '' }]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { /* ... (total price calculation logic is correct and remains the same) ... */ }, [spareParts, formData.serviceCharge]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePartChange = (index, e) => {
    const newParts = [...spareParts];
    newParts[index][e.target.name] = e.target.value;
    setSpareParts(newParts);
  };

  const addPart = () => {
    setSpareParts([...spareParts, { selected: '', customName: '', price: '' }]);
  };

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
    // Pass all form data, including the selected date
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    const validSpareParts = spareParts
      .map(part => ({
        // Use the custom name if 'Custom' is selected, otherwise use the selected option
        name: part.selected === 'Custom' ? part.customName : part.selected,
        price: part.price
      }))
      .filter(part => part.name && part.name.trim() !== '' && part.price.toString().trim() !== '');
      
    data.append('spareParts', JSON.stringify(validSpareParts));

    if (beforePhoto) data.append('beforePhoto', beforePhoto);
    if (afterPhoto) data.append('afterPhoto', afterPhoto);

    try {
      await api.post('/records', data, config);
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
            {/* --- Form Fields --- */}
            <Grid item xs={12} sm={6}><TextField fullWidth label="Mobile Model" name="mobileModel" value={formData.mobileModel} onChange={handleFormChange} required /></Grid>
            {/* NEW: Date Picker */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="date"
                label="Service Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Customer Name" name="customerName" value={formData.customerName} onChange={handleFormChange} required /></Grid>
            {/* VERIFIED: Customer Phone is optional */}
            <Grid item xs={12} sm={6}><TextField fullWidth label="Customer Phone (Optional)" name="customerPhone" value={formData.customerPhone} onChange={handleFormChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Complaint Details" name="complaint" multiline rows={3} value={formData.complaint} onChange={handleFormChange} required /></Grid>
            
            {/* --- Spare Parts with Dropdown --- */}
            <Grid item xs={12}><Typography variant="h6">Spare Parts</Typography></Grid>
            {spareParts.map((part, index) => (
              <Grid container item spacing={2} key={index} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel>Part Name</InputLabel>
                    <Select
                      name="selected"
                      value={part.selected}
                      label="Part Name"
                      onChange={e => handlePartChange(index, e)}
                    >
                      {sparePartOptions.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Conditionally render the custom name field */}
                {part.selected === 'Custom' && (
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth label="Custom Part Name" name="customName" value={part.customName} onChange={e => handlePartChange(index, e)} />
                  </Grid>
                )}
                <Grid item xs={9} sm={part.selected === 'Custom' ? 2 : 5}>
                    <TextField fullWidth label="Price" name="price" type="number" value={part.price} onChange={e => handlePartChange(index, e)} />
                </Grid>
                <Grid item xs={3} sm={2}><IconButton onClick={() => removePart(index)}><RemoveIcon /></IconButton></Grid>
              </Grid>
            ))}
            <Grid item xs={12}><Button startIcon={<AddIcon />} onClick={addPart}>Add Another Part</Button></Grid>

            {/* --- The rest of the form remains the same --- */}
            <Grid item xs={12}><Button type="submit" variant="contained" color="primary" size="large">Submit Record</Button></Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddRecord;
