import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Container, Box, TextField, Button, Typography, Alert, Paper, Divider,
  FormControlLabel, Checkbox // Import new components
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // NEW: State for the "Remember Me" checkbox
  const [rememberMe, setRememberMe] = useState(true); 
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // NEW: Pass the rememberMe state to the login function
      await login(email, password, rememberMe);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    try {
      // Guest login will always be "remembered" for convenience
      await login('guest@example.com', 'guestpassword123', true);
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
            margin="normal" required fullWidth id="email" label="Email Address" name="email"
            autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth name="password" label="Password" type="password"
            id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
          />
          
          {/* NEW: "Remember Me" Checkbox */}
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
            label="Remember Me"
          />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 1, mb: 2 }}>
            Sign In
          </Button>

          <Typography variant="body2" align="center">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </Typography>
        </Box>
        <Divider sx={{ my: 2, width: '100%' }} />
        <Button fullWidth variant="outlined" onClick={handleGuestLogin}>
          Continue as Guest
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;
