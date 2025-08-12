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
        console.error('Failed to fetch summary', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleExport = async (type) => { /* ... (this function is correct) ... */ };

  if (loading) {
    return (
      <Container sx={{ mt: 5, textAlign: 'center' }}>
        <Toolbar /> <CircularProgress />
      </Container>
    );
  }
  
  // This safeSummary object is the key to preventing crashes
  const safeSummary = summary || {
    dailyCollections: 0,
    monthlyCollections: 0,
    yearlyCollections: 0,
    dailyProfit: { withParts: 0, withoutParts: 0 },
    monthlyProfit: { withParts: 0, withoutParts: 0 },
    yearlyProfit: { withParts: 0, withoutParts: 0 },
    earningsTrend: [],
  };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom>Financial Summary</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => handleExport('excel')} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
          <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={() => handleExport('pdf')} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* ... (The JSX for displaying the cards and chart is correct) ... */}
      </Grid>
    </Container>
  );
};

export default FinancialSummary;
