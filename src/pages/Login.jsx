import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Container, Box, TextField, Button, Typography, Alert, Paper, Divider,
  FormControlLabel, Checkbox
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); 
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password, rememberMe);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
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
            margin="normal" required fullWidth id="username" label="Username" name="username"
            autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth name="password" label="Password" type="password"
            id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
          />
          
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
      </Paper>
    </Container>
  );
};

export default Login;
