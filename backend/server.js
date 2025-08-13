const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
const allowedOrigins = [
  'https://navigatio-b6a2ebbvfygxazeq.centralindia-01.azurewebsites.net',
  'https://navigatio-b6a2ebbvfygxazeq.scm.azurewebsites.net',
  'https://navigatioasia.com',
  'http://navigatioasia.com',
  'http://localhost:3000',  // For local development
  'http://localhost:5000'   // For local development
];

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all subdomains of azurewebsites.net and custom domain
    if (
      origin.endsWith('.azurewebsites.net') || 
      origin.endsWith('navigatioasia.com') ||
      origin === 'https://navigatio-b6a2ebbvfygxazeq.centralindia-01.azurewebsites.net' ||
      origin === 'https://navigatio-b6a2ebbvfygxazeq.scm.azurewebsites.net'
    ) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Blocked by CORS:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Enable CORS pre-flight
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Add CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (corsOptions.origin(origin, () => {})) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});



// Import and use routes
const routes = [
  { path: '/api/v1/itinerary-creator', route: require('./routes/itineraryCreator') },
  { path: '/api/auth', route: require('./routes/auth') },
  { path: '/api/users', route: require('./routes/user') },
  { path: '/api/quotes', route: require('./routes/quote') },
  { path: '/api/leads', route: require('./routes/lead') },
  { path: '/api/bookings', route: require('./routes/booking') },
  { path: '/api/packages', route: require('./routes/package') },
  { path: '/api/itineraries', route: require('./routes/itinerary') },
  { path: '/api/booking-status', route: require('./routes/bookingStatus') },
  { path: '/api/claims', route: require('./routes/claim') },
  { path: '/api/sellers', route: require('./routes/seller') },
  { path: '/api/suppliers', route: require('./routes/supplierRoutes') },
  { path: '/api/sightseeing', route: require('./routes/sightseeingRoutes') },
  { path: '/api/notifications', route: require('./routes/notificationRoutes') },
  { path: '/api/guest-sightseeing', route: require('./routes/guestSightseeing') },
  { path: '/api/guest-sightseeing-test', route: require('./routes/guestSightseeingTest') },
  { path: '/api/sales-leads', route: require('./routes/salesLeads') },
  { path: '/api/stats', route: require('./routes/stats') },
  { path: '/api', route: (req, res) => res.json({ message: 'API is working!' }) },
  { path: '/api/wallets', route: require('./routes/wallet') },
  { path: '/api/lms', route: require('./routes/lms') },
  { path: '/api/ai', route: require('./routes/ai') },
  { path: '/api/test', route: require('./routes/test') }
];

// Register routes
routes.forEach(({ path, route }) => {
  app.use(path, route);
  console.log(`Registered route: ${path}`);
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // In development, just provide API status
  app.get('/', (req, res) => {
    res.send('Navigatio API is running in development mode...');
  });
  
  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found'
    });
  });
  
  // For all other routes in development, redirect to the React dev server
  app.get('*', (req, res) => {
    res.redirect(`http://navigatioasia.com${req.url}`);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});
