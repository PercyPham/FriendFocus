export type MessageContract = {
  SET_FRIEND_FOCUS: {
    req: boolean;
    res: void;
  };

  START_COLLECTING_FRIEND_LIST: {
    req: void;
    res: void;
  };

  CLOSE_TAB: {
    req: void;
    res: void;
  };
};

// Helper type to extract keys
export type MessageType = keyof MessageContract;
