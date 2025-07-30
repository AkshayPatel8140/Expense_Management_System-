import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  Add,
  Receipt,
  Flag,
  Notifications,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data
const monthlyData = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 9800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 1890, expenses: 4800 },
  { name: 'Jun', income: 2390, expenses: 3800 },
];

const categoryData = [
  { name: 'Food & Dining', value: 35, color: '#8884d8' },
  { name: 'Transportation', value: 25, color: '#82ca9d' },
  { name: 'Shopping', value: 20, color: '#ffc658' },
  { name: 'Entertainment', value: 15, color: '#ff7300' },
  { name: 'Utilities', value: 5, color: '#00ff00' },
];

const recentTransactions = [
  { id: 1, description: 'Grocery Store', amount: -85.50, category: 'Food & Dining', date: '2024-01-15' },
  { id: 2, description: 'Salary Deposit', amount: 2500.00, category: 'Income', date: '2024-01-14' },
  { id: 3, description: 'Gas Station', amount: -45.00, category: 'Transportation', date: '2024-01-13' },
  { id: 4, description: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', date: '2024-01-12' },
  { id: 5, description: 'Coffee Shop', amount: -4.50, category: 'Food & Dining', date: '2024-01-11' },
];

const Dashboard = () => {
  const totalIncome = 2500;
  const totalExpenses = 1850;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = ((netSavings / totalIncome) * 100).toFixed(1);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's your financial overview for this month.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Income
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                ${totalIncome.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.light', mr: 2 }}>
                  <TrendingDown />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Expenses
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                ${totalExpenses.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                  <Savings />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Savings
                </Typography>
              </Box>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                ${netSavings.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {savingsRate}% of income
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                  <AccountBalance />
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  Budget Status
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                85%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On track
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Details */}
      <Grid container spacing={3}>
        {/* Monthly Overview Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#4caf50" name="Income" />
                  <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Categories */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Categories
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Transactions
                </Typography>
                <Button startIcon={<Add />} size="small">
                  Add Transaction
                </Button>
              </Box>
              <List>
                {recentTransactions.map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: transaction.amount > 0 ? 'success.light' : 'error.light' }}>
                          <Receipt />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={transaction.description}
                        secondary={transaction.category}
                        sx={{ flex: 1 }}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant="body2"
                          color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.date}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Add />}
                    sx={{ py: 2 }}
                  >
                    Add Transaction
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AccountBalance />}
                    sx={{ py: 2 }}
                  >
                    Set Budget
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Flag />}
                    sx={{ py: 2 }}
                  >
                    Create Goal
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Notifications />}
                    sx={{ py: 2 }}
                  >
                    View Reports
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 