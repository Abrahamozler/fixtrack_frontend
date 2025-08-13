import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api.js';
import {
  Container, Typography, Box, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Grid, Toolbar, CircularProgress, Alert,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, CardContent, TableSortLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalUnpaid: 0, newThisMonth: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [status, setStatus] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'recordDate', direction: 'desc' });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: debouncedSearch, status, startDate, endDate,
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction,
      };
      const { data } = await api.get('/records', { params });
      setRecords(data);
    } catch (err) {
      setError('Failed to load records.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, sortConfig, startDate, endDate]);
  
  // ... (fetchStats logic remains the same) ...

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    if (location.state?.recordUpdated) {
      fetchRecords();
      // fetchStats(); // Uncomment if you have stats
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, fetchRecords, navigate]);

  const handleSortRequest = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
  };
  
  // ... (delete dialog and invoice logic remains the same) ...

  const renderContent = () => {
    // ... (loading, error, and empty states logic remains the same) ...
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {['recordDate', 'mobileModel', 'customerName', 'totalPrice', 'paymentStatus'].map((headCell) => (
                <TableCell key={headCell}>
                  <TableSortLabel
                    active={sortConfig.key === headCell}
                    direction={sortConfig.key === headCell ? sortConfig.direction : 'asc'}
                    onClick={() => handleSortRequest(headCell)}
                  >
                    {/* Simple title casing */}
                    {headCell.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </TableSortLabel>
                </TableCell>
              ))}
              {user?.role === 'Admin' && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{record.recordDate ? new Date(record.recordDate).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{record.mobileModel}</TableCell>
                <TableCell>{record.customerName}</TableCell>
                <TableCell>₹{record.totalPrice.toFixed(2)}</TableCell>
                <TableCell>{record.paymentStatus}</TableCell>
                {/* ... (actions cell logic) ... */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // ... (The rest of the return statement with Filters, Stat Cards, and Dialog)
  return (
    <Container maxWidth="lg">
         {/* ... The rest of your JSX ... */}
         {renderContent()}
         {/* ... Dialog ... */}
    </Container>
  );
};

export default Dashboard;
