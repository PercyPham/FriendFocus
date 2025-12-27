// Types
export type FriendInfo = {
  slug: string;
  name: string;
};

export type FollowingInfo = {
  slug: string;
  name: string;
  type: 'person' | 'page' | 'public_figure';
};
