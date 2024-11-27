import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Rating,
  Chip,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { evaluations } from '../../services/api';
import { RootState } from '../../store';
import { Evaluation } from '../../types';

const Evaluations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<Evaluation[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!user?.id) return;

      try {
        const response = await evaluations.getByUserId(user.id);
        setEvaluationHistory(response.data);
      } catch (error) {
        setError('Failed to fetch evaluations');
        console.error('Error fetching evaluations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [user?.id]);

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

  if (evaluationHistory.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          My Evaluations
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography>No evaluations available yet.</Typography>
        </Paper>
      </Box>
    );
  }

  const getScoreTrend = (current: number, previous: number) => {
    if (!previous) return null;
    const difference = current - previous;
    return {
      value: Math.abs(difference).toFixed(1),
      direction: difference >= 0 ? 'up' : 'down',
    };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Evaluations
      </Typography>

      <Grid container spacing={3}>
        {evaluationHistory.map((evaluation) => (
          <Grid item xs={12} key={evaluation._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    Period: {new Date(evaluation.period.startDate).toLocaleDateString()} -{' '}
                    {new Date(evaluation.period.endDate).toLocaleDateString()}
                  </Typography>
                  <Chip
                    label={`Overall: ${evaluation.overallScore.toFixed(1)}/10`}
                    color={evaluation.overallScore >= 7 ? 'success' : 'default'}
                  />
                </Box>

                <Grid container spacing={3}>
                  {Object.entries(evaluation.scores).map(([category, score]) => (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle1">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Typography>
                          <Typography variant="subtitle1">
                            {score.value.toFixed(1)}/10
                          </Typography>
                        </Box>
                        <Rating
                          value={score.value / 2}
                          precision={0.5}
                          readOnly
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {score.qualitative}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Comments
                  </Typography>
                  <Typography variant="body1">{evaluation.comments}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Evaluations;
