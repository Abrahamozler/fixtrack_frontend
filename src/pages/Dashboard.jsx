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

// Helper function to format date to YYYY-MM-DD for the input fields
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
};

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    // NEW: Add date filters
    startDate: '',
    endDate: ''
  });
  const [sort, setSort] = useState('newest');
  const { user } = useAuth();

  const fetchRecords = async () => {
    try {
      const { data } = await api.get('/records', {
        params: { ...filters, sort } // Pass all filters and sort
      });
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records', error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters, sort]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => { /* ... (this function remains the same) ... */ };
  const handleInvoiceDownload = async (id) => { /* ... (this function remains the same) ... */ };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Typography variant="h4" gutterBottom>Repair Records Dashboard</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search by Model or Name"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </Grid>
          {/* --- NEW: DATE RANGE FILTERS --- */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={filters.status} label="Status" onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* --- ADD NEW and SORTING --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button variant="contained" component={Link} to="/add-record">
          Add New Record
        </Button>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value)}>
            <MenuItem value="newest">Date (Newest First)</MenuItem>
            <MenuItem value="oldest">Date (Oldest First)</MenuItem>
            <MenuItem value="priceHigh">Price (High to Low)</MenuItem>
            <MenuItem value="priceLow">Price (Low to High)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        {/* ... (The table structure remains the same) ... */}
      </TableContainer>
    </Container>
  );
};

export default Dashboard;
