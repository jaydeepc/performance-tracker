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
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { evaluations } from '../../services/api';
import { RootState } from '../../store';
import { Evaluation } from '../../types';

const Dashboard = () => {
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
          My Performance Dashboard
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography>No evaluations available yet.</Typography>
        </Paper>
      </Box>
    );
  }

  const latestEvaluation = evaluationHistory[0];
  const previousEvaluation = evaluationHistory[1];

  const getScoreTrend = (current: number, previous: number) => {
    if (!previous) return null;
    const difference = current - previous;
    return {
      value: Math.abs(difference).toFixed(1),
      direction: difference >= 0 ? 'up' : 'down',
    };
  };

  const getStrengthsAndWeaknesses = (evaluation: Evaluation) => {
    if (!evaluation?.scores) return { strengths: [], weaknesses: [] };

    const scores = Object.entries(evaluation.scores).map(([category, score]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      value: score.value,
    }));

    const sortedScores = [...scores].sort((a, b) => b.value - a.value);
    return {
      strengths: sortedScores.slice(0, 2),
      weaknesses: sortedScores.slice(-2),
    };
  };

  const { strengths, weaknesses } = getStrengthsAndWeaknesses(latestEvaluation);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Performance Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Overall Score Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Performance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 1 }}>
                <Typography variant="h3" component="div">
                  {latestEvaluation?.overallScore?.toFixed(1) || 'N/A'}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5, ml: 1 }}>
                  /10
                </Typography>
              </Box>
              {latestEvaluation?.overallScore && previousEvaluation?.overallScore && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getScoreTrend(
                    latestEvaluation.overallScore,
                    previousEvaluation.overallScore
                  )?.direction === 'up' ? (
                    <TrendingUpIcon color="success" />
                  ) : (
                    <TrendingDownIcon color="error" />
                  )}
                  <Typography
                    variant="body2"
                    color={
                      getScoreTrend(
                        latestEvaluation.overallScore,
                        previousEvaluation.overallScore
                      )?.direction === 'up'
                        ? 'success.main'
                        : 'error.main'
                    }
                    sx={{ ml: 0.5 }}
                  >
                    {getScoreTrend(
                      latestEvaluation.overallScore,
                      previousEvaluation.overallScore
                    )?.value}{' '}
                    points since last evaluation
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Strengths Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Strengths
              </Typography>
              {strengths.map((strength) => (
                <Box key={strength.category} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">{strength.category}</Typography>
                    <Typography variant="body1" color="success.main">
                      {strength.value.toFixed(1)}/10
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(strength.value / 10) * 100}
                    color="success"
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Areas for Improvement Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Areas for Improvement
              </Typography>
              {weaknesses.map((weakness) => (
                <Box key={weakness.category} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">{weakness.category}</Typography>
                    <Typography variant="body1" color="error.main">
                      {weakness.value.toFixed(1)}/10
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(weakness.value / 10) * 100}
                    color="error"
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Latest Evaluation Details */}
        {latestEvaluation && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Latest Evaluation Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Period: {new Date(latestEvaluation.period.startDate).toLocaleDateString()} -{' '}
                {new Date(latestEvaluation.period.endDate).toLocaleDateString()}
              </Typography>
              <Grid container spacing={3}>
                {Object.entries(latestEvaluation.scores).map(([category, score]) => (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Typography>
                        <Typography variant="subtitle1">{score.value.toFixed(1)}/10</Typography>
                      </Box>
                      <Rating
                        value={score.value / 2}
                        precision={0.5}
                        readOnly
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {score.qualitative}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Overall Comments
                </Typography>
                <Typography variant="body1">{latestEvaluation.comments}</Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Performance History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evaluation History
            </Typography>
            <Grid container spacing={2}>
              {evaluationHistory.map((evaluation) => (
                <Grid item xs={12} key={evaluation._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1">
                          {new Date(evaluation.period.endDate).toLocaleDateString()}
                        </Typography>
                        <Chip
                          icon={<StarIcon />}
                          label={`${evaluation.overallScore.toFixed(1)}/10`}
                          color={evaluation.overallScore >= 7 ? 'success' : 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {evaluation.comments}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
