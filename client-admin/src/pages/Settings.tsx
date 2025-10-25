import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Divider,
  Alert,
} from '@mui/material'
import { Save as SaveIcon } from '@mui/icons-material'

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    // AI Settings
    openaiApiKey: '',
    aiModel: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
    
    // System Settings
    maxQuestionsPerUser: 50,
    rateLimitPerHour: 10,
    enableNotifications: true,
    enableEmailAlerts: true,
    
    // Security Settings
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: 24,
    
    // Analytics Settings
    enableAnalytics: true,
    dataRetentionDays: 365,
    enableUserTracking: true,
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    // TODO: Implement actual save functionality
    console.log('Saving settings:', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        System Settings
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* AI Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Configuration
              </Typography>
              <TextField
                fullWidth
                label="OpenAI API Key"
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => handleChange('openaiApiKey', e.target.value)}
                margin="normal"
                helperText="Your OpenAI API key for AI responses"
              />
              <TextField
                fullWidth
                label="AI Model"
                value={settings.aiModel}
                onChange={(e) => handleChange('aiModel', e.target.value)}
                margin="normal"
                select
                SelectProps={{ native: true }}
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </TextField>
              <TextField
                fullWidth
                label="Max Tokens"
                type="number"
                value={settings.maxTokens}
                onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                margin="normal"
                helperText="Maximum tokens for AI responses"
              />
              <TextField
                fullWidth
                label="Temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={settings.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                margin="normal"
                helperText="Controls randomness in AI responses (0-2)"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* System Limits */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Limits
              </Typography>
              <TextField
                fullWidth
                label="Max Questions Per User"
                type="number"
                value={settings.maxQuestionsPerUser}
                onChange={(e) => handleChange('maxQuestionsPerUser', parseInt(e.target.value))}
                margin="normal"
                helperText="Maximum questions a user can ask per day"
              />
              <TextField
                fullWidth
                label="Rate Limit (per hour)"
                type="number"
                value={settings.rateLimitPerHour}
                onChange={(e) => handleChange('rateLimitPerHour', parseInt(e.target.value))}
                margin="normal"
                helperText="Maximum API requests per hour per user"
              />
              <TextField
                fullWidth
                label="Session Timeout (hours)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                margin="normal"
                helperText="How long user sessions remain active"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableNotifications}
                    onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                  />
                }
                label="Enable System Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableEmailAlerts}
                    onChange={(e) => handleChange('enableEmailAlerts', e.target.checked)}
                  />
                }
                label="Enable Email Alerts"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.requireEmailVerification}
                    onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                  />
                }
                label="Require Email Verification"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableTwoFactor}
                    onChange={(e) => handleChange('enableTwoFactor', e.target.checked)}
                  />
                }
                label="Enable Two-Factor Authentication"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analytics & Privacy
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableAnalytics}
                        onChange={(e) => handleChange('enableAnalytics', e.target.checked)}
                      />
                    }
                    label="Enable Analytics"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Data Retention (days)"
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => handleChange('dataRetentionDays', parseInt(e.target.value))}
                    helperText="How long to keep user data"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableUserTracking}
                        onChange={(e) => handleChange('enableUserTracking', e.target.checked)}
                      />
                    }
                    label="Enable User Tracking"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined">
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Settings
