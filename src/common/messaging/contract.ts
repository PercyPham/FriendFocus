export type MessageContract = {
  GET_IS_HIDE_NON_FRIEND_POSTS: {
    req: void;
    res: { isHidden: boolean };
  };

  SET_IS_HIDE_NON_FRIEND_POSTS: {
    req: { isHidden: boolean };
    res: void;
  };

  GET_FRIEND_SLUG_SET: {
    req: void;
    res: { friendSlugs: string[] };
  };

  SET_FRIEND_SLUG_SET: {
    req: { friendSlugs: string[] };
    res: void;
  };
};

// Helper type to extract keys
export type MessageType = keyof MessageContract;
