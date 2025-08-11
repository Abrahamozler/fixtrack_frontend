import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Container, Box, TextField, Button, Typography, Alert, Paper, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
    }
  };

  // NEW: Guest Login handler
  const handleGuestLogin = async () => {
    setError('');
    try {
      // Use the credentials we created in Step 1
      await login('guest@example.com', 'guestpassword123');
      navigate('/');
    } catch (err) {
      setError('Guest login failed. Ensure the guest user has been registered.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Fix Track Pro - Sign In
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Typography variant="body2" align="center">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </Typography>
        </Box>

        <Divider sx={{ my: 2, width: '100%' }}>OR</Divider>

        {/* NEW: Guest Login button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGuestLogin}
        >
          Continue as Guest
        </Button>

      </Paper>
    </Container>
  );
};

export default Login;
