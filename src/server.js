const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { validateEnv } = require('./config/validateEnv');
validateEnv();

const { connectDB, disconnectDB } = require('./config/db');
const { initCloudinary } = require('./config/cloudinary');
const { initAIProvider } = require('./config/aiProvider');
const { initEmailTransport } = require('./services/emailService');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    initCloudinary();
    initAIProvider();
    initEmailTransport();

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 InterviewAI backend running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log(`   Health: http://localhost:${PORT}/api/health\n`);
    });

    // Connect to database without blocking server boot
    connectDB().catch((err) => {
      console.error('Database connection error on boot:', err.message);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('Server closed.');
        process.exit(0);
      });
      setTimeout(() => {
        console.error('Forcing shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
