import { InjectionToken, Provider } from '@nestjs/common';

export const generateEmptyProviders = (
  ...tokens: InjectionToken[]
): Provider[] => {
  return tokens.map((token) => ({ provide: token, useValue: {} }));
};
