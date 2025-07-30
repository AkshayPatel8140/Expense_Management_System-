import { baseApi } from './baseApi';

// Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePicture?: string;
  monthlyIncome: number;
  currency: string;
  timezone: string;
  dateFormat: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  financialGoals: string[];
  emergencyFundTarget: number;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  subscriptionExpires?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  notifications: {
    email: {
      budgetAlerts: boolean;
      billReminders: boolean;
      goalProgress: boolean;
      weeklyReports: boolean;
      monthlyReports: boolean;
    };
    push: {
      budgetAlerts: boolean;
      billReminders: boolean;
      transactionAlerts: boolean;
    };
  };
  usageStats: {
    transactionsAdded: number;
    reportsGenerated: number;
    lastLogin?: string;
    totalLogins: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  monthlyIncome?: number;
  currency?: string;
  timezone?: string;
  acceptTerms: boolean;
}

export interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
  emailVerificationSent: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  monthlyIncome?: number;
  currency?: string;
  timezone?: string;
  dateFormat?: string;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  financialGoals?: string[];
  emergencyFundTarget?: number;
}

export interface UpdateNotificationsRequest {
  email?: {
    budgetAlerts?: boolean;
    billReminders?: boolean;
    goalProgress?: boolean;
    weeklyReports?: boolean;
    monthlyReports?: boolean;
  };
  push?: {
    budgetAlerts?: boolean;
    billReminders?: boolean;
    transactionAlerts?: boolean;
  };
}

export interface VerifyEmailRequest {
  token: string;
}

export interface Enable2FAResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface Verify2FARequest {
  token: string;
  code: string;
}

// API endpoints
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Authentication
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    refreshToken: builder.mutation<LoginResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),

    // Password management
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Email verification
    verifyEmail: builder.mutation<{ message: string }, VerifyEmailRequest>({
      query: ({ token }) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: { token },
      }),
      invalidatesTags: ['User'],
    }),

    resendVerificationEmail: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/resend-verification',
        method: 'POST',
      }),
    }),

    // Two-factor authentication
    enable2FA: builder.mutation<Enable2FAResponse, void>({
      query: () => ({
        url: '/auth/2fa/enable',
        method: 'POST',
      }),
    }),

    verify2FA: builder.mutation<{ message: string }, Verify2FARequest>({
      query: (data) => ({
        url: '/auth/2fa/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    disable2FA: builder.mutation<{ message: string }, { code: string }>({
      query: (data) => ({
        url: '/auth/2fa/disable',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // User profile
    getProfile: builder.query<User, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    updateNotifications: builder.mutation<User, UpdateNotificationsRequest>({
      query: (data) => ({
        url: '/users/notifications',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    uploadProfilePicture: builder.mutation<{ profilePicture: string }, FormData>({
      query: (formData) => ({
        url: '/users/profile-picture',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['User'],
    }),

    deleteAccount: builder.mutation<{ message: string }, { password: string }>({
      query: (data) => ({
        url: '/users/account',
        method: 'DELETE',
        body: data,
      }),
    }),

    // Account recovery
    exportData: builder.mutation<Blob, { format: 'json' | 'csv' }>({
      query: ({ format }) => ({
        url: `/users/export?format=${format}`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    getUsageStats: builder.query<{
      transactionsAdded: number;
      reportsGenerated: number;
      lastLogin: string;
      totalLogins: number;
      accountAge: number;
      storageUsed: number;
      apiUsage: number;
    }, void>({
      query: () => '/users/usage-stats',
      providesTags: ['User'],
    }),

    // Session management
    getActiveSessions: builder.query<Array<{
      id: string;
      device: string;
      browser: string;
      location: string;
      lastActive: string;
      current: boolean;
    }>, void>({
      query: () => '/auth/sessions',
    }),

    revokeSession: builder.mutation<{ message: string }, { sessionId: string }>({
      query: ({ sessionId }) => ({
        url: `/auth/sessions/${sessionId}`,
        method: 'DELETE',
      }),
    }),

    revokeAllSessions: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/sessions/revoke-all',
        method: 'DELETE',
      }),
    }),
  }),
});

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
  useEnable2FAMutation,
  useVerify2FAMutation,
  useDisable2FAMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateNotificationsMutation,
  useUploadProfilePictureMutation,
  useDeleteAccountMutation,
  useExportDataMutation,
  useGetUsageStatsQuery,
  useGetActiveSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
} = authApi;