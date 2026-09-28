require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reportRoutes = require('./routes/reportRoutes');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all origins and headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/reports', reportRoutes);
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Medical Analyzer Backend listening on http://localhost:${PORT}`);
});