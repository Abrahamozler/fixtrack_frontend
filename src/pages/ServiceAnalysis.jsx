import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Container, Grid, Paper, Typography, Box, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Toolbar
} from '@mui/material';

const StatCard = ({ title, value, isCurrency = false }) => (
  <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
    <Typography variant="h6" color="text.secondary">{title}</Typography>
    <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
      {isCurrency ? `₹${(value || 0).toFixed(2)}` : value || 0}
    </Typography>
  </Paper>
);

const ServiceAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/analysis?period=${period}`);
        setAnalysis(data);
      } catch (error) {
        console.error('Failed to fetch analysis', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [period]);

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Service Analysis
        </Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={period}
            label="Time Period"
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value="daily">Last 24 Hours</MenuItem>
            <MenuItem value="weekly">Last 7 Days</MenuItem>
            <MenuItem value="monthly">Last 30 Days</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : analysis && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Repairs" value={analysis.totalRepairs} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Income" value={analysis.totalIncome} isCurrency />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Spare Parts Cost" value={analysis.totalSparePartsCost} isCurrency />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Profit" value={analysis.profit} isCurrency />
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ServiceAnalysis;
