import { neonConfig, Pool as NeonPool, PoolClient as NeonPoolClient, QueryResult, QueryResultRow } from '@neondatabase/serverless';
import { Pool as PgPool, PoolClient as PgPoolClient } from 'pg';

interface Database {
  query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>>;
  getClient(): Promise<NeonPoolClient | PgPoolClient>;
  end(): Promise<void>;
}

// Configure Neon for Vercel serverless environment - use HTTP instead of WebSocket
neonConfig.pipelineConnect = false;
neonConfig.useSecureWebSocket = false; // Disable WebSocket for Vercel compatibility

// Create connection pool with fallback strategy
let pool: NeonPool | PgPool;

try {
  // Try Neon serverless driver first
  pool = new NeonPool({
    connectionString: process.env.DATABASE_URL,
    max: 1, // CRITICAL: Only 1 connection per serverless function instance
    idleTimeoutMillis: 5000, // 5 seconds - very quick cleanup for serverless
    connectionTimeoutMillis: 5000, // 5 seconds - fast fail for cold starts
  });
  console.log('[DB] Using Neon serverless driver');
} catch (error) {
  // Fallback to regular pg driver
  console.warn('[DB] Neon serverless failed, falling back to pg driver:', error);
  pool = new PgPool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 1, // CRITICAL: Only 1 connection per serverless function instance
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true,
  });
}

// Helper function to generate CUID-like IDs
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
}

// Database wrapper with helper methods
const db: Database & {
  generateId: () => string;
  transaction: <T>(callback: (client: NeonPoolClient | PgPoolClient) => Promise<T>) => Promise<T>;
} = {
  query: async <T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> => {
    const start = Date.now();
    let retries = 3;
    
    while (retries > 0) {
      try {
        const res = await pool.query<T>(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
          console.log('[DB Query]', { text, duration, rows: res.rowCount });
        }
        return res;
      } catch (error: any) {
        retries--;
        console.error('[DB Error]', { text, params, error: error.message, retriesLeft: retries });
        
        // Check if it's a connection error that we can retry
        if (retries > 0 && (
          error.message?.includes('Connection terminated') ||
          error.message?.includes('connection timeout') ||
          error.message?.includes('ECONNRESET') ||
          error.code === 'ECONNRESET'
        )) {
          console.log('[DB] Retrying query in 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        throw error;
      }
    }
    
    throw new Error('Database query failed after all retries');
  },

  getClient: async (): Promise<NeonPoolClient | PgPoolClient> => {
    return await pool.connect();
  },

  end: async (): Promise<void> => {
    await pool.end();
  },

  generateId: (): string => {
    return generateId();
  },

  transaction: async <T>(
    callback: (client: NeonPoolClient | PgPoolClient) => Promise<T>
  ): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};

// Test connection on startup (only in development with DATABASE_URL set)
if (process.env.NODE_ENV === 'development' && process.env.DATABASE_URL) {
  pool.connect()
    .then(client => {
      console.log('[DB] PostgreSQL connection established');
      client.release();
    })
    .catch(error => {
      console.error('[DB] PostgreSQL connection failed:', error);
    });
}

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('[DB] Unexpected pool error:', err);
});

export default db;

