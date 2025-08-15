import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Container, Grid, Card, CardContent, Typography, Box, CircularProgress,
  Toolbar, Paper, TextField, ToggleButtonGroup, ToggleButton
} from '@mui/material';

// Helper function to format date to YYYY-MM-DD for input fields
const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
};

// --- THIS IS THE CORRECTED StatCard COMPONENT ---
const StatCard = ({ title, value, isCurrency = false }) => (
  <Card elevation={3} sx={{ height: '100%' }}>
    <CardContent sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h6" color="text.secondary">{title}</Typography>
      <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
        {isCurrency ? `₹${(value || 0).toFixed(2)}` : value || 0}
      </Typography>
    </CardContent>
  </Card>
);
// --- END OF CORRECTION ---

const ServiceAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      if (quickFilter === 'custom' && (!startDate || !endDate)) {
        setAnalysis(null);
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/analysis', {
          params: { startDate, endDate }
        });
        setAnalysis(data);
      } catch (error) {
        console.error('Failed to fetch analysis:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [startDate, endDate]);

  const handleQuickFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setQuickFilter(newFilter);
      const today = new Date();
      switch (newFilter) {
        case 'today':
          setStartDate(formatDate(today));
          setEndDate(formatDate(today));
          break;
        case 'yesterday':
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          setStartDate(formatDate(yesterday));
          setEndDate(formatDate(yesterday));
          break;
        case 'last7':
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          setStartDate(formatDate(weekAgo));
          setEndDate(formatDate(today));
          break;
        case 'thisMonth':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          setStartDate(formatDate(startOfMonth));
          setEndDate(formatDate(today));
          break;
        case 'all':
          setStartDate('1970-01-01');
          setEndDate(formatDate(today));
          break;
        case 'custom':
          break;
        default:
          break;
      }
    }
  };

  const safeAnalysis = analysis || { totalRepairs: 0, totalIncome: 0, totalSparePartsCost: 0, profit: 0 };

  return (
    <Container maxWidth="lg">
      <Toolbar />
      <Typography variant="h4" component="h1" gutterBottom>
        Service Analysis
      </Typography>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="subtitle1">Quick Filters</Typography>
            <ToggleButtonGroup value={quickFilter} exclusive onChange={handleQuickFilterChange} fullWidth sx={{flexWrap: 'wrap'}}>
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="yesterday">Yesterday</ToggleButton>
              <ToggleButton value="last7">Last 7 Days</ToggleButton>
              <ToggleButton value="thisMonth">This Month</ToggleButton>
              <ToggleButton value="all">All Time</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Start Date" type="date" value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setQuickFilter('custom'); }}
              InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="End Date" type="date" value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setQuickFilter('custom'); }}
              InputLabelProps={{ shrink: true }} />
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}><StatCard title="Total Repairs" value={safeAnalysis.totalRepairs} /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard title="Total Income" value={safeAnalysis.totalIncome} isCurrency /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard title="Spare Parts Cost" value={safeAnalysis.totalSparePartsCost} isCurrency /></Grid>
          <Grid item xs={12} sm={6} md={3}><StatCard title="Total Profit" value={safeAnalysis.profit} isCurrency /></Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ServiceAnalysis;
