import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  name: string;
  user: string;
  password: string;
  admin: boolean;
  srv: boolean;
  ssl: boolean;
  debug: boolean;
  options: string;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    host: process.env.RAILWAY_PRIVATE_DOMAIN || '127.0.0.1:27017',
    name: process.env.DATABASE_NAME || 'tswapp',
    user: process.env.MONGO_INITDB_ROOT_USERNAME || null,
    password: process.env.MONGO_INITDB_ROOT_PASSWORD || null,
    admin: process.env.DATABASE_ADMIN === 'true' || false,
    srv: process.env.DATABASE_SRV === 'true' || false,
    ssl: process.env.DATABASE_SSL === 'true' || false,
    debug: process.env.DATABASE_DEBUG === 'true' || false,
    options: process.env.DATABASE_OPTIONS,
  }),
);

// mongodb://${{MONGO_INITDB_ROOT_USERNAME}}:${{MONGO_INITDB_ROOT_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:27017
