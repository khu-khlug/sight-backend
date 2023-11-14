import { User } from '@sight/app/domain/user/model/User';

export class PointGranted {
  constructor(
    readonly user: User,
    readonly point: number,
    readonly reason: string,
  ) {}
}
