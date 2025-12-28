import type { FriendInfo, FollowingInfo, GroupInfo } from '@/common/types';

export type MessageContract = {
  SET_FRIEND_FOCUS: {
    req: boolean;
    res: void;
  };

  START_COLLECTING_FRIEND_LIST: {
    req: void;
    res: void;
  };

  SAVE_FRIEND_LIST: {
    req: FriendInfo[];
    res: void;
  };

  CLOSE_TAB: {
    req: void;
    res: void;
  };

  INCREMENT_TODAY_BLOCKED_POSTS_COUNT: {
    req: number;
    res: void;
  };

  SET_FOLLOWINGS_ENABLED: {
    req: boolean;
    res: void;
  };

  START_COLLECTING_FOLLOWING_LIST: {
    req: { enableWhenDone?: boolean } | undefined;
    res: void;
  };

  SAVE_FOLLOWING_LIST: {
    req: FollowingInfo[];
    res: void;
  };

  SET_GROUPS_ENABLED: {
    req: boolean;
    res: void;
  };

  START_COLLECTING_GROUP_LIST: {
    req: { enableWhenDone?: boolean } | undefined;
    res: void;
  };

  SAVE_GROUP_LIST: {
    req: GroupInfo[];
    res: void;
  };
};

export type MessageType = keyof MessageContract;

export const MESSAGE_TYPES = [
  'SET_FRIEND_FOCUS',
  'START_COLLECTING_FRIEND_LIST',
  'SAVE_FRIEND_LIST',
  'CLOSE_TAB',
  'INCREMENT_TODAY_BLOCKED_POSTS_COUNT',
  'SET_FOLLOWINGS_ENABLED',
  'START_COLLECTING_FOLLOWING_LIST',
  'SAVE_FOLLOWING_LIST',
  'SET_GROUPS_ENABLED',
  'START_COLLECTING_GROUP_LIST',
  'SAVE_GROUP_LIST',
] as const satisfies MessageType[];

void (0 as any as (typeof MESSAGE_TYPES)[number] satisfies keyof MessageContract);
void (0 as any as MessageType satisfies (typeof MESSAGE_TYPES)[number]);
