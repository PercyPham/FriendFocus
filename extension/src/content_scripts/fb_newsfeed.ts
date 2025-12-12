import storage from '@/common/storage';
import { setOnlyFriendPosts } from './services/feedposts_service';

console.log('> Loaded: fb_newsfeed.ts');

const getFriendSlugSet = async () => {
  const friendList = await storage.get(storage.key.friendList);
  if (!friendList) return new Set<string>();
  return new Set(friendList.map((friend) => friend.slug));
};

setInterval(async () => {
  const isFriendFocus = await storage.get(storage.key.isFriendFocus);
  if (!isFriendFocus) return;
  const friendSlugsSet = await getFriendSlugSet();
  setOnlyFriendPosts(!!isFriendFocus, friendSlugsSet);
  console.log('> isFriendFocus:', isFriendFocus);
}, 1000);
