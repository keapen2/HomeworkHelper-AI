import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  QuestionAnswer as QuestionIcon,
  People as PeopleIcon,
  School as SchoolIcon,
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Mock data - in real app, this would come from API
const overviewData = {
  totalUsers: 1250,
  totalQuestions: 3420,
  activeUsers: 890,
  averageQuestionsPerUser: 2.7,
}

const trendsData = [
  { date: '2024-01-01', questions: 45, users: 120 },
  { date: '2024-01-02', questions: 52, users: 135 },
  { date: '2024-01-03', questions: 48, users: 128 },
  { date: '2024-01-04', questions: 61, users: 142 },
  { date: '2024-01-05', questions: 55, users: 138 },
  { date: '2024-01-06', questions: 67, users: 156 },
  { date: '2024-01-07', questions: 72, users: 165 },
]

const subjectData = [
  { name: 'Mathematics', value: 35, color: '#8884d8' },
  { name: 'Physics', value: 20, color: '#82ca9d' },
  { name: 'Chemistry', value: 15, color: '#ffc658' },
  { name: 'Biology', value: 12, color: '#ff7300' },
  { name: 'Computer Science', value: 10, color: '#00ff00' },
  { name: 'Other', value: 8, color: '#ff00ff' },
]

const StatCard: React.FC<{
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  trend?: string
}> = ({ title, value, icon, color, trend }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: color,
            color: 'white',
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
        {value}
      </Typography>
      {trend && (
        <Typography variant="body2" color="text.secondary">
          {trend}
        </Typography>
      )}
    </CardContent>
  </Card>
)

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={overviewData.totalUsers.toLocaleString()}
            icon={<PeopleIcon />}
            color="#1976d2"
            trend="+12% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Questions"
            value={overviewData.totalQuestions.toLocaleString()}
            icon={<QuestionIcon />}
            color="#388e3c"
            trend="+8% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={overviewData.activeUsers.toLocaleString()}
            icon={<TrendingUpIcon />}
            color="#f57c00"
            trend="+15% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Questions/User"
            value={overviewData.averageQuestionsPerUser}
            icon={<SchoolIcon />}
            color="#7b1fa2"
            trend="+0.3 from last month"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Trends (Last 7 Days)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendsData}>
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
                      name="Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Questions by Subject
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  System Performance
                </Typography>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress variant="determinate" value={85} />
                </Box>
                <Typography variant="body2">85%</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  AI Response Time
                </Typography>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress variant="determinate" value={92} />
                </Box>
                <Typography variant="body2">1.2s avg</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  User Satisfaction
                </Typography>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress variant="determinate" value={78} />
                </Box>
                <Typography variant="body2">4.2/5</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
