import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Container, Typography, Box, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Grid, Toolbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // Import the PDF icon
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const { user } = useAuth();

  const fetchRecords = async () => { /* ... (this function remains the same) ... */ };
  useEffect(() => { fetchRecords(); }, [search, status, sort]);
  const handleDelete = async (id) => { /* ... (this function remains the same) ... */ };

  // NEW FUNCTION: Handle invoice download
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
      <Toolbar/>
      <Typography variant="h4" gutterBottom>Repair Records Dashboard</Typography>
      
      {/* ... (The filter section remains the same) ... */}
      
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
                    {/* NEW: Invoice Button */}
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

export default Dashboard;```

After committing these changes, your app will be updated. Admins will now see a new PDF icon in the "Actions" column on the dashboard. Clicking it will generate and download a professional invoice for that specific repair.
