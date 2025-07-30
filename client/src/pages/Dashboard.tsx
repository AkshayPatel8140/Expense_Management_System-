import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  CreditCard,
  Savings,
  Target,
  Receipt,
  Analytics,
  Add,
  MoreVert,
  AttachMoney,
  Assessment,
  Warning,
  CheckCircle,
  Schedule,
  AccountBalanceWallet,
  ShowChart,
  PieChart,
  FilterList,
} from '@mui/icons-material';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

// Custom components
import QuickActionCard from '../components/dashboard/QuickActionCard';
import MetricCard from '../components/dashboard/MetricCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import BudgetOverview from '../components/dashboard/BudgetOverview';
import GoalProgress from '../components/dashboard/GoalProgress';
import SpendingTrends from '../components/dashboard/SpendingTrends';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import BillReminders from '../components/dashboard/BillReminders';
import FinancialInsights from '../components/dashboard/FinancialInsights';

// Hooks and API
import { useGetProfileQuery } from '../store/api/authApi';
import { useGetDashboardDataQuery } from '../store/api/analyticsApi';
import { formatCurrency } from '../utils/formatters';

// Types
interface DashboardData {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetUtilization: number;
  savingsRate: number;
  emergencyFundProgress: number;
  activeGoals: number;
  completedGoals: number;
  upcomingBills: number;
  cashFlow: Array<{
    date: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  categorySpending: Array<{
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  recentTransactions: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    type: 'income' | 'expense';
  }>;
  budgetAlerts: Array<{
    category: string;
    spent: number;
    budget: number;
    percentage: number;
    severity: 'warning' | 'error';
  }>;
  goalProgress: Array<{
    id: string;
    title: string;
    current: number;
    target: number;
    percentage: number;
    dueDate: string;
    type: string;
  }>;
  upcomingBillsList: Array<{
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    isPaid: boolean;
  }>;
  insights: Array<{
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    action?: string;
  }>;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // API calls
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useGetDashboardDataQuery({ timeRange });

  const isLoading = profileLoading || dashboardLoading;

  // Quick actions data
  const quickActions = [
    {
      title: 'Add Transaction',
      description: 'Record income or expense',
      icon: <Receipt />,
      color: theme.palette.primary.main,
      path: '/transactions/new',
    },
    {
      title: 'Create Budget',
      description: 'Set monthly spending limits',
      icon: <AccountBalance />,
      color: theme.palette.secondary.main,
      path: '/budgets/new',
    },
    {
      title: 'Set Goal',
      description: 'Define financial targets',
      icon: <Target />,
      color: theme.palette.success.main,
      path: '/goals/new',
    },
    {
      title: 'View Analytics',
      description: 'Detailed financial insights',
      icon: <Analytics />,
      color: theme.palette.info.main,
      path: '/analytics',
    },
  ];

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!dashboardData) return null;

    const {
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      budgetUtilization,
      emergencyFundProgress,
    } = dashboardData;

    return [
      {
        title: 'Net Worth',
        value: formatCurrency(netWorth, profile?.currency),
        change: '+12.5%',
        trend: 'up' as const,
        icon: <AccountBalanceWallet />,
        color: theme.palette.success.main,
      },
      {
        title: 'Monthly Income',
        value: formatCurrency(monthlyIncome, profile?.currency),
        change: '+2.3%',
        trend: 'up' as const,
        icon: <TrendingUp />,
        color: theme.palette.primary.main,
      },
      {
        title: 'Monthly Expenses',
        value: formatCurrency(monthlyExpenses, profile?.currency),
        change: '-5.1%',
        trend: 'down' as const,
        icon: <TrendingDown />,
        color: theme.palette.error.main,
      },
      {
        title: 'Savings Rate',
        value: `${savingsRate.toFixed(1)}%`,
        change: '+1.2%',
        trend: 'up' as const,
        icon: <Savings />,
        color: theme.palette.success.main,
      },
    ];
  }, [dashboardData, profile?.currency, theme]);

  // Handle time range change
  const handleTimeRangeChange = (newRange: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(newRange);
    setAnchorEl(null);
  };

  // Handle menu open/close
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Header Skeleton */}
          <Grid item xs={12}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="text" width={150} height={20} />
          </Grid>
          
          {/* Metrics Skeleton */}
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
          
          {/* Charts Skeleton */}
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (dashboardError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refetchDashboard}>
              Retry
            </Button>
          }
        >
          Failed to load dashboard data. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Welcome back, {profile?.firstName}! 👋
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
              Here's your financial overview for {format(new Date(), 'MMMM yyyy')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleMenuOpen}
              size="small"
            >
              {timeRange.toUpperCase()}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleTimeRangeChange('7d')}>Last 7 days</MenuItem>
              <MenuItem onClick={() => handleTimeRangeChange('30d')}>Last 30 days</MenuItem>
              <MenuItem onClick={() => handleTimeRangeChange('90d')}>Last 90 days</MenuItem>
              <MenuItem onClick={() => handleTimeRangeChange('1y')}>Last year</MenuItem>
            </Menu>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              href="/transactions/new"
              size="small"
            >
              Add Transaction
            </Button>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        {metrics?.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={metric.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MetricCard {...metric} />
            </motion.div>
          </Grid>
        ))}

        {/* Financial Insights */}
        {dashboardData?.insights && dashboardData.insights.length > 0 && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <FinancialInsights insights={dashboardData.insights} />
            </motion.div>
          </Grid>
        )}

        {/* Cash Flow Chart */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <CashFlowChart 
              data={dashboardData?.cashFlow || []} 
              timeRange={timeRange}
              currency={profile?.currency || 'USD'}
            />
          </motion.div>
        </Grid>

        {/* Category Spending */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Spending by Category
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={dashboardData?.categorySpending || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="amount"
                      >
                        {dashboardData?.categorySpending?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [
                          formatCurrency(value, profile?.currency),
                          'Amount'
                        ]}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={action.title}>
                  <QuickActionCard {...action} />
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Grid>

        {/* Budget Overview */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <BudgetOverview 
              budgetAlerts={dashboardData?.budgetAlerts || []}
              budgetUtilization={dashboardData?.budgetUtilization || 0}
              currency={profile?.currency || 'USD'}
            />
          </motion.div>
        </Grid>

        {/* Goal Progress */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <GoalProgress 
              goals={dashboardData?.goalProgress || []}
              activeGoals={dashboardData?.activeGoals || 0}
              completedGoals={dashboardData?.completedGoals || 0}
              currency={profile?.currency || 'USD'}
            />
          </motion.div>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <RecentTransactions 
              transactions={dashboardData?.recentTransactions || []}
              currency={profile?.currency || 'USD'}
            />
          </motion.div>
        </Grid>

        {/* Bill Reminders */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <BillReminders 
              bills={dashboardData?.upcomingBillsList || []}
              upcomingCount={dashboardData?.upcomingBills || 0}
              currency={profile?.currency || 'USD'}
            />
          </motion.div>
        </Grid>

        {/* Emergency Fund Progress */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Emergency Fund Progress
                  </Typography>
                  <Chip 
                    label={`${(dashboardData?.emergencyFundProgress || 0).toFixed(1)}%`}
                    color={
                      (dashboardData?.emergencyFundProgress || 0) >= 100 
                        ? 'success' 
                        : (dashboardData?.emergencyFundProgress || 0) >= 50 
                        ? 'warning' 
                        : 'error'
                    }
                    size="small"
                  />
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={Math.min(dashboardData?.emergencyFundProgress || 0, 100)}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6,
                      backgroundColor: 
                        (dashboardData?.emergencyFundProgress || 0) >= 100
                          ? theme.palette.success.main
                          : theme.palette.primary.main,
                    },
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Target: {formatCurrency(profile?.emergencyFundTarget || 0, profile?.currency)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(dashboardData?.emergencyFundProgress || 0) >= 100 ? 'Goal Achieved! 🎉' : 'Keep saving'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;