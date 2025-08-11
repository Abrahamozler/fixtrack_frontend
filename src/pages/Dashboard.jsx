import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Container, Typography, Box, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Grid, Toolbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
        params: { search, status, sort }
      });
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records', error);
      // You could set an error state here to show a message to the user
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search, status, sort]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/records/${id}`);
        fetchRecords(); // Refresh list
      } catch (error) {
        console.error('Failed to delete record', error);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Toolbar/>
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
              {user?.role === 'Admin' && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record._id}>
                {/* FIX: Handle potentially missing date */}
                <TableCell>{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{record.mobileModel || 'N/A'}</TableCell>
                <TableCell>{record.customerName || 'N/A'}</TableCell>
                {/* FIX: Handle potentially missing price to prevent crash */}
                <TableCell>₹{(record.totalPrice || 0).toFixed(2)}</TableCell>
                <TableCell>{record.paymentStatus || 'N/A'}</TableCell>
                {user?.role === 'Admin' && (
                  <TableCell>
                    <IconButton component={Link} to={`/edit-record/${record._id}`} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(record._id)} color="error">
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
