import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fs from 'fs';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

function resolveSqlHost(): string | undefined {
  const host = process.env.SQL_HOST;
  if (!host) return undefined;

  // If host starts with / (unix domain socket directory)
  if (host.startsWith('/')) {
    if (fs.existsSync(host)) {
      return host;
    }
    // Check Cloud Run standard mount path (/cloudsql/...)
    if (host.startsWith('/app/cloudsql/')) {
      const cloudRunPath = host.replace('/app/cloudsql/', '/cloudsql/');
      if (fs.existsSync(cloudRunPath)) {
        return cloudRunPath;
      }
    }
    // The unix domain socket does not exist on this filesystem (e.g. Cloud Run without socket mount)
    return undefined;
  }

  // Regular TCP host (e.g. 127.0.0.1 or domain)
  return host;
}

export function isSqlConfigured(): boolean {
  const host = resolveSqlHost();
  if (!host) return false;
  return Boolean(process.env.SQL_USER && process.env.SQL_DB_NAME);
}

export const createPool = () => {
  if (!global._postgresPool) {
    const host = resolveSqlHost();
    if (!host) {
      // Dummy pool or idle configuration when DB host is absent
      global._postgresPool = new Pool({
        connectionTimeoutMillis: 1000,
      });
    } else {
      global._postgresPool = new Pool({
        host,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 5,
        connectionTimeoutMillis: 2000,
      });
    }

    global._postgresPool.on('error', (err) => {
      // Silent warning, prevents process crash
      console.warn('PostgreSQL idle client connection warning (safe fallback in effect):', err.message);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });

