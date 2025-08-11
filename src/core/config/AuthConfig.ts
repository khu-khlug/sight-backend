export type AuthServiceConfig = {
  endpoint: string;
  apiKey: string;
};

export const config = (): AuthServiceConfig => ({
  endpoint: process.env.AUTH_SERVICE_ENDPOINT || '',
  apiKey: process.env.AUTH_SERVICE_API_KEY || '',
});
