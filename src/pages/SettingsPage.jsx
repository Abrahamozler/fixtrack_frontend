import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Container, Typography, Paper, TextField, Button, Box, Alert, Toolbar } from '@mui/material';

const SettingsPage = () => {
    const [referralCode, setReferralCode] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchCode = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/settings');
                if (data?.staffReferralCode) setReferralCode(data.staffReferralCode);
            } catch (err) {
                setError('Failed to fetch referral code.');
            } finally {
                setLoading(false);
            }
        };
        fetchCode();
    }, []);

    const handleUpdate = async () => {
        setMessage('');
        setError('');
        if (!referralCode.trim()) {
            setError('Referral code cannot be empty.');
            return;
        }
        setUpdating(true);
        try {
            await api.put('/settings', { staffReferralCode: referralCode });
            setMessage('Referral code updated successfully!');
        } catch (err) {
            setError('Failed to update code.');
        } finally {
            setUpdating(false);
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
                    {loading ? (
                        <Typography>Loading referral code...</Typography>
                    ) : (
                        <>
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
                                disabled={updating}
                            >
                                {updating ? 'Saving...' : 'Save Code'}
                            </Button>
                            {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
                            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default SettingsPage;
