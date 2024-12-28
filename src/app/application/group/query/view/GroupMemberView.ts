export interface GroupMemberView {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  language: string | null;
  interests: {
    id: string;
    name: string;
  }[];
  createdAt: Date;
}
