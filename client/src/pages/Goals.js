import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from '@mui/material';
import { Add, Flag, TrendingUp } from '@mui/icons-material';

// Mock data
const mockGoals = [
  { 
    id: 1, 
    title: 'Emergency Fund', 
    target: 10000, 
    current: 6500, 
    remaining: 3500, 
    percentage: 65,
    deadline: '2024-12-31',
    category: 'Savings'
  },
  { 
    id: 2, 
    title: 'Vacation Fund', 
    target: 5000, 
    current: 3200, 
    remaining: 1800, 
    percentage: 64,
    deadline: '2024-06-30',
    category: 'Travel'
  },
  { 
    id: 3, 
    title: 'New Car', 
    target: 25000, 
    current: 8000, 
    remaining: 17000, 
    percentage: 32,
    deadline: '2025-03-31',
    category: 'Vehicle'
  },
];

const categories = [
  'Savings',
  'Travel',
  'Vehicle',
  'Home',
  'Education',
  'Investment',
  'Other'
];

const Goals = () => {
  const [goals, setGoals] = useState(mockGoals);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    target: '',
    category: '',
    deadline: '',
  });

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ title: '', target: '', category: '', deadline: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newGoal = {
      id: Date.now(),
      title: formData.title,
      target: parseFloat(formData.target),
      current: 0,
      remaining: parseFloat(formData.target),
      percentage: 0,
      deadline: formData.deadline,
      category: formData.category,
    };
    setGoals([...goals, newGoal]);
    handleCloseDialog();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'primary';
  };

  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalRemaining = totalTarget - totalCurrent;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Financial Goals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Set and track your financial objectives
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Target
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                ${totalTarget.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Saved
              </Typography>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                ${totalCurrent.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Remaining
              </Typography>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                ${totalRemaining.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Goal Cards */}
      <Grid container spacing={3}>
        {goals.map((goal) => (
          <Grid item xs={12} sm={6} md={4} key={goal.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    <Flag />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      {goal.title}
                    </Typography>
                    <Chip label={goal.category} size="small" />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={goal.percentage}
                    color={getProgressColor(goal.percentage)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Target
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${goal.target.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Saved
                  </Typography>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    ${goal.current.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Remaining
                  </Typography>
                  <Typography variant="body2" color="warning.main" fontWeight="bold">
                    ${goal.remaining.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Chip 
                    label={`${goal.percentage}%`}
                    color={getProgressColor(goal.percentage)}
                    size="small"
                  />
                </Box>

                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    Deadline: {goal.deadline}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Goal Button */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
          size="large"
        >
          Add New Goal
        </Button>
      </Box>

      {/* Add Goal Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Financial Goal</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Goal Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleChange}
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Amount"
                  name="target"
                  type="number"
                  value={formData.target}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <TrendingUp sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Goals; 