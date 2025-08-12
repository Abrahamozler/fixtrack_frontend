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
      const { data } = await api.get('/records', { params: { search, status, sort } });
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records', error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search, status, sort]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/records/${id}`);
        fetchRecords();
      } catch (error) {
        console.error('Failed to delete record', error);
      }
    }
  };

  const handleInvoiceDownload = async (id) => {
    try {
      const response = await api.get(`/records/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `INV-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download invoice', error);
      alert('Could not download the invoice.');
    }
  };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Typography variant="h4" gutterBottom>Repair Records Dashboard</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search by Model or Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value)}>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
           <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" component={Link} to="/add-record">Add New</Button>
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
