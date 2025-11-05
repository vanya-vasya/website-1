import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

interface Database {
  query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>>;
  getClient(): Promise<PoolClient>;
  end(): Promise<void>;
  generateId: () => string;
  transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
}

// Create simple connection pool optimized for serverless
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1, // CRITICAL: Only 1 connection per serverless function
  min: 0, // No minimum connections
  idleTimeoutMillis: 1000, // 1 second - very quick cleanup
  connectionTimeoutMillis: 3000, // 3 seconds - fast fail
  allowExitOnIdle: true, // Allow process to exit when idle
});

// Helper function to generate CUID-like IDs
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
}

// Database wrapper with optimized connection handling
const db: Database = {
  query: async <T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> => {
    const start = Date.now();
    let retries = 2; // Reduced retries for faster failure
    
    while (retries > 0) {
      try {
        const result = await pool.query<T>(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
          console.log('[DB Query]', { text, duration, rows: result.rowCount });
        }
        return result;
      } catch (error: any) {
        retries--;
        console.error('[DB Error]', { text, params, error: error.message, retriesLeft: retries });
        
        // Only retry on specific connection errors
        if (retries > 0 && (
          error.message?.includes('Connection terminated') ||
          error.message?.includes('connection timeout') ||
          error.message?.includes('ECONNRESET') ||
          error.code === 'ECONNRESET'
        )) {
          console.log('[DB] Retrying query in 500ms...');
          await new Promise(resolve => setTimeout(resolve, 500)); // Faster retry
          continue;
        }
        
        throw error;
      }
    }
    
    throw new Error('Database query failed after all retries');
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

// Test connection on startup (only in development)
if (process.env.NODE_ENV === 'development' && process.env.DATABASE_URL) {
  pool.query('SELECT 1')
    .then(() => {
      console.log('[DB] PostgreSQL connection established');
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

