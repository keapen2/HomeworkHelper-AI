import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  ThumbUp as ThumbUpIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'

// Mock data
const questions = [
  {
    id: '1',
    question: 'How do I solve quadratic equations?',
    subject: 'Mathematics',
    user: 'john.doe@email.com',
    upvotes: 15,
    createdAt: '2024-01-15T10:30:00Z',
    aiAnswer: 'To solve quadratic equations, you can use several methods...',
    tags: ['algebra', 'equations'],
  },
  {
    id: '2',
    question: 'What is the difference between mitosis and meiosis?',
    subject: 'Biology',
    user: 'jane.smith@email.com',
    upvotes: 23,
    createdAt: '2024-01-15T09:15:00Z',
    aiAnswer: 'Mitosis and meiosis are both cell division processes...',
    tags: ['cell-biology', 'genetics'],
  },
  {
    id: '3',
    question: 'Explain Newton\'s laws of motion',
    subject: 'Physics',
    user: 'mike.wilson@email.com',
    upvotes: 8,
    createdAt: '2024-01-15T08:45:00Z',
    aiAnswer: 'Newton\'s three laws of motion are fundamental principles...',
    tags: ['mechanics', 'laws'],
  },
]

const Questions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)

  const subjects = [
    'All', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'History', 'Literature', 'Geography'
  ]

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, questionId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedQuestion(questionId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedQuestion(null)
  }

  const handleViewQuestion = () => {
    console.log('View question:', selectedQuestion)
    handleMenuClose()
  }

  const handleEditQuestion = () => {
    console.log('Edit question:', selectedQuestion)
    handleMenuClose()
  }

  const handleDeleteQuestion = () => {
    console.log('Delete question:', selectedQuestion)
    handleMenuClose()
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.aiAnswer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === '' || selectedSubject === 'All' || question.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Questions Management
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                SelectProps={{
                  native: true,
                }}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ height: '56px' }}
              >
                Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Grid container spacing={2}>
        {filteredQuestions.map((question) => (
          <Grid item xs={12} key={question.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={question.subject}
                        size="small"
                        color="primary"
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {question.question}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {question.aiAnswer}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {question.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, question.id)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThumbUpIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {question.upvotes}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <VisibilityIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        45 views
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {question.user.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {question.user}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewQuestion}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditQuestion}>
          <FilterIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteQuestion} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Questions
