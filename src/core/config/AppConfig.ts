export type AppConfig = {
  env: 'development' | 'production';
};

const validateEnv = (env: string = 'development'): AppConfig['env'] => {
  if (env !== 'development' && env !== 'production') {
    throw new Error(`Invalid NODE_ENV: ${env}`);
  }
  return env as AppConfig['env'];
};

export const config = (): AppConfig => ({
  env: validateEnv(process.env.NODE_ENV),
});
