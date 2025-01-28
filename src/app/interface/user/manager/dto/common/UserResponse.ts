import { UserState } from '@khlug/app/domain/user/model/constant';

export class UserProfileResponse {
  name!: string;
  college!: string;
  grade!: number;
  number!: number | null;
  email!: string | null;
  phone!: string | null;
  homepage!: string | null;
  language!: string | null;
  prefer!: string | null;
}

export class UserResponse {
  id!: number;
  name!: string;
  password!: string | null;
  profile!: UserProfileResponse;
  admission!: string;
  state!: UserState;
  point!: number;
  active!: boolean;
  manager!: boolean;
  slack!: string | null;
  rememberToken!: string | null;
  khuisAuthAt!: Date;
  returnAt!: Date | null;
  returnReason!: string | null;
  lastLoginAt!: Date;
  lastEnterAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
