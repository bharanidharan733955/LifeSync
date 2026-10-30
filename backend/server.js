import 'dotenv/config';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/database.js';
import app from './src/app.js';

// ─── Server entry point ───────────────────────────────────────────────────────
// Connects to MongoDB then starts the HTTP server.

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start HTTP server
    const server = app.listen(env.PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                  🚀 LifeTrack API Server                  ║
╠═══════════════════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(42)}║
║  Port        : ${String(env.PORT).padEnd(42)}║
║  API Prefix  : /api/${env.API_VERSION.padEnd(40)}║
║  API Docs    : http://localhost:${env.PORT}/api-docs${' '.repeat(Math.max(0, 22 - String(env.PORT).length))}║
║  Health      : http://localhost:${env.PORT}/health${' '.repeat(Math.max(0, 25 - String(env.PORT).length))}║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // ── Graceful shutdown ─────────────────────────────────────────────────
    const gracefulShutdown = (signal) => {
      console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        console.error('[Server] Could not close connections in time. Forcefully shutting down.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // ── Unhandled rejection and exception handlers ─────────────────────────
    process.on('unhandledRejection', (err) => {
      console.error('[Server] Unhandled Promise Rejection:', err);
      gracefulShutdown('Unhandled Rejection');
    });

    process.on('uncaughtException', (err) => {
      console.error('[Server] Uncaught Exception:', err);
      gracefulShutdown('Uncaught Exception');
    });

  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
};

startServer();

