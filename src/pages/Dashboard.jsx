import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Container, Typography, Box, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Grid, Toolbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const { user } = useAuth();

  const fetchRecords = async () => {
    try {
      const { data } = await api.get('/records', {
        // We now pass all filters and the sort option to the backend
        params: { search, status, sort }
      });
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records', error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search, status, sort]);

  const handleDelete = async (id) => { /* ... (this function is correct) ... */ };
  const handleInvoiceDownload = async (id) => { /* ... (this function is correct) ... */ };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Typography variant="h4" gutterBottom>Repair Records Dashboard</Typography>
      
      {/* --- THIS IS YOUR PREFERRED LAYOUT --- */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search by Model or Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value)}>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="priceHigh">Price (High to Low)</MenuItem>
                <MenuItem value="priceLow">Price (Low to High)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
             <Button fullWidth variant="contained" component={Link} to="/add-record">
                Add New
             </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total Price (INR)</TableCell>
              <TableCell>Status</TableCell>
              {user?.role === 'Admin' && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record._id}>
                {/* Correctly format the date */}
                <TableCell>{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{record.mobileModel || 'N/A'}</TableCell>
                <TableCell>{record.customerName || 'N/A'}</TableCell>
                <TableCell>₹{(record.totalPrice || 0).toFixed(2)}</TableCell>
                <TableCell>{record.paymentStatus || 'N/A'}</TableCell>
                {user?.role === 'Admin' && (
                  <TableCell align="right">
                    <IconButton onClick={() => handleInvoiceDownload(record._id)} color="default" title="Download Invoice">
                      <PictureAsPdfIcon />
                    </IconButton>
                    <IconButton component={Link} to={`/edit-record/${record._id}`} color="primary" title="Edit Record">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(record._id)} color="error" title="Delete Record">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Dashboard;
