// Storage keys
export const Key = {
  isFriendFocus: 'is_friend_focus',
  hasFriendList: 'has_friend_list',
  friendList: 'friend_list',
  friendCount: 'friend_count',
  blockedPostsLog: 'blocked_posts_log',
} as const;

export type KeyType = (typeof Key)[keyof typeof Key];

export type BlockedPostsLog = Record<string, number>; // { "2025-12-15": 42 }

export type ValueTypeMap = {
  [Key.isFriendFocus]: boolean;
  [Key.hasFriendList]: boolean;
  [Key.friendList]: FriendInfo[];
  [Key.friendCount]: number;
  [Key.blockedPostsLog]: BlockedPostsLog;
};

// Types
export type FriendInfo = {
  slug: string;
  name: string;
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
