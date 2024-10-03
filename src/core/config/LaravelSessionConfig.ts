export type LaravelSessionConfig = {
  secret: string;
  storagePath: string;
};

// 레거시 시스템과의 호환성을 위해 Laravel 세션을 사용합니다.
export const config = (): LaravelSessionConfig => ({
  secret: process.env.APP_KEY || '',
  storagePath: process.env.SESSION_STORAGE_PATH || '',
});
