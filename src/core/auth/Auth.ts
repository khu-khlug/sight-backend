import { SetMetadata } from '@nestjs/common';

import { UserRole } from '@khlug/core/auth/UserRole';

export const AUTH_DECORATOR_METADATA_KEY = '@khlug/auth-decorator';

export type AuthMetadata = {
  roles: UserRole[];
};

export const Auth = (roles: UserRole[]): MethodDecorator =>
  SetMetadata<string, AuthMetadata>(AUTH_DECORATOR_METADATA_KEY, { roles });
