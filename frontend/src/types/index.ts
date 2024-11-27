export interface User {
  id: string;
  username: string;
  role: 'admin' | 'manager' | 'reportee';
  name: string;
  email: string;
  managerId?: string;
  department?: string;
}

export interface EvaluationScore {
  value: number;
  qualitative: string;
}

export interface Evaluation {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface TeamAnalytics {
  averageScores: {
    discovery: number;
    specification: number;
    roadmap: number;
    delivery: number;
    analytics: number;
    communication: number;
    overall: number;
  };
  trendData: Array<{
    period: string;
    averageScore: number;
  }>;
  distributionData: {
    ranges: Array<{
      range: string;
      count: number;
    }>;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
