import type { FriendInfo, FollowingInfo } from './types';

// Storage keys
export const Key = {
  isFriendFocus: 'is_friend_focus',

  friendList: 'friend_list',
  friendCount: 'friend_count',
  friendListUpdatedAt: 'friend_list_updated_at',

  blockedPostsLog: 'blocked_posts_log',

  isFollowingsEnabled: 'is_followings_enabled',
  followingList: 'following_list',
  followingCount: 'following_count',
  followingListUpdatedAt: 'following_list_updated_at',

  isGroupsEnabled: 'is_groups_enabled',
} as const;

export type KeyType = (typeof Key)[keyof typeof Key];
export type ValueType = ValueTypeMap[KeyType];

export type BlockedPostsLog = Record<string, number>; // { "2025-12-15": 42 }

export type ValueTypeMap = {
  [Key.isFriendFocus]: boolean;
  [Key.friendList]: FriendInfo[];
  [Key.friendCount]: number;
  [Key.friendListUpdatedAt]: number | null;
  [Key.blockedPostsLog]: BlockedPostsLog;
  [Key.isFollowingsEnabled]: boolean;
  [Key.isGroupsEnabled]: boolean;
  [Key.followingList]: FollowingInfo[];
  [Key.followingCount]: number;
  [Key.followingListUpdatedAt]: number | null;
};

void (0 as any as ValueTypeMap satisfies Record<KeyType, unknown>);

// onChange handler registry
type Handler<K extends KeyType> = (value: ValueTypeMap[K] | undefined) => void;
const handlers: Partial<Record<KeyType, Handler<any>>> = {};

chrome.storage.local.onChanged.addListener((changes) => {
  Object.entries(changes).forEach(([key, change]) => {
    const handler = handlers[key as KeyType];
    if (!handler) return;
    handler(change.newValue as ValueTypeMap[KeyType] | undefined);
  });
});

// Read-only storage access (safe for popup and content scripts)
export const storage = {
  key: Key,
  get: async <K extends KeyType>(
    key: K
  ): Promise<ValueTypeMap[K] | undefined> => {
    const val = await chrome.storage.local.get(key);
    return val[key] as ValueTypeMap[K] | undefined;
  },
  onChange: <K extends KeyType>(
    key: K,
    callback: (value: ValueTypeMap[K] | undefined) => void
  ) => {
    handlers[key] = callback;
  },
};

export default storage;
