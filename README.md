# E-Commerce Web Application

A comprehensive e-commerce solution built with Next.js and Node.js, featuring a modern tech stack and cloud-native architecture.

-Student Name: Vanessa Gyapong
-Index Number: 10211100309

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
