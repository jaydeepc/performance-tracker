import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { team } from '../../services/api';
import { TeamAnalytics } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<TeamAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // In a real app, we'd pass the timeRange to the API
        const response = await team.getTeamAnalytics('all');
        setAnalyticsData(response.data);
      } catch (error) {
        setError('Failed to fetch analytics data');
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !analyticsData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || 'No data available'}</Typography>
      </Box>
    );
  }

  const trendData = {
    labels: analyticsData.trendData.map((item) => item.period),
    datasets: [
      {
        label: 'Average Performance Score',
        data: analyticsData.trendData.map((item) => item.averageScore),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const categoryScores = {
    labels: [
      'Discovery',
      'Specification',
      'Roadmap',
      'Delivery',
      'Analytics',
      'Communication',
    ],
    datasets: [
      {
        label: 'Average Category Scores',
        data: [
          analyticsData.averageScores.discovery,
          analyticsData.averageScores.specification,
          analyticsData.averageScores.roadmap,
          analyticsData.averageScores.delivery,
          analyticsData.averageScores.analytics,
          analyticsData.averageScores.communication,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
      },
    ],
  };

  const distributionData = {
    labels: analyticsData.distributionData.ranges.map((item) => item.range),
    datasets: [
      {
        data: analyticsData.distributionData.ranges.map((item) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Organization Analytics</Typography>
        <TextField
          select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="week">Last Week</MenuItem>
          <MenuItem value="month">Last Month</MenuItem>
          <MenuItem value="quarter">Last Quarter</MenuItem>
          <MenuItem value="year">Last Year</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Performance Trend
            </Typography>
            <Line
              data={trendData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                  },
                },
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Category Performance
            </Typography>
            <Bar
              data={categoryScores}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                  },
                },
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Score Distribution
            </Typography>
            <Box sx={{ maxWidth: 400, margin: '0 auto' }}>
              <Doughnut
                data={distributionData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Key Insights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" color="primary">
                  Overall Performance
                </Typography>
                <Typography variant="body2">
                  Average score: {analyticsData.averageScores.overall.toFixed(2)}/10
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" color="primary">
                  Top Performing Area
                </Typography>
                <Typography variant="body2">
                  {Object.entries(analyticsData.averageScores)
                    .filter(([key]) => key !== 'overall')
                    .reduce((a, b) => (a[1] > b[1] ? a : b))[0]}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" color="primary">
                  Area Needing Improvement
                </Typography>
                <Typography variant="body2">
                  {Object.entries(analyticsData.averageScores)
                    .filter(([key]) => key !== 'overall')
                    .reduce((a, b) => (a[1] < b[1] ? a : b))[0]}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
