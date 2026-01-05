import {
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Edit,
  Heart,
  RefreshCw,
  Shield,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { usePopupStore } from '../store/usePopupStore';
import { Header } from '../components/Header';
import { LAST_FIXES, LINKS } from '@/common/constants';

export const DashboardView = () => {
  const {
    isFriendFocus,
    toggleFriendFocus,
    blockedToday,
    friendCount,
    friendListUpdatedAt,
    buildFriendList,
    isFollowingsEnabled,
    toggleFollowings,
    followingCount,
    buildFollowingsList,
    isGroupsEnabled,
    toggleGroups,
    groupCount,
    buildGroupList,
  } = usePopupStore();

  const getUpdateText = (timestamp: number | null) => {
    if (!timestamp) return '';
    const daysAgo = Math.floor(
      (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
    );
    return daysAgo === 0 ? 'Updated recently' : `Updated ${daysAgo}d ago`;
  };

  const needsFriendListUpdate = () => {
    return (
      !friendListUpdatedAt ||
      friendListUpdatedAt < LAST_FIXES.FRIEND_LIST.timestamp
    );
  };

  const formatCount = (count: number | null) => (count === null ? '-' : count);

  const handleToggleFollowings = () => {
    if (followingCount) {
      toggleFollowings();
    } else {
      buildFollowingsList({ enableWhenDone: true });
    }
  };

  const handleToggleGroups = () => {
    if (groupCount) {
      toggleGroups();
    } else {
      buildGroupList({ enableWhenDone: true });
    }
  };

  return (
    <div className='flex flex-col h-full bg-gray-50 dark:bg-slate-950 relative animate-in fade-in duration-300 transition-colors'>
      <Header />
      <div className='flex-1 px-6 py-6 flex flex-col gap-6 overflow-y-auto'>
        <div className='flex flex-col items-center text-center'>
          <button
            onClick={toggleFriendFocus}
            className={`relative w-28 h-14 rounded-full transition-all duration-300 mb-4 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
              isFriendFocus
                ? 'bg-blue-500 shadow-[0_4px_20px_rgba(34,197,94,0.4)] focus:ring-blue-300'
                : 'bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700'
            }`}
          >
            <div
              className={`absolute top-1 left-1 bg-white dark:bg-slate-200 w-12 h-12 rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${
                isFriendFocus ? 'translate-x-14' : 'translate-x-0'
              }`}
            >
              <Zap
                className={`w-6 h-6 ${
                  isFriendFocus
                    ? 'text-blue-500 fill-current'
                    : 'text-gray-300 dark:text-slate-500'
                }`}
              />
            </div>
          </button>
          <p className='text-base font-semibold text-gray-900 dark:text-slate-100 mb-3 leading-none'>
            {isFriendFocus ? 'Active' : 'Inactive'}
          </p>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              isFriendFocus
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
                : 'bg-gray-100 dark:bg-slate-900 text-gray-400 dark:text-slate-600 border border-transparent'
            }`}
          >
            <Shield className='w-3.5 h-3.5 fill-current' />
            <span className='text-[11px] font-bold leading-none'>
              {blockedToday.toLocaleString()}{' '}
              <span className='font-medium opacity-80'>blocked today</span>
            </span>
          </div>
        </div>

        <div
          className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-all duration-300 opacity-100 translate-y-0`}
        >
          <div className='divide-y divide-gray-100 dark:divide-slate-800'>
            {/* Friends row */}
            <div className='p-4 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg'>
                  <Users className='w-5 h-5' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-bold text-gray-800 dark:text-slate-200 leading-none'>
                      Friends
                    </span>
                    <span className='text-[10px] text-gray-500 dark:text-slate-400 font-bold bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded leading-none'>
                      {formatCount(friendCount ?? '-')}
                    </span>
                  </div>
                  <div className='flex items-center gap-1 mt-1'>
                    {needsFriendListUpdate() ? (
                      <>
                        <AlertTriangle className='w-3 h-3 text-amber-500' />
                        <span className='text-[10px] leading-none text-amber-600 dark:text-amber-500'>
                          {LAST_FIXES.FRIEND_LIST.message}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className='w-3 h-3 text-blue-500' />
                        <span className='text-[10px] leading-none text-gray-400 dark:text-slate-500'>
                          {getUpdateText(friendListUpdatedAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={buildFriendList}
                className='flex items-center justify-center text-gray-400 hover:text-blue-600 hover:cursor-pointer dark:hover:text-blue-400 p-2 rounded-full transition-all'
              >
                <RefreshCw className={`w-4 h-4 `} />
              </button>
            </div>

            {/* Followings row */}
            <div className='p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center w-5'>
                  <input
                    type='checkbox'
                    checked={isFollowingsEnabled}
                    onChange={handleToggleFollowings}
                    className='w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-gray-300 dark:border-slate-700 cursor-pointer'
                  />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-sm font-bold leading-none ${
                        isFollowingsEnabled
                          ? 'text-gray-800 dark:text-slate-200'
                          : 'text-gray-400 dark:text-slate-600'
                      }`}
                    >
                      Followings
                    </span>
                    <span className='text-[10px] text-gray-500 dark:text-slate-400 font-bold bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded leading-none'>
                      {formatCount(followingCount)}
                    </span>
                  </div>
                  <span className='text-[10px] text-gray-400 dark:text-slate-500 block mt-1 leading-none'>
                    Pages & People you follow
                  </span>
                </div>
              </div>
              <button
                onClick={() => buildFollowingsList()}
                className={`flex items-center justify-center p-2 rounded-full transition-all text-gray-400 hover:text-blue-600 hover:cursor-pointer`}
              >
                <Edit className={`w-4 h-4`} />
              </button>
            </div>

            {/* Groups row */}
            <div className='p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center w-5'>
                  <input
                    type='checkbox'
                    checked={isGroupsEnabled && groupCount > 0}
                    onChange={handleToggleGroups}
                    className='w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-gray-300 dark:border-slate-700 cursor-pointer'
                  />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-sm font-bold leading-none ${
                        isGroupsEnabled && groupCount > 0
                          ? 'text-gray-800 dark:text-slate-200'
                          : 'text-gray-400 dark:text-slate-600'
                      }`}
                    >
                      Groups
                    </span>
                    <span className='text-[10px] text-gray-500 dark:text-slate-400 font-bold bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded leading-none'>
                      {formatCount(groupCount)}
                    </span>
                  </div>
                  <span className='text-[10px] text-gray-400 dark:text-slate-500 block mt-1 leading-none'>
                    Posts from your groups
                  </span>
                </div>
              </div>
              <button
                onClick={() => buildGroupList()}
                className={`flex items-center justify-center p-2 rounded-full transition-all text-gray-400 hover:text-blue-600 hover:cursor-pointer`}
              >
                <Edit className={`w-4 h-4`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Interaction Footer */}
      <div className='relative bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 py-3 px-4 transition-colors group h-14 overflow-hidden'>
        <div className='flex items-center justify-center h-full transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 group-hover:pointer-events-none'>
          <div className='flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-slate-400 font-medium leading-none'>
            <Heart className='w-3 h-3 text-red-500 fill-current' />
            <span>Enjoying the silence?</span>
          </div>
        </div>

        <div className='absolute inset-0 flex items-center justify-center gap-3 opacity-0 scale-95 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto px-4'>
          <a
            href={LINKS.GIVE_A_REVIEW}
            target='_blank'
            rel='noreferrer'
            className='flex-1 max-w-[140px] flex items-center justify-center gap-2 py-2 rounded-full text-[11px] font-bold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-white/5 hover:bg-[#0866FF] dark:hover:bg-blue-700 hover:text-white dark:hover:text-white hover:scale-105 hover:shadow-md transition-all leading-none border border-transparent dark:border-white/10 group/btn'
          >
            <Star className='w-3.5 h-3.5 text-gray-400 dark:text-slate-500 group-hover/btn:text-white group-hover/btn:fill-current transition-colors' />
            <span>Give a Review</span>
          </a>

          <a
            href={LINKS.BUY_ME_A_COFFEE}
            target='_blank'
            rel='noreferrer'
            className='flex-1 max-w-[140px] flex items-center justify-center gap-2 py-2 rounded-full text-[11px] font-bold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-white/5 hover:bg-[#FFDD00] dark:hover:bg-yellow-700 hover:text-black dark:hover:text-white hover:scale-105 hover:shadow-md transition-all leading-none border border-transparent dark:border-white/10 group/btn'
          >
            <Coffee className='w-3.5 h-3.5 text-gray-400 dark:text-slate-500 group-hover/btn:text-black dark:group-hover/btn:text-white transition-colors' />
            <span>Buy me a coffee</span>
          </a>
        </div>
      </div>
    </div>
  );
};
