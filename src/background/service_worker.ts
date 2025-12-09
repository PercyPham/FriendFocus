import { storageRepo } from '@/background/storage';
import { onMessage, setupMessageListener } from '../common/messaging/server';

//Register Handlers (Types are inferred automatically!)
onMessage('GET_IS_HIDE_NON_FRIEND_POSTS', async (_req, sender) => {
  console.log('Received request from tab:', sender.tab?.id);
  const { isHidden } = await storageRepo.get();
  return { isHidden };
});

onMessage(
  'SET_IS_HIDE_NON_FRIEND_POSTS',
  async ({ isHidden }: { isHidden: boolean }): Promise<void> => {
    console.log('Setting isHidden:', isHidden);
    await storageRepo.save({ isHidden });
  }
);

onMessage('GET_FRIEND_SLUG_SET', async (_req, sender) => {
  console.log('Received request from tab:', sender.tab?.id);
  const { friendSlugs } = await storageRepo.get();
  return { friendSlugs };
});

onMessage('SET_FRIEND_SLUG_SET', async ({ friendSlugs }): Promise<void> => {
  console.log('Setting friendSlugs:', friendSlugs);
  await storageRepo.save({ friendSlugs });
});

// Initialize Listener
setupMessageListener();
