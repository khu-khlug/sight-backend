import { Injectable } from '@nestjs/common';

type ExtractParams<T extends string> =
  T extends `${infer A}:${infer Param}:${infer B}`
    ? { [key in Param]: string } & ExtractParams<`${A}${B}`>
    : unknown;

// eslint-disable-next-line @typescript-eslint/ban-types
type Prettify<T> = {} & { [P in keyof T]: T[P] };

@Injectable()
export class MessageBuilder {
  build<T extends string>(message: T, params: Prettify<ExtractParams<T>>) {
    return message.replace(/:(\w+):/g, (_, key) => params[key]);
  }
}
