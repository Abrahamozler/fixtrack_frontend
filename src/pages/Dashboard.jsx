import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api.js';
import {
  Container, Typography, Box, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Grid, Toolbar, CircularProgress, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, CardContent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalUnpaid: 0, newThisMonth: 0, totalRevenue: 0 }); // NEW: For stat cards
  const [loading, setLoading] = useState(true); // NEW: For loading spinner
  const [error, setError] = useState(''); // NEW: For error messages

  // --- Filtering & Sorting State ---
  const [searchTerm, setSearchTerm] = useState(''); // User's live input
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm); // Debounced value for API call
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [startDate, setStartDate] = useState(''); // NEW: Date range filter
  const [endDate, setEndDate] = useState('');   // NEW: Date range filter

  // --- Delete Dialog State ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // FIX: To check for state from other pages

  // --- IMPROVEMENT: Debounce search input ---
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // Wait 500ms after user stops typing
    return () => {
      clearTimeout(timerId); // Cleanup timeout
    };
  }, [searchTerm]);

  // Main data fetching logic, now in a useCallback for stability
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: debouncedSearch,
        status,
        sort,
        startDate,
        endDate
      };
      const { data } = await api.get('/records', { params });
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records', err);
      setError('Failed to load records. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, sort, startDate, endDate]);

  // Fetch stats separately
  const fetchStats = async () => {
    try {
      const { data } = await api.get('/records/stats'); // Assuming this new endpoint exists
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  }

  useEffect(() => {
    fetchRecords();
    fetchStats(); // Fetch stats on initial load and when filters change
  }, [fetchRecords]); // fetchRecords is now a dependency

  // --- FIX: Check for the `recordUpdated` flag from the Edit page ---
  useEffect(() => {
    if (location.state?.recordUpdated) {
      fetchRecords();
      fetchStats();
      // Clear the state to prevent re-fetching on other actions
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, fetchRecords, navigate]);


  // --- IMPROVEMENT: Dialog handlers for delete confirmation ---
  const handleDeleteClick = (id) => {
    setRecordToDelete(id);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setRecordToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/records/${recordToDelete}`);
      fetchRecords(); // Refresh data
      fetchStats();   // Refresh stats
    } catch (error) {
      console.error('Failed to delete record', error);
      setError('Failed to delete the record.');
    } finally {
      handleDialogClose();
    }
  };

  const handleInvoiceDownload = async (id) => {
    // (Your existing invoice logic is good, no changes needed)
  };

  const renderContent = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    }
    if (error) {
      return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
    }
    if (records.length === 0) {
      return <Typography sx={{ textAlign: 'center', my: 5 }}>No records found.</Typography>;
    }
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Status</TableCell>
              {user?.role === 'Admin' && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{new Date(record.recordDate).toLocaleDateString()}</TableCell>
                <TableCell>{record.mobileModel}</TableCell>
                <TableCell>{record.customerName}</TableCell>
                <TableCell>₹{record.totalPrice.toFixed(2)}</TableCell>
                <TableCell>{record.paymentStatus}</TableCell>
                {user?.role === 'Admin' && (
                  <TableCell align="right">
                    <IconButton onClick={() => handleInvoiceDownload(record._id)} title="Download Invoice"><PictureAsPdfIcon /></IconButton>
                    <IconButton component={Link} to={`/edit-record/${record._id}`} color="primary" title="Edit Record"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteClick(record._id)} color="error" title="Delete Record"><DeleteIcon /></IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Typography variant="h4" gutterBottom>Repair Records Dashboard</Typography>

      {/* --- NEW: Stat Cards --- */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}><Card><CardContent><Typography variant="h6">₹{stats.totalUnpaid.toFixed(2)}</Typography><Typography color="textSecondary">Total Unpaid</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={4}><Card><CardContent><Typography variant="h6">{stats.newThisMonth}</Typography><Typography color="textSecondary">New This Month</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={4}><Card><CardContent><Typography variant="h6">₹{stats.totalRevenue.toFixed(2)}</Typography><Typography color="textSecondary">Total Revenue</Typography></CardContent></Card></Grid>
      </Grid>

      {/* --- IMPROVEMENT: Filter Bar --- */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}><TextField fullWidth label="Search by Model or Name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></Grid>
          <Grid item xs={6} md={3}><FormControl fullWidth><InputLabel>Status</InputLabel><Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}><MenuItem value="">All</MenuItem><MenuItem value="Paid">Paid</MenuItem><MenuItem value="Pending">Pending</MenuItem></Select></FormControl></Grid>
          <Grid item xs={6} md={3}><FormControl fullWidth><InputLabel>Sort By</InputLabel><Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value)}><MenuItem value="newest">Newest</MenuItem><MenuItem value="oldest">Oldest</MenuItem></Select></FormControl></Grid>
          <Grid item xs={6} md={3}><TextField fullWidth type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={6} md={3}><TextField fullWidth type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={3}><Button fullWidth variant="contained" component={Link} to="/add-record">Add New Record</Button></Grid>
        </Grid>
      </Paper>
      
      {renderContent()}

      {/* --- NEW: Delete Confirmation Dialog --- */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to permanently delete this record?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
