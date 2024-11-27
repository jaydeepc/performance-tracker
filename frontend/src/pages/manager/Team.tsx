import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { team, evaluations } from '../../services/api';
import { RootState } from '../../store';
import { User, Evaluation, EvaluationScore } from '../../types';

interface EvaluationFormData {
  userId: string;
  evaluatorId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  scores: {
    discoveryScore: EvaluationScore;
    specificationScore: EvaluationScore;
    roadmapScore: EvaluationScore;
    deliveryScore: EvaluationScore;
    analyticsScore: EvaluationScore;
    communicationScore: EvaluationScore;
  };
  overallScore: number;
  comments: string;
}

const initialEvaluationData: EvaluationFormData = {
  userId: '',
  evaluatorId: '',
  period: {
    startDate: '',
    endDate: '',
  },
  scores: {
    discoveryScore: { value: 0, qualitative: '' },
    specificationScore: { value: 0, qualitative: '' },
    roadmapScore: { value: 0, qualitative: '' },
    deliveryScore: { value: 0, qualitative: '' },
    analyticsScore: { value: 0, qualitative: '' },
    communicationScore: { value: 0, qualitative: '' },
  },
  overallScore: 0,
  comments: '',
};

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [memberEvaluations, setMemberEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationFormData>(initialEvaluationData);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user?.id) return;

      try {
        const response = await team.getReportees(user.id);
        setTeamMembers(response.data);
      } catch (error) {
        setError('Failed to fetch team members');
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [user?.id]);

  const fetchMemberEvaluations = async (memberId: string) => {
    try {
      const response = await evaluations.getByUserId(memberId);
      setMemberEvaluations(response.data);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  };

  const handleMemberSelect = async (member: User) => {
    setSelectedMember(member);
    await fetchMemberEvaluations(member.id);
  };

  const handleOpenEvaluation = () => {
    if (!selectedMember || !user) return;

    setEvaluationData({
      ...initialEvaluationData,
      userId: selectedMember.id,
      evaluatorId: user.id,
      period: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEvaluationData(initialEvaluationData);
  };

  const calculateOverallScore = (scores: typeof evaluationData.scores) => {
    const values = Object.values(scores).map((score) => score.value);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const handleScoreChange = (
    category: keyof typeof evaluationData.scores,
    field: keyof EvaluationScore,
    value: string | number
  ) => {
    setEvaluationData((prev) => {
      const newScores = {
        ...prev.scores,
        [category]: {
          ...prev.scores[category],
          [field]: value,
        },
      };

      return {
        ...prev,
        scores: newScores,
        overallScore: calculateOverallScore(newScores),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedMember) return;

    try {
      await evaluations.create(evaluationData);
      await fetchMemberEvaluations(selectedMember.id);
      handleCloseDialog();
    } catch (error) {
      setError('Failed to save evaluation');
      console.error('Error saving evaluation:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Team Management
      </Typography>

      <Grid container spacing={3}>
        {/* Team Members List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Team Members
            </Typography>
            <Grid container spacing={2}>
              {teamMembers.map((member) => (
                <Grid item xs={12} key={member.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      bgcolor:
                        selectedMember?.id === member.id
                          ? 'primary.light'
                          : 'background.paper',
                    }}
                    onClick={() => handleMemberSelect(member)}
                  >
                    <CardContent>
                      <Typography variant="h6">{member.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.department || 'No department'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Member Details and Evaluations */}
        <Grid item xs={12} md={8}>
          {selectedMember ? (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h5">{selectedMember.name}</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedMember.email}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleOpenEvaluation}
                >
                  New Evaluation
                </Button>
              </Box>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Evaluation History
              </Typography>
              {memberEvaluations.length === 0 ? (
                <Typography color="text.secondary">
                  No evaluations found
                </Typography>
              ) : (
                memberEvaluations.map((evaluation) => (
                  <Card key={evaluation.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Period: {new Date(evaluation.period.startDate).toLocaleDateString()} -{' '}
                        {new Date(evaluation.period.endDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Overall Score: {evaluation.overallScore.toFixed(1)}
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(evaluation.scores).map(([category, score]) => (
                          <Grid item xs={12} sm={6} key={category}>
                            <Typography variant="subtitle2">
                              {category.replace('Score', '')}
                            </Typography>
                            <Rating
                              value={score.value / 2}
                              precision={0.5}
                              readOnly
                            />
                            <Typography variant="body2" color="text.secondary">
                              {score.qualitative}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        {evaluation.comments}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Select a team member to view details
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Evaluation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>New Evaluation</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={evaluationData.period.startDate}
                  onChange={(e) =>
                    setEvaluationData({
                      ...evaluationData,
                      period: { ...evaluationData.period, startDate: e.target.value },
                    })
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  type="date"
                  value={evaluationData.period.endDate}
                  onChange={(e) =>
                    setEvaluationData({
                      ...evaluationData,
                      period: { ...evaluationData.period, endDate: e.target.value },
                    })
                  }
                  fullWidth
                  required
                />
              </Grid>

              {Object.entries(evaluationData.scores).map(([category, score]) => (
                <Grid item xs={12} key={category}>
                  <Typography variant="subtitle1">
                    {category.replace('Score', '')}
                  </Typography>
                  <Rating
                    value={score.value / 2}
                    precision={0.5}
                    onChange={(_, newValue) =>
                      handleScoreChange(
                        category as keyof typeof evaluationData.scores,
                        'value',
                        (newValue || 0) * 2
                      )
                    }
                  />
                  <TextField
                    label="Comments"
                    multiline
                    rows={2}
                    value={score.qualitative}
                    onChange={(e) =>
                      handleScoreChange(
                        category as keyof typeof evaluationData.scores,
                        'qualitative',
                        e.target.value
                      )
                    }
                    fullWidth
                    margin="normal"
                  />
                  <Divider sx={{ my: 2 }} />
                </Grid>
              ))}

              <Grid item xs={12}>
                <TextField
                  label="Overall Comments"
                  multiline
                  rows={4}
                  value={evaluationData.comments}
                  onChange={(e) =>
                    setEvaluationData({
                      ...evaluationData,
                      comments: e.target.value,
                    })
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Submit Evaluation
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Team;
