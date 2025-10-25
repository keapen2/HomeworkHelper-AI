import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Mock data
const dailyActivity = [
  { date: '2024-01-01', questions: 45, users: 120, answers: 42 },
  { date: '2024-01-02', questions: 52, users: 135, answers: 48 },
  { date: '2024-01-03', questions: 48, users: 128, answers: 45 },
  { date: '2024-01-04', questions: 61, users: 142, answers: 58 },
  { date: '2024-01-05', questions: 55, users: 138, answers: 52 },
  { date: '2024-01-06', questions: 67, users: 156, answers: 63 },
  { date: '2024-01-07', questions: 72, users: 165, answers: 68 },
]

const subjectDistribution = [
  { subject: 'Mathematics', questions: 245, percentage: 35 },
  { subject: 'Physics', questions: 140, percentage: 20 },
  { subject: 'Chemistry', questions: 105, percentage: 15 },
  { subject: 'Biology', questions: 84, percentage: 12 },
  { subject: 'Computer Science', questions: 70, percentage: 10 },
  { subject: 'Other', questions: 56, percentage: 8 },
]

const userEngagement = [
  { time: '00:00', users: 5 },
  { time: '04:00', users: 2 },
  { time: '08:00', users: 45 },
  { time: '12:00', users: 78 },
  { time: '16:00', users: 92 },
  { time: '20:00', users: 65 },
  { time: '24:00', users: 8 },
]

const topStruggles = [
  { topic: 'Quadratic Equations', frequency: 45, difficulty: 'Medium' },
  { topic: 'Organic Chemistry', frequency: 38, difficulty: 'Hard' },
  { topic: 'Calculus Derivatives', frequency: 32, difficulty: 'Hard' },
  { topic: 'Cell Division', frequency: 28, difficulty: 'Medium' },
  { topic: 'Newton\'s Laws', frequency: 25, difficulty: 'Easy' },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const Analytics: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select value="7d" label="Time Range">
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Daily Activity Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Activity Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="questions"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Questions"
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Active Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="answers"
                      stroke="#ffc658"
                      strokeWidth={2}
                      name="AI Answers"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Subject Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Questions by Subject
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ subject, percentage }) => `${subject} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="questions"
                    >
                      {subjectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* User Engagement Heatmap */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Engagement by Time
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userEngagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Struggles */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Student Struggles
              </Typography>
              <Box>
                {topStruggles.map((struggle, index) => (
                  <Box
                    key={struggle.topic}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < topStruggles.length - 1 ? '1px solid #e0e0e0' : 'none',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        {struggle.topic}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {struggle.frequency} questions
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color={
                        struggle.difficulty === 'Easy'
                          ? 'success.main'
                          : struggle.difficulty === 'Medium'
                          ? 'warning.main'
                          : 'error.main'
                      }
                    >
                      {struggle.difficulty}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Performance Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      1.2s
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average AI Response Time
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      98.5%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System Uptime
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      4.2/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      User Satisfaction
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      85%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Answer Accuracy
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Analytics
