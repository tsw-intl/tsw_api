import { registerAs } from '@nestjs/config';

interface HttpConfig {
  host: string;
  port: number;
}

export interface AppConfig {
  name: string;
  globalPrefix: string;
  env: string;
  timeout: number;
  language: string;
  http: HttpConfig;
  timezone: string;
  locale: string;
  debug: boolean;
}

export default registerAs(
  'app',
  (): AppConfig => ({
    env: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'api-tsw',
    globalPrefix: process.env.APP_GLOBAL_PREFIX || 'api/v1',
    timeout: parseInt(process.env.APP_TIMEOUT) || 7000,
    language: process.env.LANGUAGE || 'fr',
    http: {
      host: process.env.HOST || '0.0.0.0',
      port: parseInt(process.env.PORT) || 3000,
    },
    timezone: process.env.TZ || 'Africa/Abidjan',
    locale: process.env.LOCALE || 'fr-FR',
    debug: process.env.DEBUG === 'true' || false,
  }),
);
