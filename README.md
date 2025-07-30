# 💰 BudgetMaster - Comprehensive Budgeting & Expense Tracking Application

A full-stack financial management application built with React, TypeScript, Node.js, and MongoDB. BudgetMaster provides comprehensive budgeting, expense tracking, financial analytics, and goal-setting capabilities with a modern, professional interface.

![BudgetMaster Dashboard](https://via.placeholder.com/800x400/1976d2/white?text=BudgetMaster+Dashboard)

## ✨ Features

### 📊 Expense Management System
- **Transaction Entry**: Record income and expenses with categorization, merchant identification, and receipt photo capture
- **Automatic Categorization**: Machine learning-powered pattern recognition for transaction categorization
- **Recurring Expenses**: Set up recurring transactions with subscription tracking and renewal alerts
- **Split Expenses**: Manage shared costs and group financial management
- **Receipt Scanning**: OCR technology to extract transaction data from receipts

### 💳 Budget Planning & Control
- **Category-based Budgets**: Create budgets with percentage allocation and fixed amount options
- **Variance Tracking**: Real-time budget vs. actual spending analysis with alert system
- **Goal-based Budgeting**: Set savings targets with timeline achievement tracking
- **Emergency Fund Planning**: Automated savings recommendations and progress tracking

### 📈 Financial Analytics Dashboard
- **Spending Trends**: Monthly, quarterly, and yearly spending comparisons
- **Category Breakdown**: Percentage distribution and spending pattern identification
- **Cash Flow Visualization**: Income vs. expense timeline tracking
- **Financial Health Scoring**: Debt-to-income ratio and savings rate calculations

### 🎯 Goal Setting & Achievement
- **SMART Goals**: Create Specific, Measurable, Achievable, Relevant, Time-bound financial goals
- **Debt Payoff Calculator**: Multiple strategies (snowball, avalanche) with optimization
- **Savings Visualization**: Progress tracking with achievement celebrations
- **Investment Planning**: Risk tolerance assessment and timeline consideration

### 📋 Reporting & Insights
- **Custom Reports**: Date range selection and category filtering
- **Tax Preparation**: Expense categorization and deduction identification
- **Monthly Summaries**: Key metrics and improvement recommendations
- **Year-end Reviews**: Goal achievement analysis and planning for next year

### 🎨 Visual Design & UX
- **Professional Interface**: Clean design building confidence in financial management
- **Chart Visualizations**: Optimized for financial data interpretation
- **Color Coding**: Different expense categories and budget status indicators
- **Mobile Responsive**: Seamless experience across all devices

### 🔒 Security & Advanced Features
- **Bank Integration Ready**: Secure API connection planning (Plaid integration)
- **Data Encryption**: Advanced security measures for sensitive financial information
- **Backup & Sync**: Cross-device financial data access
- **Export Functionality**: Tax preparation and financial advisor consultation
- **Bill Reminders**: Due date tracking and payment confirmation
- **Credit Score Monitoring**: Integration with improvement recommendations
- **Investment Tracking**: Portfolio performance analysis and allocation optimization

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for professional UI components
- **Redux Toolkit** with RTK Query for state management
- **React Router** for navigation
- **Recharts** for data visualization
- **Framer Motion** for animations
- **React Hook Form** with Yup validation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication with refresh tokens
- **Bcrypt** for password hashing
- **Winston** for comprehensive logging
- **Helmet** for security headers
- **Rate limiting** and CORS protection

### Additional Technologies
- **Machine Learning**: Natural language processing for transaction categorization
- **OCR**: Tesseract.js for receipt scanning
- **Email**: Nodemailer for notifications
- **File Upload**: Multer with validation
- **Cron Jobs**: Automated tasks and reminders

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/budgetmaster.git
   cd budgetmaster
   ```

2. **Install dependencies**
   ```bash
   npm run install-deps
   ```

3. **Environment Configuration**
   
   Copy the environment template and configure:
   ```bash
   cp server/.env.example server/.env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/budgeting_app
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Encryption
   ENCRYPTION_KEY=your_32_character_encryption_key
   
   # Optional: Bank API (Plaid)
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   PLAID_ENV=sandbox
   ```

4. **Start MongoDB**
   ```bash
   # If using MongoDB locally
   mongod
   
   # Or using MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env file
   ```

5. **Run the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or run separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## 📱 Usage Guide

### Getting Started
1. **Create Account**: Register with your email and basic information
2. **Set Up Profile**: Configure your monthly income, currency preferences, and financial goals
3. **Add Categories**: Customize expense and income categories or use defaults
4. **Create Your First Budget**: Set monthly spending limits for different categories

### Daily Usage
1. **Add Transactions**: Record expenses and income as they occur
2. **Upload Receipts**: Take photos of receipts for automatic data extraction
3. **Check Dashboard**: Monitor your financial health and progress
4. **Review Alerts**: Respond to budget warnings and bill reminders

### Monthly Reviews
1. **Analyze Spending**: Review category breakdowns and trends
2. **Adjust Budgets**: Modify budget allocations based on actual spending
3. **Update Goals**: Track progress and adjust financial goals
4. **Generate Reports**: Create monthly summaries for analysis

## 🎯 Key Features Walkthrough

### Dashboard Overview
The main dashboard provides:
- **Net Worth Tracking**: Real-time calculation of assets vs liabilities
- **Monthly Cash Flow**: Visual representation of income vs expenses
- **Budget Health**: Color-coded indicators for budget categories
- **Goal Progress**: Visual progress bars for all active financial goals
- **Recent Activity**: Latest transactions and important alerts

### Transaction Management
- **Quick Entry**: Add transactions with minimal required fields
- **Smart Categorization**: AI-powered suggestions based on merchant and description
- **Bulk Import**: CSV upload for historical data
- **Receipt Scanning**: Camera integration for receipt capture and OCR processing
- **Split Transactions**: Manage shared expenses with friends or family

### Budget Creation
- **Template System**: Use pre-built budget templates or create custom ones
- **Percentage-based**: Allocate percentages of income to categories
- **Fixed Amounts**: Set specific dollar amounts for categories
- **Rollover Options**: Handle unused budget amounts month-to-month
- **Alert Thresholds**: Customize warning levels (80%, 95%, etc.)

### Goal Setting
- **SMART Framework**: Guided goal creation using proven methodology
- **Multiple Types**: Savings, debt payoff, investment, emergency fund, etc.
- **Milestone Tracking**: Break large goals into achievable milestones
- **Progress Visualization**: Charts and progress bars for motivation
- **Automated Contributions**: Set up automatic transfers toward goals

### Analytics & Reports
- **Spending Trends**: Identify patterns in your spending behavior
- **Category Analysis**: Deep dive into specific spending categories
- **Income vs Expenses**: Track your monthly financial balance
- **Year-over-Year**: Compare performance across different time periods
- **Custom Reports**: Generate reports for specific date ranges and categories

## 🔧 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
POST /api/auth/logout       - User logout
POST /api/auth/refresh      - Refresh JWT token
POST /api/auth/forgot-password - Password reset request
POST /api/auth/reset-password  - Password reset
```

### Transaction Endpoints
```
GET    /api/transactions           - Get user transactions
POST   /api/transactions           - Create new transaction
GET    /api/transactions/:id       - Get specific transaction
PUT    /api/transactions/:id       - Update transaction
DELETE /api/transactions/:id       - Delete transaction
POST   /api/transactions/bulk      - Bulk import transactions
```

### Budget Endpoints
```
GET    /api/budgets                - Get user budgets
POST   /api/budgets                - Create new budget
GET    /api/budgets/:id            - Get specific budget
PUT    /api/budgets/:id            - Update budget
DELETE /api/budgets/:id            - Delete budget
GET    /api/budgets/current        - Get current active budget
```

### Goal Endpoints
```
GET    /api/goals                  - Get user goals
POST   /api/goals                  - Create new goal
GET    /api/goals/:id              - Get specific goal
PUT    /api/goals/:id              - Update goal
DELETE /api/goals/:id              - Delete goal
POST   /api/goals/:id/progress     - Update goal progress
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Run all tests
npm run test
```

### Test Coverage
- Unit tests for all models and utilities
- Integration tests for API endpoints
- Frontend component tests
- End-to-end tests for critical user flows

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/budgeting_app
JWT_SECRET=your_production_jwt_secret
ENCRYPTION_KEY=your_production_encryption_key
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t budgetmaster-client ./client
docker build -t budgetmaster-server ./server
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Reference](docs/api.md)
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)

### Getting Help
- 📧 Email: support@budgetmaster.com
- 💬 Discord: [BudgetMaster Community](https://discord.gg/budgetmaster)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/budgetmaster/issues)

### FAQ
**Q: Can I connect my bank accounts?**
A: Yes, we support Plaid integration for secure bank account connectivity.

**Q: Is my financial data secure?**
A: Absolutely. We use bank-level encryption and security measures to protect your data.

**Q: Can I export my data?**
A: Yes, you can export your data in multiple formats (JSON, CSV) at any time.

**Q: Does it work on mobile devices?**
A: Yes, the application is fully responsive and works great on all devices.

## 🗺 Roadmap

### Version 2.0 (Q2 2024)
- [ ] Native mobile apps (iOS/Android)
- [ ] Advanced investment tracking
- [ ] Cryptocurrency support
- [ ] AI-powered financial advisor
- [ ] Bill negotiation assistance

### Version 2.1 (Q3 2024)
- [ ] Multi-currency support
- [ ] Family account sharing
- [ ] Advanced tax optimization
- [ ] Credit score improvement tracking
- [ ] Financial education modules

### Version 3.0 (Q4 2024)
- [ ] Open banking integration
- [ ] Automated savings optimization
- [ ] Real estate tracking
- [ ] Insurance management
- [ ] Estate planning tools

## 🙏 Acknowledgments

- Thanks to all contributors who have helped build this project
- Material-UI team for the excellent component library
- Recharts team for powerful data visualization components
- MongoDB team for the robust database solution
- The open-source community for inspiration and tools

---

**BudgetMaster** - Take control of your financial future! 💰✨