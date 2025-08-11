import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
} from '@mui/material';
import { Person, Email, Phone, LocationOn, Edit, Save, Cancel } from '@mui/icons-material';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'demo@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'Financial enthusiast and budget planner. Always looking for ways to optimize spending and increase savings.',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to the backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                <Person sx={{ fontSize: '3rem' }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {formData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                BudgetMaster User
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since January 2024
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Personal Information
                </Typography>
                {!isEditing ? (
                  <Button
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    variant="outlined"
                    size="small"
                  >
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSave}
                      variant="contained"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      variant="outlined"
                      size="small"
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      156
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      8
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Budgets
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      3
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Goals
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      12
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Months
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

export default Profile; 