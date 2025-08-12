import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { 
  Container, Grid, Card, CardContent, Typography, Box, CircularProgress, 
  Button, Toolbar
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';

const FinancialSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/summary');
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleExport = async (type) => {
    setExporting(true);
    try {
        const response = await api.get(`/records/export/${type}`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `records_export.${type === 'excel' ? 'xlsx' : 'pdf'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error(`Failed to export to ${type}:`, error);
        alert('Export failed. Please try again.');
    } finally {
        setExporting(false);
    }
  };

  const safeSummary = summary || {
    dailyCollections: 0, monthlyCollections: 0, yearlyCollections: 0,
    dailyProfit: { withParts: 0, withoutParts: 0 },
    monthlyProfit: { withParts: 0, withoutParts: 0 },
    yearlyProfit: { withParts: 0, withoutParts: 0 },
    earningsTrend: [],
  };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Financial Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => handleExport('excel')} disabled={loading || exporting}>
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
          <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={() => handleExport('pdf')} disabled={loading || exporting}>
            {exporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}><Card elevation={3}><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6">Daily Collections</Typography>
            <Typography variant="h4" color="primary">₹{safeSummary.dailyCollections.toFixed(2)}</Typography>
          </CardContent></Card></Grid>
          <Grid item xs={12} sm={4}><Card elevation={3}><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6">Monthly Collections</Typography>
            <Typography variant="h4" color="primary">₹{safeSummary.monthlyCollections.toFixed(2)}</Typography>
          </CardContent></Card></Grid>
          <Grid item xs={12} sm={4}><Card elevation={3}><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6">Yearly Collections</Typography>
            <Typography variant="h4" color="primary">₹{safeSummary.yearlyCollections.toFixed(2)}</Typography>
          </CardContent></Card></Grid>
          <Grid item xs={12} md={6}><Card elevation={3}><CardContent>
            <Typography variant="h6" textAlign="center" gutterBottom>Daily Profit</Typography>
            <Typography variant="body1">With Parts: ₹{safeSummary.dailyProfit.withParts.toFixed(2)}</Typography>
            <Typography variant="body1">Without Parts (Service Only): ₹{safeSummary.dailyProfit.withoutParts.toFixed(2)}</Typography>
          </CardContent></Card></Grid>
          <Grid item xs={12} md={6}><Card elevation={3}><CardContent>
            <Typography variant="h6" textAlign="center" gutterBottom>Monthly Profit</Typography>
            <Typography variant="body1">With Parts: ₹{safeSummary.monthlyProfit.withParts.toFixed(2)}</Typography>
            <Typography variant="body1">Without Parts (Service Only): ₹{safeSummary.monthlyProfit.withoutParts.toFixed(2)}</Typography>
          </CardContent></Card></Grid>
          <Grid item xs={12}><Card elevation={3}><CardContent sx={{ height: 400 }}>
            <Typography variant="h6" mb={2}>Monthly Earnings Trend</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={safeSummary.earningsTrend}>
                <CartesianGrid strokeDasharray="3 3" /> <XAxis dataKey="name" /> <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} /> <Legend />
                <Bar dataKey="earnings" fill="#8884d8" name="Total Earnings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card></Grid>
        </Grid>
      )}
    </Container>
  );
};

export default FinancialSummary;
