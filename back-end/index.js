require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Import and register the tollStationPasses route and passAnalysis route
const tollStationPassesRoutes = require('./routes/endpoints/tollStationPasses');
app.use('/api/tollStationPasses', tollStationPassesRoutes);
const passAnalysisRoutes = require('./routes/endpoints/passAnalysis');
app.use('/api/passAnalysis', passAnalysisRoutes);
const passesCostRoutes = require('./routes/endpoints/passesCost');
app.use('/api/passesCost', passesCostRoutes);


// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 