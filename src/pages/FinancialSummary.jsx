import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Button, Toolbar } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/summary');
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch summary', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleExport = async (type) => {
    try {
        const response = await api.get(`/records/export/${type}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `records.${type === 'excel' ? 'xlsx' : 'pdf'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error(`Failed to export to ${type}`, error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 5, textAlign: 'center' }}>
        <Toolbar />
        <CircularProgress />
      </Container>
    );
  }
  
  // Use a default object to prevent crashes if summary is null
  const safeSummary = summary || {
    dailyCollections: 0,
    monthlyCollections: 0,
    yearlyCollections: 0,
    dailyProfit: { withParts: 0, withoutParts: 0 },
    monthlyProfit: { withParts: 0, withoutParts: 0 },
    earningsTrend: [],
  };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Typography variant="h4" gutterBottom>Financial Summary</Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
            <Button fullWidth variant="contained" onClick={() => handleExport('excel')}>Export to Excel</Button>
        </Grid>
        <Grid item xs={12} sm={6}>
            <Button fullWidth variant="contained" color="secondary" onClick={() => handleExport('pdf')}>Export to PDF</Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Collection Cards */}
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Daily Collections</Typography>
            <Typography variant="h4" color="primary">₹{safeSummary.dailyCollections.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Monthly Collections</Typography>
            <Typography variant="h4" color="primary">₹{safeSummary.monthlyCollections.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Yearly Collections</Typography>
            <Typography variant="h4" color="primary">₹{safeSummary.yearlyCollections.toFixed(2)}</Typography>
          </Paper>
        </Grid>

        {/* Profit Cards */}
        <Grid item xs={12} md={6}>
            <Paper sx={{p:2}}>
                <Typography variant="h6" textAlign="center">Daily Profit</Typography>
                <Typography variant="body1">With Parts: ₹{safeSummary.dailyProfit.withParts.toFixed(2)}</Typography>
                <Typography variant="body1">Without Parts (Service Only): ₹{safeSummary.dailyProfit.withoutParts.toFixed(2)}</Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
            <Paper sx={{p:2}}>
                <Typography variant="h6" textAlign="center">Monthly Profit</Typography>
                <Typography variant="body1">With Parts: ₹{safeSummary.monthlyProfit.withParts.toFixed(2)}</Typography>
                <Typography variant="body1">Without Parts (Service Only): ₹{safeSummary.monthlyProfit.withoutParts.toFixed(2)}</Typography>
            </Paper>
        </Grid>

        {/* Earnings Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" mb={2}>Monthly Earnings Trend</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={safeSummary.earningsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="earnings" fill="#8884d8" name="Total Earnings" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FinancialSummary;
