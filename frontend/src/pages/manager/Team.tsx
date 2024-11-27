import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { team, evaluations } from '../../services/api';
import { RootState } from '../../store';
import { Evaluation } from '../../types';

const Team = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [memberEvaluations, setMemberEvaluations] = useState<Evaluation[]>([]);
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user?.id) return;

      try {
        const response = await team.getReportees(user.id);
        setTeamMembers(response.data);
      } catch (error) {
        setError('Failed to fetch team data');
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [user?.id]);

  useEffect(() => {
    const fetchMemberEvaluations = async () => {
      if (!selectedMember) return;

      try {
        const response = await evaluations.getByUserId(selectedMember);
        setMemberEvaluations(response.data);
      } catch (error) {
        console.error('Error fetching member evaluations:', error);
      }
    };

    if (selectedMember) {
      fetchMemberEvaluations();
    }
  }, [selectedMember]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const handleMemberClick = (memberId: string) => {
    setSelectedMember(memberId);
    setEvaluationDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEvaluationDialogOpen(false);
    setSelectedMember(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Team
      </Typography>

      <Grid container spacing={3}>
        {teamMembers.map((member) => (
          <Grid item xs={12} sm={6} md={4} key={member.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {member.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {member.email}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {member.department}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                  }}
                >
                  <Typography
                    color={
                      member.evaluationStatus === 'completed'
                        ? 'success.main'
                        : 'warning.main'
                    }
                  >
                    {member.evaluationStatus === 'completed'
                      ? 'Evaluation Completed'
                      : 'Evaluation Pending'}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => handleMemberClick(member.id)}
                  >
                    View History
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={evaluationDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Evaluation History</DialogTitle>
        <DialogContent>
          {memberEvaluations.length === 0 ? (
            <Typography>No evaluations available.</Typography>
          ) : (
            memberEvaluations.map((evaluation) => (
              <Card key={evaluation._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Period: {new Date(evaluation.period.startDate).toLocaleDateString()} -{' '}
                    {new Date(evaluation.period.endDate).toLocaleDateString()}
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(evaluation.scores).map(([category, score]) => (
                      <Grid item xs={12} sm={6} key={category}>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Rating
                              value={score.value / 2}
                              precision={0.5}
                              readOnly
                              size="small"
                            />
                            <Typography variant="body2">
                              {score.value.toFixed(1)}/10
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {score.qualitative}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Overall Score</Typography>
                    <Typography variant="h6" color="primary">
                      {evaluation.overallScore.toFixed(1)}/10
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Comments</Typography>
                    <Typography variant="body2">{evaluation.comments}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;
