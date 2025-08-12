import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { 
  Container, Grid, Card, CardContent, Typography, Box, CircularProgress, 
  Button, Toolbar
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';

const StatCard = ({ title, value, isCurrency = true }) => (
  <Card elevation={3} sx={{ height: '100%' }}>
    <CardContent sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
      <Typography variant="h5" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
        {isCurrency ? `₹${(value || 0).toFixed(2)}` : value || 0}
      </Typography>
    </CardContent>
  </Card>
);

const FinancialSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingType, setExportingType] = useState(null); // 'excel', 'pdf', or null

  useEffect(() => { /* ... (fetchSummary logic is correct) ... */ }, []);

  const handleExport = async (type) => {
    setExportingType(type); // Set which button is loading
    try {
        const response = await api.get(`/records/export/${type}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `summary_export.${type}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error(`Failed to export to ${type}:`, error);
        alert('Export failed. Please try again.');
    } finally {
        setExportingType(null); // Reset loading state for both buttons
    }
  };

  const safeSummary = summary || { /* ... (safeSummary logic is correct) ... */ };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Financial Summary
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />} 
          onClick={() => handleExport('xlsx')}
          disabled={loading || exportingType === 'excel'}
        >
          {exportingType === 'excel' ? 'Exporting...' : 'Export Excel'}
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<DownloadIcon />}
          onClick={() => handleExport('pdf')}
          disabled={loading || exportingType === 'pdf'}
        >
          {exportingType === 'pdf' ? 'Exporting...' : 'Export PDF'}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={50} /></Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}><StatCard title="Daily Collections" value={safeSummary.dailyCollections} /></Grid>
          <Grid item xs={12} sm={4}><StatCard title="Monthly Collections" value={safeSummary.monthlyCollections} /></Grid>
          <Grid item xs={12} sm={4}><StatCard title="Yearly Collections" value={safeSummary.yearlyCollections} /></Grid>
          
          <Grid item xs={12} md={6}><Card elevation={3}><CardContent>
            <Typography variant="h6" textAlign="center" gutterBottom>Daily Profit</Typography>
            <Typography variant="body1">With Parts: ₹{safeSummary.dailyProfit.withParts.toFixed(2)}</Typography>
            <Typography variant="body1">Service Only: ₹{safeSummary.dailyProfit.withoutParts.toFixed(2)}</Typography>
          </CardContent></Card></Grid>
          <Grid item xs={12} md={6}><Card elevation={3}><CardContent>
            <Typography variant="h6" textAlign="center" gutterBottom>Monthly Profit</Typography>
            <Typography variant="body1">With Parts: ₹{safeSummary.monthlyProfit.withParts.toFixed(2)}</Typography>
            <Typography variant="body1">Service Only: ₹{safeSummary.monthlyProfit.withoutParts.toFixed(2)}</Typography>
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
