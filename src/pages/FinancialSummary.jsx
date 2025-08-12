import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { 
  Container, Grid, Paper, Typography, Box, CircularProgress, 
  Button, Toolbar, Card, CardContent // Import Card components for better UI
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DownloadIcon from '@mui/icons-material/Download'; // Import icon for buttons

const FinancialSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false); // State for export loading

  useEffect(() => { /* ... (fetchSummary function remains the same) ... */ }, []);

  // THIS IS THE CORRECTED EXPORT FUNCTION
  const handleExport = async (type) => {
    setExporting(true); // Show loading feedback
    try {
        const response = await api.get(`/records/export/${type}`, {
            responseType: 'blob', // This is crucial for file downloads
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `financial_summary.${type === 'excel' ? 'xlsx' : 'pdf'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error(`Failed to export to ${type}`, error);
        alert('Export failed. Please try again.');
    } finally {
        setExporting(false); // Hide loading feedback
    }
  };

  if (loading) { /* ... (loading spinner remains the same) ... */ }
  
  const safeSummary = summary || { /* ... (safeSummary object remains the same) ... */ };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom>Financial Summary</Typography>
        {/* NEW: Export Buttons with loading state */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            onClick={() => handleExport('excel')}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('pdf')}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export to PDF'}
          </Button>
        </Box>
      </Box>

      {/* NEW: Improved UI with Cards */}
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="earnings" fill="#8884d8" name="Total Earnings" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card></Grid>
      </Grid>
    </Container>
  );
};

export default FinancialSummary;
