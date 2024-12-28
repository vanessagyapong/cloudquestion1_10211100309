# E-Commerce Web Application

A comprehensive e-commerce solution built with Next.js and Node.js, featuring a modern tech stack and cloud-native architecture.

## 👩‍🎓 Student Information

- **Name:** Vanessa Gyapong
- **Index Number:** 10211100309
- **Course:** Cloud Application Development
- **Institution:** Academic City University College

## 🔗 Deployment Links

- **Frontend:** [https://cloudquestion1-frontend.vercel.app](https://cloudquestion1-frontend.vercel.app)
- **Backend API:** [https://cloudquestion1-backend.onrender.com](https://cloudquestion1-backend.onrender.com)
- **GitHub Repository:** [https://github.com/vanessagyapong/cloudquestion1](https://github.com/vanessagyapong/cloudquestion1)

## 📸 Key Features & Screenshots

### 1. Homepage & Product Listing

![Homepage](screenshots/homepage.png)

- Featured products showcase
- Category navigation
- Search functionality
- Responsive design

### 2. User Authentication

![Authentication](screenshots/auth.png)

- Secure login/register
- JWT-based authentication
- Password recovery

### 3. Product Management (Admin)

![Product Management](screenshots/product-management.png)

- Add/Edit products
- Inventory management
- Category management

### 4. Shopping Cart & Checkout

![Cart](screenshots/cart.png)

- Real-time cart updates
- Secure checkout process
- Order summary

### 5. User Dashboard

![Dashboard](screenshots/dashboard.png)

- Order history
- Profile management
- Wishlist management

### 6. Analytics Dashboard

![Analytics](screenshots/analytics.png)

- Sales metrics
- User behavior
- Inventory insights

## 🏗️ Project Structure

### Frontend Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable React components
│   ├── contexts/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service functions
│   ├── styles/             # Global styles and Tailwind
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── tests/                 # Test files
```

### Backend Structure

```
backend/
├── src/
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── tests/                # Test files
└── uploads/             # File uploads
```

## 🧪 Testing Results

### Frontend Tests

```bash
Test Suites: 12 passed, 12 total
Tests:       48 passed, 48 total
Snapshots:   15 passed, 15 total
Time:        5.28s
```

### Backend Tests

```bash
Test Suites: 8 passed, 8 total
Tests:      32 passed, 32 total
Coverage:   85.4%
Time:       3.92s
```

## 📊 Performance Metrics

- Lighthouse Score: 96/100
- API Response Time: <100ms
- Test Coverage: >85%
- Mobile Responsiveness: 100%

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn
- Git

## 🌟 Features

### 🛍️ Customer Features

- **Product Browsing**

  - Browse products by categories
  - Search functionality with filters
  - Featured products on homepage
  - Detailed product views with images and descriptions

- **Shopping Experience**

  - Shopping cart management
  - Wishlist functionality
  - Secure checkout process
  - Order history and tracking

- **User Account**

  - Secure authentication (login/register)
  - Profile management
  - Password reset functionality
  - Order history viewing

  **Test Credentials**

  - userType: admin or seller
  - Email: admin@admin.com
  - Password: iamadmin

  - userType: user
  - Email: user@user.com
  - Password: iamuser

### 👨‍💼 Admin Features

- **Product Management**

  - Add/Edit/Delete products
  - Manage product categories
  - Stock management
  - Bulk product operations

- **Order Management**
  - Process orders
  - Update order status
  - View order analytics
  - Customer order history

### 📊 Analytics & Reports

- Sales analytics dashboard
- Product performance metrics
- Customer behavior insights
- Inventory analytics

## 🚀 Tech Stack

### Frontend (Next.js)

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Authentication**: JWT with HTTP-only cookies
- **Data Fetching**: React Query
- **Form Handling**: React Hook Form
- **Type Safety**: TypeScript

### Backend (Node.js)

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **API**: RESTful architecture
- **Validation**: Express Validator
- **Security**: bcrypt, CORS, Helmet
- **Logging**: Morgan

## 📦 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn
- Git

### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create .env file:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:3000
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create .env.local file:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication
- HTTP-only cookies
- CORS protection
- Input validation
- XSS protection
- Rate limiting

## 📱 Mobile Responsiveness

- Responsive design for all screen sizes
- Mobile-first approach
- Touch-friendly interfaces
- Optimized images and assets

## 🧪 Testing

- Unit tests for components
- API endpoint testing
- Integration tests
- E2E testing with Cypress

## 📈 Performance Optimization

- Image optimization
- Code splitting
- Lazy loading
- Caching strategies
- Server-side rendering
- Static site generation where applicable

### Features

- ✅ User authentication
- ✅ Product management
- ✅ Shopping cart functionality
- ✅ Order processing
- ✅ User profiles
- ✅ Admin dashboard
- ✅ Basic analytics

## 📄 API Documentation

- Detailed API documentation available in `/backend/README.md`
- Frontend component documentation in `/frontend/README.md`

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 📝 Assignment Requirements Checklist

### 1. Front-End Design and User Experience (15 Marks) ✅

- [x] Responsive design
- [x] Featured products homepage
- [x] Product listings with categories
- [x] Search functionality
- [x] Product detail pages
- [x] Cart and Checkout pages
- [x] Mobile responsiveness

### 2. User Authentication (10 Marks) ✅

- [x] Login/Registration system
- [x] Password management
- [x] Profile features
- [x] Security measures

### 3. Product Management (5 Marks) ✅

- [x] Admin interface
- [x] CRUD operations
- [x] Stock management

### 4. Order Processing (5 Marks) ✅

- [x] Shopping cart system
- [x] Checkout process
- [x] Order tracking

### 5. Backend Development (5 Marks) ✅

- [x] RESTful APIs
- [x] Database integration
- [x] Data validation

### 6. Testing and Documentation (5 Marks) ✅

- [x] Functional testing
- [x] Documentation
- [x] Installation guide

### 7. Analytics and Reports (15 Marks) ✅

- [x] Sales analytics
- [x] User behavior tracking
- [x] Inventory reports

## 📧 Contact

For any queries regarding this submission, please contact:

- **Email:** vanessa.gyapong@acity.edu.gh
- **Student ID:** 10211100309
