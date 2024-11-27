import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  SupervisorAccount as ManagerIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import { users } from '../../services/api';
import { User } from '../../types';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            sx: { color: color },
          })}
        </Box>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    managers: 0,
    reportees: 0,
    pendingEvaluations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await users.getAll();
        const allUsers = response.data as User[];
        
        setStats({
          totalUsers: allUsers.length,
          managers: allUsers.filter((user: User) => user.role === 'manager').length,
          reportees: allUsers.filter((user: User) => user.role === 'reportee').length,
          pendingEvaluations: 0, // This would come from a separate API call
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Managers"
            value={stats.managers}
            icon={<ManagerIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Reportees"
            value={stats.reportees}
            icon={<UserIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Evaluations"
            value={stats.pendingEvaluations}
            icon={<AssessmentIcon />}
            color="#f44336"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon: Activity feed showing recent user registrations,
              evaluation submissions, and system updates.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              System Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coming soon: System health metrics, API status, and important
              notifications.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
