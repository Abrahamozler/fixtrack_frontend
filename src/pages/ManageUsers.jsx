import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, Box, TextField, Alert,
  Toolbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchReferralCode();
  }, []);

  const fetchUsers = async () => {
    const { data } = await api.get('/users');
    setUsers(data);
  };

  const fetchReferralCode = async () => {
    try {
      const { data } = await api.get('/settings');
      if (data?.staffReferralCode) setReferralCode(data.staffReferralCode);
    } catch (err) {
      console.error('Failed to fetch referral code.');
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', { 
        username, 
        password, 
        referralCode // ✅ automatically uses the backend code
      });
      setUsername('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Toolbar />
      <Typography variant="h4" gutterBottom>Manage Users</Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Add New Staff Member</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleAddStaff} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" variant="contained">Add Staff</Button>
        </Box>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(user._id)} color="error" disabled={user.role === 'Admin'}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ManageUsers;
