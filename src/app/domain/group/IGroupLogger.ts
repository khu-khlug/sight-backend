export const GroupLogger = Symbol('GroupLogger');

export interface IGroupLogger {
  log: (groupId: string, message: string) => Promise<void>;
}
