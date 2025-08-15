import { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Container, Grid, Card, CardContent, Typography, Box, CircularProgress,
  Toolbar, Paper, Button, TextField, ToggleButtonGroup, ToggleButton
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

const StatCard = ({ title, value, isCurrency = false }) => ( /* ... (this component remains the same) ... */ );

const ServiceAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for our date filters
  const [quickFilter, setQuickFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      
      // Don't fetch if custom range is selected but dates are missing
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
  }, [startDate, endDate]); // Refetch whenever the date range changes

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
          setStartDate('1970-01-01'); // A very early date for "all time"
          setEndDate(formatDate(today));
          break;
        case 'custom':
          // Let user pick dates, do nothing here
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

      {/* --- NEW FILTER CONTROLS --- */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="subtitle1">Quick Filters</Typography>
            <ToggleButtonGroup value={quickFilter} exclusive onChange={handleQuickFilterChange} fullWidth>
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="yesterday">Yesterday</ToggleButton>
              <ToggleButton value="last7">Last 7 Days</ToggleButton>
              <ToggleButton value="thisMonth">This Month</ToggleButton>
              <ToggleButton value="all">All Time</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField fullWidth label="Start Date" type="date" value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setQuickFilter('custom'); }}
              InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={5}>
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
          {/* ... (The StatCard display is the same) ... */}
        </Grid>
      )}
    </Container>
  );
};

export default ServiceAnalysis;
