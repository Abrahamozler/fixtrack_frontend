import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Container, Typography, Box, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Grid, Toolbar, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// --- View Record Dialog Component ---
const ViewRecordDialog = ({ record, open, onClose }) => {
  if (!record) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Repair Details for {record.mobileModel}
        <Chip 
          label={record.paymentStatus}
          color={record.paymentStatus === 'Paid' ? 'success' : 'warning'}
          size="small" sx={{ ml: 2 }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}><Typography variant="subtitle2">Service Date:</Typography><Typography>{new Date(record.date).toLocaleDateString()}</Typography></Grid>
          <Grid item xs={6}><Typography variant="subtitle2">Customer Name:</Typography><Typography>{record.customerName}</Typography></Grid>
          {record.customerPhone && <Grid item xs={6}><Typography variant="subtitle2">Customer Phone:</Typography><Typography>{record.customerPhone}</Typography></Grid>}
          <Grid item xs={12}><Typography variant="subtitle2">Complaint:</Typography><Typography>{record.complaint}</Typography></Grid>
          
          <Grid item xs={12}><Typography variant="subtitle2" sx={{ mt: 2 }}>Billing Details</Typography></Grid>
          {record.spareParts && record.spareParts.length > 0 && (
            <Grid item xs={12}>
              {record.spareParts.map((part, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', pl: 2 }}>
                  <Typography variant="body2">- {part.name}</Typography>
                  <Typography variant="body2">₹{part.price.toFixed(2)}</Typography>
                </Box>
              ))}
            </Grid>
          )}
          <Grid item xs={12}><Box sx={{ display: 'flex', justifyContent: 'space-between', pl: 2 }}><Typography variant="body2">Service Charge:</Typography><Typography variant="body2">₹{record.serviceCharge.toFixed(2)}</Typography></Box></Grid>
          <Grid item xs={12}><Box sx={{ display: 'flex', justifyContent: 'space-between', pl: 2, fontWeight: 'bold' }}><Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total Price:</Typography><Typography variant="body1" sx={{ fontWeight: 'bold' }}>₹{record.totalPrice.toFixed(2)}</Typography></Box></Grid>

          {(record.beforePhoto?.url || record.afterPhoto?.url) && <Grid item xs={12}><Typography variant="subtitle2" sx={{ mt: 2 }}>Photos</Typography></Grid>}
          {record.beforePhoto?.url && <Grid item xs={6}><Typography>Before:</Typography><img src={record.beforePhoto.url} alt="Before" width="100%" /></Grid>}
          {record.afterPhoto?.url && <Grid item xs={6}><Typography>After:</Typography><img src={record.afterPhoto.url} alt="After" width="100%" /></Grid>}
        </Grid>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
    </Dialog>
  );
};

// --- Main Dashboard Component ---
const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const { user } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewOpen, setViewOpen] = useState(false);

  const fetchRecords = async () => {
    try {
      const { data } = await api.get('/records', {
        params: { search, status, sort }
      });
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
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
        console.error('Failed to delete record:', error);
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
      console.error('Failed to download invoice:', error);
    }
  };
  
  const handleViewOpen = (record) => { setSelectedRecord(record); setViewOpen(true); };
  const handleViewClose = () => { setViewOpen(false); setSelectedRecord(null); };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Typography variant="h4" gutterBottom>Repair Records Dashboard</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}><TextField fullWidth label="Search by Model or Name" value={search} onChange={(e) => setSearch(e.target.value)}/></Grid>
          <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Status</InputLabel><Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}><MenuItem value="">All Statuses</MenuItem><MenuItem value="Paid">Paid</MenuItem><MenuItem value="Pending">Pending</MenuItem></Select></FormControl></Grid>
          <Grid item xs={12} sm={6} md={3}><FormControl fullWidth><InputLabel>Sort By</InputLabel><Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value)}><MenuItem value="newest">Newest First</MenuItem><MenuItem value="oldest">Oldest First</MenuItem><MenuItem value="priceHigh">Price (High to Low)</MenuItem><MenuItem value="priceLow">Price (Low to High)</MenuItem></Select></FormControl></Grid>
          <Grid item xs={12}><Button fullWidth variant="contained" component={Link} to="/add-record">Add New</Button></Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell><TableCell>Model</TableCell><TableCell>Customer</TableCell>
              <TableCell>Total Price (INR)</TableCell><TableCell>Status</TableCell>
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
                    <IconButton onClick={() => handleViewOpen(record)} color="info" title="View Details"><VisibilityIcon /></IconButton>
                    <IconButton onClick={() => handleInvoiceDownload(record._id)} color="default" title="Download Invoice"><PictureAsPdfIcon /></IconButton>
                    <IconButton component={Link} to={`/edit-record/${record._id}`} color="primary" title="Edit Record"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(record._id)} color="error" title="Delete Record"><DeleteIcon /></IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ViewRecordDialog record={selectedRecord} open={isViewOpen} onClose={handleViewClose} />
    </Container>
  );
};

export default Dashboard;
