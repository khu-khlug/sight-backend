import { createParamDecorator } from '@nestjs/common';

export const Requester = createParamDecorator((data, req) => {
  return req['requester'];
});
