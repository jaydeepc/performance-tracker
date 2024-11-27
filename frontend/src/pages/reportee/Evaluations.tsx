import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Rating,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { evaluations } from '../../services/api';
import { RootState } from '../../store';
import { Evaluation } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`evaluation-tabpanel-${index}`}
      aria-labelledby={`evaluation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Evaluations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<Evaluation[]>([]);
  const [tabValue, setTabValue] = useState(0);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const calculateProgress = (evaluations: Evaluation[]) => {
    if (evaluations.length < 2) return [];

    return evaluations.slice(0, -1).map((evaluation, index) => {
      const previousScore = evaluations[index + 1].overallScore;
      const currentScore = evaluation.overallScore;
      const difference = currentScore - previousScore;
      return {
        date: evaluation.period.endDate,
        score: currentScore,
        difference,
        improvement: difference >= 0,
      };
    });
  };

  const getScoreTrend = (current: Evaluation, previous: Evaluation) => {
    const categories = Object.keys(current.scores);
    return categories.map((category) => ({
      category: category.replace('Score', ''),
      current: current.scores[category as keyof typeof current.scores].value,
      previous: previous.scores[category as keyof typeof previous.scores].value,
      difference:
        current.scores[category as keyof typeof current.scores].value -
        previous.scores[category as keyof typeof previous.scores].value,
    }));
  };

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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const progressData = calculateProgress(evaluationHistory);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Evaluations
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Overview" />
          <Tab label="Progress Timeline" />
          <Tab label="Detailed History" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Latest Evaluation Summary */}
            {evaluationHistory[0] && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Latest Evaluation
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {new Date(evaluationHistory[0].period.endDate).toLocaleDateString()}
                    </Typography>
                    <Grid container spacing={3}>
                      {Object.entries(evaluationHistory[0].scores).map(([category, score]) => (
                        <Grid item xs={12} sm={6} md={4} key={category}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1">
                              {category.replace('Score', '')}
                            </Typography>
                            <Rating value={score.value / 2} precision={0.5} readOnly />
                            <Typography variant="body2" color="text.secondary">
                              {score.qualitative}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Timeline position="alternate">
            {progressData.map((progress, index) => (
              <TimelineItem key={progress.date}>
                <TimelineSeparator>
                  <TimelineDot
                    color={progress.improvement ? 'success' : 'error'}
                  />
                  {index < progressData.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {new Date(progress.date).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="h6" sx={{ mr: 1 }}>
                          {progress.score.toFixed(1)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {progress.improvement ? (
                            <TrendingUpIcon color="success" />
                          ) : (
                            <TrendingDownIcon color="error" />
                          )}
                          <Typography
                            variant="body2"
                            color={progress.improvement ? 'success.main' : 'error.main'}
                          >
                            {Math.abs(progress.difference).toFixed(1)} points
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {evaluationHistory.map((evaluation, index) => (
              <Grid item xs={12} key={evaluation.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        Evaluation {evaluationHistory.length - index}
                      </Typography>
                      <Chip
                        label={`Overall: ${evaluation.overallScore.toFixed(1)}/10`}
                        color={evaluation.overallScore >= 7 ? 'success' : 'default'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Period: {new Date(evaluation.period.startDate).toLocaleDateString()} -{' '}
                      {new Date(evaluation.period.endDate).toLocaleDateString()}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={3}>
                      {Object.entries(evaluation.scores).map(([category, score]) => (
                        <Grid item xs={12} sm={6} key={category}>
                          <Box sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 1,
                              }}
                            >
                              <Typography variant="subtitle1">
                                {category.replace('Score', '')}
                              </Typography>
                              <Typography variant="subtitle1">
                                {score.value.toFixed(1)}/10
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(score.value / 10) * 100}
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {score.qualitative}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Overall Comments
                    </Typography>
                    <Typography variant="body1">{evaluation.comments}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Evaluations;
