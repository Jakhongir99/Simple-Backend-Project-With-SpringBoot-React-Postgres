# PostgreSQL CRUD - React Frontend

A modern React application built with Vite that provides a beautiful interface for managing users in a PostgreSQL database.

## 🚀 Features

- **Modern React with TypeScript** - Built with React 18 and TypeScript
- **Vite Build Tool** - Fast development and optimized builds
- **Bootstrap UI** - Beautiful, responsive interface
- **CRUD Operations** - Create, Read, Update, Delete users
- **Real-time Updates** - Automatic refresh after operations
- **Sample Data** - One-click sample data generation
- **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Bootstrap 5** - UI framework
- **Axios** - HTTP client for API calls
- **Font Awesome** - Icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- Your Spring Boot backend running on `http://localhost:8080`

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

## 🔗 API Endpoints

The React app connects to your Spring Boot backend at `http://localhost:8080/api/users`:

- **GET** `/api/users` - Get all users
- **POST** `/api/users` - Create new user
- **GET** `/api/users/{id}` - Get user by ID
- **PUT** `/api/users/{id}` - Update user
- **DELETE** `/api/users/{id}` - Delete user

## 🎨 Features

### User Management

- ✅ Add new users with validation
- ✅ Edit existing users
- ✅ Delete users with confirmation
- ✅ View all users in a table
- ✅ Real-time updates

### UI/UX

- ✅ Modern gradient design
- ✅ Responsive layout
- ✅ Loading states
- ✅ Success/error messages
- ✅ Form validation
- ✅ Sample data generation

### Development

- ✅ Hot module replacement
- ✅ TypeScript support
- ✅ ESLint configuration
- ✅ Optimized builds

## 📱 Usage

1. **Start your Spring Boot backend** on port 8080
2. **Start this React app** with `npm run dev`
3. **Open** `http://localhost:5173` in your browser
4. **Start managing users!**

## 🔧 Configuration

The API base URL is configured in `src/App.tsx`:

```typescript
const API_BASE_URL = "http://localhost:8080/api/users";
```

Change this if your backend runs on a different port or URL.

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Next Steps

- Add search and filtering
- Implement pagination
- Add user authentication
- Add more user fields
- Implement real-time updates with WebSocket
