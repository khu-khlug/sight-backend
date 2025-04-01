type ExtractParams<T extends string> =
  T extends `${infer A}:${infer Param}:${infer B}`
    ? { [key in Param]: string } & ExtractParams<`${A}${B}`>
    : unknown;

type Prettify<T> = {} & { [P in keyof T]: T[P] };

export class MessageBuilder {
  static build<T extends string>(
    message: T,
    params: Prettify<ExtractParams<T>>,
  ) {
    return message.replace(/:(\w+):/g, (_, key) => params[key]);
  }
}
