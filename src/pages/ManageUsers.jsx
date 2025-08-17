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
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  // Fetch referral code and users
  const fetchReferralCode = async () => {
    try {
      const { data } = await api.get('/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (data?.staffReferralCode) setReferralCode(data.staffReferralCode);
    } catch (err) {
      console.error('Failed to fetch referral code', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralCode();
    fetchUsers();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await api.post('/auth/register', {
        username,
        password,
        referralCode
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsername('');
      setPassword('');
      setMessage('Staff added successfully!');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchUsers();
      setMessage('User deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <Container maxWidth="md">
      <Toolbar/>
      <Typography variant="h4" gutterBottom>Manage Users</Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Add New Staff Member</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Current referral code: <b>{referralCode || 'Loading...'}</b>
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <Box component="form" onSubmit={handleAddStaff} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Staff'}
          </Button>
        </Box>
      </Paper>

      <Paper>
        {loading ? (
          <Typography sx={{ p: 3 }}>Loading users...</Typography>
        ) : (
          <TableContainer>
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
                      <IconButton 
                        onClick={() => handleDelete(user._id)} 
                        color="error" 
                        disabled={user.role === 'Admin'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default ManageUsers;
