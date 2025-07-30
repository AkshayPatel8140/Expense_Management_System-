import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Mock data
const monthlyData = [
  { month: 'Jan', income: 4000, expenses: 2400, savings: 1600 },
  { month: 'Feb', income: 3000, expenses: 1398, savings: 1602 },
  { month: 'Mar', income: 2000, expenses: 9800, savings: -7800 },
  { month: 'Apr', income: 2780, expenses: 3908, savings: -1128 },
  { month: 'May', income: 1890, expenses: 4800, savings: -2910 },
  { month: 'Jun', income: 2390, expenses: 3800, savings: -1410 },
  { month: 'Jul', income: 3490, expenses: 4300, savings: -810 },
  { month: 'Aug', income: 4000, expenses: 2400, savings: 1600 },
  { month: 'Sep', income: 3500, expenses: 2800, savings: 700 },
  { month: 'Oct', income: 4200, expenses: 3200, savings: 1000 },
  { month: 'Nov', income: 3800, expenses: 2900, savings: 900 },
  { month: 'Dec', income: 4500, expenses: 3500, savings: 1000 },
];

const categoryData = [
  { name: 'Food & Dining', value: 35, color: '#8884d8' },
  { name: 'Transportation', value: 25, color: '#82ca9d' },
  { name: 'Shopping', value: 20, color: '#ffc658' },
  { name: 'Entertainment', value: 15, color: '#ff7300' },
  { name: 'Utilities', value: 5, color: '#00ff00' },
];

const spendingTrends = [
  { day: 'Mon', amount: 120 },
  { day: 'Tue', amount: 85 },
  { day: 'Wed', amount: 200 },
  { day: 'Thu', amount: 150 },
  { day: 'Fri', amount: 300 },
  { day: 'Sat', amount: 250 },
  { day: 'Sun', amount: 180 },
];

const Analytics = () => {
  const totalIncome = monthlyData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = monthlyData.reduce((sum, item) => sum + item.expenses, 0);
  const totalSavings = monthlyData.reduce((sum, item) => sum + item.savings, 0);
  const averageMonthlyIncome = totalIncome / monthlyData.length;
  const averageMonthlyExpenses = totalExpenses / monthlyData.length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Detailed insights into your financial patterns
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Income
              </Typography>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                ${totalIncome.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg: ${averageMonthlyIncome.toFixed(0)}/month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                ${totalExpenses.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg: ${averageMonthlyExpenses.toFixed(0)}/month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Net Savings
              </Typography>
              <Typography 
                variant="h4" 
                color={totalSavings >= 0 ? 'success.main' : 'error.main'} 
                fontWeight="bold"
              >
                ${totalSavings.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {((totalSavings / totalIncome) * 100).toFixed(1)}% of income
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Savings Rate
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {((totalSavings / totalIncome) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Target: 20%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Monthly Overview */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Overview
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#4caf50" fill="#4caf50" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="expenses" stackId="1" stroke="#f44336" fill="#f44336" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Categories */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
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

        {/* Weekly Spending Trends */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Spending Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spendingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Savings Trend */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Savings Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#1976d2" 
                    strokeWidth={2}
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      +12%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Income Growth
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="error.main" fontWeight="bold">
                      -8%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expense Reduction
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      85%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Budget Adherence
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      3
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Goals
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 