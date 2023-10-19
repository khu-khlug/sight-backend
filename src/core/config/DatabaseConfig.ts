export type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export const config = (): DatabaseConfig => ({
  host: process.env.DATABASE_HOST || '',
  port: parseInt(process.env.DATABASE_PORT || '', 10) || 3306,
  username: process.env.DATABASE_USER || '',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'khlug',
});
