// Types
export type FriendInfo = {
  slug: string;
  name: string;
};

export type FollowingInfo = {
  slug: string;
  name: string;
};

export type GroupInfo = {
  slug: string;
  name: string;
};

export type ExportData = {
  version: 1;
  exportedAt: number;
  isFriendFocus: boolean;
  isStatusIndicatorVisible: boolean;
  friendList: FriendInfo[];
  friendListUpdatedAt: number | null;
  followingList: FollowingInfo[];
  followingListUpdatedAt: number | null;
  isFollowingsEnabled: boolean;
  groupList: GroupInfo[];
  groupListUpdatedAt: number | null;
  isGroupsEnabled: boolean;
};
