import { neonConfig, Pool, PoolClient, QueryResult, QueryResultRow } from '@neondatabase/serverless';
import ws from 'ws';

interface Database {
  query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>>;
  getClient(): Promise<PoolClient>;
  end(): Promise<void>;
}

// Configure Neon for serverless environment
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;

// Create connection pool optimized for Vercel serverless
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // CRITICAL: Only 1 connection per serverless function instance
  idleTimeoutMillis: 10000, // 10 seconds - quick cleanup for serverless
  connectionTimeoutMillis: 10000, // 10 seconds - fast fail for cold starts
});

// Helper function to generate CUID-like IDs
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
}

// Database wrapper with helper methods
const db: Database & {
  generateId: () => string;
  transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
} = {
  query: async <T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> => {
    const start = Date.now();
    try {
      const res = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log('[DB Query]', { text, duration, rows: res.rowCount });
      }
      return res;
    } catch (error) {
      console.error('[DB Error]', { text, params, error });
      throw error;
    }
  },

  getClient: async (): Promise<PoolClient> => {
    return await pool.connect();
  },

  end: async (): Promise<void> => {
    await pool.end();
  },

  generateId: (): string => {
    return generateId();
  },

  transaction: async <T>(
    callback: (client: PoolClient) => Promise<T>
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

