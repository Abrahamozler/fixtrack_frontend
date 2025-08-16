import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Container, Typography, Paper, TextField, Button, Box, Alert, Toolbar } from '@mui/material';

const SettingsPage = () => {
    const [referralCode, setReferralCode] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCode = async () => {
            const { data } = await api.get('/settings');
            if (data) setReferralCode(data.staffReferralCode);
        };
        fetchCode();
    }, []);

    const handleUpdate = async () => {
        try {
            await api.put('/settings', { staffReferralCode: referralCode });
            setMessage('Referral code updated successfully!');
        } catch (error) {
            setMessage('Failed to update code.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Toolbar />
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>Admin Settings</Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Set the secret referral code that new staff members must use to register an account.
                </Typography>
                <Box sx={{ mt: 3 }}>
                    <TextField
                        fullWidth
                        label="Staff Referral Code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={handleUpdate}
                    >
                        Save Code
                    </Button>
                    {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
                </Box>
            </Paper>
        </Container>
    );
};

export default SettingsPage;
