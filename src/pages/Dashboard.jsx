import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Container, Typography, Box, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Grid, Toolbar,
  // NEW: Import components for the modal dialog
  Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility'; // NEW: View Icon
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// NEW: A component for the View Record Dialog
const ViewRecordDialog = ({ record, open, onClose }) => {
  if (!record) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Repair Details for {record.mobileModel}
        <Chip 
          label={record.paymentStatus}
          color={record.paymentStatus === 'Paid' ? 'success' : 'warning'}
          size="small"
          sx={{ ml: 2 }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}><Typography variant="subtitle2">Service Date:</Typography><Typography>{new Date(record.date).toLocaleDateString()}</Typography></Grid>
          <Grid item xs={6}><Typography variant="subtitle2">Customer Name:</Typography><Typography>{record.customerName}</Typography></Grid>
          <Grid item xs={6}><Typography variant="subtitle2">Customer Phone:</Typography><Typography>{record.customerPhone || 'N/A'}</Typography></Grid>
          <Grid item xs={12}><Typography variant="subtitle2">Complaint:</Typography><Typography>{record.complaint}</Typography></Grid>
          
          <Grid item xs={12}><Typography variant="subtitle2" sx={{ mt: 2 }}>Billing Details</Typography></Grid>
          {record.spareParts && record.spareParts.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="body2">Spare Parts:</Typography>
              {record.spareParts.map(part => (
                <Box key={part._id} sx={{ display: 'flex', justifyContent: 'space-between', pl: 2 }}>
                  <Typography variant="body2">- {part.name}</Typography>
                  <Typography variant="body2">₹{part.price.toFixed(2)}</Typography>
                </Box>
              ))}
            </Grid>
          )}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pl: 2 }}>
              <Typography variant="body2">Service Charge:</Typography>
              <Typography variant="body2">₹{record.serviceCharge.toFixed(2)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', pl: 2, fontWeight: 'bold' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total Price:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>₹{record.totalPrice.toFixed(2)}</Typography>
            </Box>
          </Grid>

          {(record.beforePhoto?.url || record.afterPhoto?.url) && (
            <Grid item xs={12}><Typography variant="subtitle2" sx={{ mt: 2 }}>Photos</Typography></Grid>
          )}
          {record.beforePhoto?.url && <Grid item xs={6}><Typography>Before:</Typography><img src={record.beforePhoto.url} alt="Before" width="100%" /></Grid>}
          {record.afterPhoto?.url && <Grid item xs={6}><Typography>After:</Typography><img src={record.afterPhoto.url} alt="After" width="100%" /></Grid>}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};


const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const { user } = useAuth();
  
  // NEW: State for managing the dialog
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewOpen, setViewOpen] = useState(false);

  const fetchRecords = async () => { /* ... (this function remains the same) ... */ };
  useEffect(() => { fetchRecords(); }, [search, status, sort]);
  const handleDelete = async (id) => { /* ... (this function remains the same) ... */ };
  const handleInvoiceDownload = async (id) => { /* ... (this function remains the same) ... */ };

  // NEW: Functions to open and close the dialog
  const handleViewOpen = (record) => {
    setSelectedRecord(record);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedRecord(null);
  };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Typography variant="h4" gutterBottom>Repair Records Dashboard</Typography>
      
      {/* ... (The filter section remains the same) ... */}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {/* ... (The table header remains the same) ... */}
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record._id}>
                {/* ... (The other table cells remain the same) ... */}
                {user?.role === 'Admin' && (
                  <TableCell align="right">
                    {/* NEW: View Button */}
                    <IconButton onClick={() => handleViewOpen(record)} color="info" title="View Details">
                      <VisibilityIcon />
                    </IconButton>
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

      {/* NEW: Render the Dialog component */}
      <ViewRecordDialog record={selectedRecord} open={isViewOpen} onClose={handleViewClose} />
    </Container>
  );
};

export default Dashboard;
