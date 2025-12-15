import type { FriendInfo } from '@/common/storage';

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
};

// Helper type to extract keys
export type MessageType = keyof MessageContract;
