import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { team } from '../../services/api';
import { RootState } from '../../store';
import { User } from '../../types';

interface TeamMember extends User {
  lastEvaluation?: {
    date: string;
    score: number;
  };
  evaluationStatus: 'pending' | 'completed' | 'overdue';
}

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user?.id) return;

      try {
        const [membersResponse, analyticsResponse] = await Promise.all([
          team.getReportees(user.id),
          team.getTeamAnalytics(user.id),
        ]);

        setTeamMembers(membersResponse.data);
        setTeamMetrics(analyticsResponse.data);
      } catch (error) {
        setError('Failed to fetch team data');
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [user?.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pendingEvaluations = teamMembers.filter(
    (member) => member.evaluationStatus === 'pending'
  );

  const overdueEvaluations = teamMembers.filter(
    (member) => member.evaluationStatus === 'overdue'
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Manager Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Team Size</Typography>
              </Box>
              <Typography variant="h3">{teamMembers.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Evaluations</Typography>
              </Box>
              <Typography variant="h3">{pendingEvaluations.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Team Average</Typography>
              </Box>
              <Typography variant="h3">
                {teamMetrics?.averageScores?.overall.toFixed(1) || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Evaluations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Pending Evaluations</Typography>
              {pendingEvaluations.length > 0 && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/manager/team')}
                >
                  Start Evaluation
                </Button>
              )}
            </Box>
            {pendingEvaluations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography>All evaluations are up to date!</Typography>
              </Box>
            ) : (
              <List>
                {pendingEvaluations.map((member) => (
                  <React.Fragment key={member.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.name}
                        secondary={`Last evaluation: ${
                          member.lastEvaluation?.date || 'Never'
                        }`}
                      />
                      {member.evaluationStatus === 'overdue' ? (
                        <Chip
                          label="Overdue"
                          color="error"
                          size="small"
                          icon={<WarningIcon />}
                        />
                      ) : (
                        <Chip label="Pending" color="warning" size="small" />
                      )}
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Team Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Team Performance</Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/manager/analytics')}
              >
                View Details
              </Button>
            </Box>
            <Grid container spacing={2}>
              {teamMetrics && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Discovery
                    </Typography>
                    <Typography variant="h6">
                      {teamMetrics.averageScores.discovery.toFixed(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Specification
                    </Typography>
                    <Typography variant="h6">
                      {teamMetrics.averageScores.specification.toFixed(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Delivery
                    </Typography>
                    <Typography variant="h6">
                      {teamMetrics.averageScores.delivery.toFixed(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Communication
                    </Typography>
                    <Typography variant="h6">
                      {teamMetrics.averageScores.communication.toFixed(1)}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;
