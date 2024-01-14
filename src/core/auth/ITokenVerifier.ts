import { IRequester } from '@sight/core/auth/IRequester';

export const TokenVerifier = Symbol('TokenVerifier');

export interface ITokenVerifier {
  verify: (token: string) => IRequester;
}
