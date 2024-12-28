import { UserState } from '@khlug/app/domain/user/model/constant';

export interface ProfileView {
  name: string;
  college: string;
  grade: number;
  number: number | null;
  email: string | null;
  phone: string | null;
  homepage: string | null;
  language: string | null;
  prefer: string | null;
}

export interface UserView {
  id: string;
  name: string;
  password: string | null;
  profile: ProfileView;
  admission: string;
  state: UserState;
  point: number;
  active: boolean;
  manager: boolean;
  slack: string | null;
  rememberToken: string | null;
  khuisAuthAt: Date;
  returnAt: Date | null;
  returnReason: string | null;
  lastLoginAt: Date;
  lastEnterAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
