export const Key = {
  isFriendFocus: 'is_friend_focus',
  hasFriendList: 'has_friend_list',
  friendList: 'friend_list',
} as const;

type KeyType = (typeof Key)[keyof typeof Key];

type LocationType = 'local' | 'sync';

const KeyLocationMap: Record<KeyType, LocationType> = {
  [Key.isFriendFocus]: 'sync',
  [Key.hasFriendList]: 'sync',
  [Key.friendList]: 'local',
};

type FriendInfo = {
  slug: string;
  name: string;
};

type ValueTypeMap = {
  [Key.isFriendFocus]: boolean;
  [Key.hasFriendList]: boolean;
  [Key.friendList]: FriendInfo[];
};

void (0 as any as ValueTypeMap satisfies Record<KeyType, unknown>);

type Handler<K extends KeyType> = (value: ValueTypeMap[K] | undefined) => void;
const handlers: Partial<Record<KeyType, Handler<any>>> = {};

['local', 'sync'].forEach((location) => {
  chrome.storage[location as LocationType].onChanged.addListener((changes) => {
    Object.entries(changes).forEach(([key, change]) => {
      const keyLocation = KeyLocationMap[key as KeyType];
      if (keyLocation !== location) return;
      const handler = handlers[key as KeyType];
      if (!handler) return;
      handler(change.newValue as ValueTypeMap[KeyType] | undefined);
    });
  });
});

export default {
  key: Key,
  get: async <K extends KeyType>(
    key: K
  ): Promise<ValueTypeMap[K] | undefined> => {
    const location = KeyLocationMap[key];
    const val = await chrome.storage[location].get(key);
    return val[key] as ValueTypeMap[K] | undefined;
  },
  set: async <K extends KeyType>(key: K, value: ValueTypeMap[K]) => {
    const location = KeyLocationMap[key];
    await chrome.storage[location].set({ [key]: value });
  },
  onChange: <K extends KeyType>(
    key: K,
    callback: (value: ValueTypeMap[K] | undefined) => void
  ) => {
    handlers[key] = callback;
  },
};
