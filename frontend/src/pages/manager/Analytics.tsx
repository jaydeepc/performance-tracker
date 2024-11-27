import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import { Line, Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { team } from '../../services/api';
import { RootState } from '../../store';
import { TeamAnalytics, User } from '../../types';

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

const ManagerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<TeamAnalytics | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [timeRange, setTimeRange] = useState('month');
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const [analyticsResponse, membersResponse] = await Promise.all([
          team.getTeamAnalytics(user.id),
          team.getReportees(user.id),
        ]);

        setAnalyticsData(analyticsResponse.data);
        setTeamMembers(membersResponse.data);
      } catch (error) {
        setError('Failed to fetch analytics data');
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, timeRange]);

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
        label: 'Team Average',
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
        label: 'Team Average',
        data: [
          analyticsData.averageScores.discovery,
          analyticsData.averageScores.specification,
          analyticsData.averageScores.roadmap,
          analyticsData.averageScores.delivery,
          analyticsData.averageScores.analytics,
          analyticsData.averageScores.communication,
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Team Analytics</Typography>
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
        {/* Team Overview Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Performance
              </Typography>
              <Typography variant="h3" color="primary">
                {analyticsData.averageScores.overall.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team average score
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Highest Category
              </Typography>
              <Typography variant="h3" color="success.main">
                {Object.entries(analyticsData.averageScores)
                  .filter(([key]) => key !== 'overall')
                  .reduce((a, b) => (a[1] > b[1] ? a : b))[0]
                  .replace('Score', '')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Best performing area
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Area for Improvement
              </Typography>
              <Typography variant="h3" color="error.main">
                {Object.entries(analyticsData.averageScores)
                  .filter(([key]) => key !== 'overall')
                  .reduce((a, b) => (a[1] < b[1] ? a : b))[0]
                  .replace('Score', '')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lowest scoring category
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Trend Chart */}
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

        {/* Category Performance Chart */}
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

        {/* Individual Performance Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Individual Performance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Team Member</TableCell>
                    <TableCell align="right">Latest Score</TableCell>
                    <TableCell align="right">Previous Score</TableCell>
                    <TableCell align="right">Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell align="right">
                        {/* This would come from actual evaluation data */}
                        {(Math.random() * 10).toFixed(1)}
                      </TableCell>
                      <TableCell align="right">
                        {(Math.random() * 10).toFixed(1)}
                      </TableCell>
                      <TableCell align="right">
                        {Math.random() > 0.5 ? '↑' : '↓'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Key Insights */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Key Insights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" color="primary">
                  Strengths
                </Typography>
                <Typography variant="body2">
                  The team excels in {Object.entries(analyticsData.averageScores)
                    .filter(([key]) => key !== 'overall')
                    .reduce((a, b) => (a[1] > b[1] ? a : b))[0]
                    .replace('Score', '')}{' '}
                  with an average score of{' '}
                  {Math.max(
                    ...Object.values(analyticsData.averageScores).filter(
                      (_, i) => i < Object.values(analyticsData.averageScores).length - 1
                    )
                  ).toFixed(1)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" color="error">
                  Areas for Improvement
                </Typography>
                <Typography variant="body2">
                  Focus on improving {Object.entries(analyticsData.averageScores)
                    .filter(([key]) => key !== 'overall')
                    .reduce((a, b) => (a[1] < b[1] ? a : b))[0]
                    .replace('Score', '')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" color="info.main">
                  Recommendations
                </Typography>
                <Typography variant="body2">
                  Consider implementing targeted training programs for lower-performing areas
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerAnalytics;
