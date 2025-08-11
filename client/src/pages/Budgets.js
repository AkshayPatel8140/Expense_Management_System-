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
} from '@mui/material';
import { Add, AccountBalance } from '@mui/icons-material';

// Mock data
const mockBudgets = [
  { id: 1, category: 'Food & Dining', budget: 500, spent: 350, remaining: 150, percentage: 70 },
  { id: 2, category: 'Transportation', budget: 200, spent: 180, remaining: 20, percentage: 90 },
  { id: 3, category: 'Entertainment', budget: 150, spent: 75, remaining: 75, percentage: 50 },
  { id: 4, category: 'Shopping', budget: 300, spent: 250, remaining: 50, percentage: 83 },
  { id: 5, category: 'Utilities', budget: 100, spent: 95, remaining: 5, percentage: 95 },
];

const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Other'
];

const Budgets = () => {
  const [budgets, setBudgets] = useState(mockBudgets);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    budget: '',
  });

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ category: '', budget: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBudget = {
      id: Date.now(),
      category: formData.category,
      budget: parseFloat(formData.budget),
      spent: 0,
      remaining: parseFloat(formData.budget),
      percentage: 0,
    };
    setBudgets([...budgets, newBudget]);
    handleCloseDialog();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Budgets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Set and track your spending limits
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                ${totalBudget.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                ${totalSpent.toLocaleString()}
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
              <Typography 
                variant="h4" 
                color={totalRemaining >= 0 ? 'success.main' : 'error.main'} 
                fontWeight="bold"
              >
                ${totalRemaining.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget Cards */}
      <Grid container spacing={3}>
        {budgets.map((budget) => (
          <Grid item xs={12} sm={6} md={4} key={budget.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {budget.category}
                  </Typography>
                  <Chip 
                    label={`${budget.percentage}%`}
                    color={getProgressColor(budget.percentage)}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={budget.percentage}
                    color={getProgressColor(budget.percentage)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Budget
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${budget.budget.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Spent
                  </Typography>
                  <Typography variant="body2" color="error.main" fontWeight="bold">
                    ${budget.spent.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Remaining
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={budget.remaining >= 0 ? 'success.main' : 'error.main'} 
                    fontWeight="bold"
                  >
                    ${budget.remaining.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Budget Button */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
          size="large"
        >
          Add New Budget
        </Button>
      </Box>

      {/* Add Budget Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Budget</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Budget Amount"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <AccountBalance sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add Budget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Budgets; 