import type { ExportData } from '@/common/types';
import storage from '@/common/storage';
import { sendMessage } from '@/common/background_contract/client';

export async function exportData(): Promise<void> {
  const [
    isFriendFocus,
    isStatusIndicatorVisible,
    friendList,
    friendListUpdatedAt,
    followingList,
    followingListUpdatedAt,
    isFollowingsEnabled,
    groupList,
    groupListUpdatedAt,
    isGroupsEnabled,
  ] = await Promise.all([
    storage.get(storage.key.isFriendFocus),
    storage.get(storage.key.isStatusIndicatorVisible),
    storage.get(storage.key.friendList),
    storage.get(storage.key.friendListUpdatedAt),
    storage.get(storage.key.followingList),
    storage.get(storage.key.followingListUpdatedAt),
    storage.get(storage.key.isFollowingsEnabled),
    storage.get(storage.key.groupList),
    storage.get(storage.key.groupListUpdatedAt),
    storage.get(storage.key.isGroupsEnabled),
  ]);

  const data: ExportData = {
    version: 1,
    exportedAt: Date.now(),
    isFriendFocus: isFriendFocus ?? false,
    isStatusIndicatorVisible: isStatusIndicatorVisible ?? true,
    friendList: friendList ?? [],
    friendListUpdatedAt: friendListUpdatedAt ?? null,
    followingList: followingList ?? [],
    followingListUpdatedAt: followingListUpdatedAt ?? null,
    isFollowingsEnabled: isFollowingsEnabled ?? false,
    groupList: groupList ?? [],
    groupListUpdatedAt: groupListUpdatedAt ?? null,
    isGroupsEnabled: isGroupsEnabled ?? false,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'friendfocus-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<void> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (
    parsed.version !== 1 ||
    !Array.isArray(parsed.friendList) ||
    !Array.isArray(parsed.followingList) ||
    !Array.isArray(parsed.groupList)
  ) {
    throw new Error('Invalid backup file format.');
  }

  await sendMessage('IMPORT_DATA', parsed as ExportData);
}
