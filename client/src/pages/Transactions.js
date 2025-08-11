import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  Receipt,
} from '@mui/icons-material';
import { transactionAPI } from '../services/api';

// Mock data
const mockTransactions = [
  { id: 1, description: 'Grocery Store', amount: -85.50, category: 'Food & Dining', date: '2024-01-15', type: 'expense' },
  { id: 2, description: 'Salary Deposit', amount: 2500.00, category: 'Income', date: '2024-01-14', type: 'income' },
  { id: 3, description: 'Gas Station', amount: -45.00, category: 'Transportation', date: '2024-01-13', type: 'expense' },
  { id: 4, description: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', date: '2024-01-12', type: 'expense' },
  { id: 5, description: 'Coffee Shop', amount: -4.50, category: 'Food & Dining', date: '2024-01-11', type: 'expense' },
  { id: 6, description: 'Freelance Work', amount: 500.00, category: 'Income', date: '2024-01-10', type: 'income' },
  { id: 7, description: 'Restaurant', amount: -65.00, category: 'Food & Dining', date: '2024-01-09', type: 'expense' },
  { id: 8, description: 'Uber Ride', amount: -25.00, category: 'Transportation', date: '2024-01-08', type: 'expense' },
];

const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Income',
  'Other'
];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
    type: 'expense'
  });

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      console.log('Loading transactions...');
      const data = await transactionAPI.getAll();
      console.log('Transactions loaded:', data);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      // Don't fallback to mock data anymore since we have proper auth
      setTransactions([]);
      setSnackbar({
        open: true,
        message: 'Failed to load transactions. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: '',
      type: 'expense'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        description: formData.description,
        amount: parseFloat(formData.amount) * (formData.type === 'expense' ? -1 : 1),
        category: formData.category,
        date: formData.date,
        type: formData.type
      };

      const newTransaction = await transactionAPI.create(transactionData);
      setTransactions([newTransaction, ...transactions]);
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: 'Transaction added successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add transaction. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  console.log('Current transactions:', transactions);
  console.log('Filtered transactions:', filteredTransactions);

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Transactions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your income and expenses
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Income
              </Typography>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                ${totalIncome.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                ${totalExpenses.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Net Balance
              </Typography>
              <Typography 
                variant="h4" 
                color={totalIncome - totalExpenses >= 0 ? 'success.main' : 'error.main'} 
                fontWeight="bold"
              >
                ${(totalIncome - totalExpenses).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

            {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                fullWidth
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  py: 1.5
                }}
              >
                More Filters
              </Button>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                onClick={handleOpenDialog}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  py: 1.5
                }}
              >
                Add Transaction
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No transactions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: transaction.amount > 0 ? 'success.light' : 'error.light', mr: 2, width: 32, height: 32 }}>
                              <Receipt fontSize="small" />
                            </Avatar>
                            {transaction.description}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={transaction.category} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    label="Type"
                    onChange={handleChange}
                  >
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
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
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
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
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Transactions; 