import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Container, Typography, Box, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Grid, Toolbar, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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

const formatDate = (date) => {
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
  const [filters, setFilters] = useState({ search: '', status: '', startDate: '', endDate: '' });
  const [sort, setSort] = useState('newest');
  const [quickFilter, setQuickFilter] = useState('all');
  const { user } = useAuth();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data } = await api.get('/records', {
          params: { ...filters, sort, page: currentPage }
        });
        setRecords(data.records);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Failed to fetch records:', error);
      }
    };
    fetchRecords();
  }, [filters, sort, currentPage]);

  const handleFilterChange = (e) => {
    setCurrentPage(1);
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleQuickFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setCurrentPage(1);
      setQuickFilter(newFilter);
      const today = new Date();
      let newStartDate = '', newEndDate = '';
      switch (newFilter) {
        case 'today':
          newStartDate = formatDate(today); newEndDate = formatDate(today);
          break;
        case 'yesterday':
          const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
          newStartDate = formatDate(yesterday); newEndDate = formatDate(yesterday);
          break;
        case 'thisMonth':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          newStartDate = formatDate(startOfMonth); newEndDate = formatDate(today);
          break;
        case 'all':
          newStartDate = ''; newEndDate = '';
          break;
      }
      setFilters({ ...filters, startDate: newStartDate, endDate: newEndDate });
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/records/${id}`);
        fetchRecords();
      } catch (error) { console.error('Failed to delete record:', error); }
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
    } catch (error) { console.error('Failed to download invoice:', error); }
  };

  const handleViewOpen = (record) => { setSelectedRecord(record); setViewOpen(true); };
  const handleViewClose = () => { setViewOpen(false); setSelectedRecord(null); };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Typography variant="h4" gutterBottom>Repair Records Dashboard</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}><ToggleButtonGroup value={quickFilter} exclusive onChange={handleQuickFilterChange} fullWidth sx={{flexWrap: 'wrap'}}>
            <ToggleButton value="today">Today</ToggleButton>
            <ToggleButton value="yesterday">Yesterday</ToggleButton>
            <ToggleButton value="thisMonth">This Month</ToggleButton>
            <ToggleButton value="all">All Time</ToggleButton>
          </ToggleButtonGroup></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Start Date" type="date" name="startDate" value={filters.startDate} onChange={(e) => { handleFilterChange(e); setQuickFilter('custom'); }} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="End Date" type="date" name="endDate" value={filters.endDate} onChange={(e) => { handleFilterChange(e); setQuickFilter('custom'); }} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Search by Model or Name" name="search" value={filters.search} onChange={handleFilterChange} /></Grid>
          <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select name="status" value={filters.status} label="Status" onChange={handleFilterChange}><MenuItem value="">All</MenuItem><MenuItem value="Paid">Paid</MenuItem><MenuItem value="Pending">Pending</MenuItem></Select></FormControl></Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Button variant="contained" component={Link} to="/add-record">Add New Record</Button>
        <FormControl sx={{ minWidth: 180 }}><InputLabel>Sort By</InputLabel><Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value)}><MenuItem value="newest">Date (Newest)</MenuItem><MenuItem value="oldest">Date (Oldest)</MenuItem><MenuItem value="priceHigh">Price (High-Low)</MenuItem><MenuItem value="priceLow">Price (Low-High)</MenuItem></Select></FormControl>
      </Box>
      
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

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, mt: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
        <IconButton onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          <NavigateBeforeIcon />
        </IconButton>
        <Typography>Page {currentPage} of {totalPages || 1}</Typography>
        <IconButton onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>
          <NavigateNextIcon />
        </IconButton>
      </Box>

      <ViewRecordDialog record={selectedRecord} open={isViewOpen} onClose={handleViewClose} />
    </Container>
  );
};

export default Dashboard;
