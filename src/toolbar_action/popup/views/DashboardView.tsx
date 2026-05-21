import {
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Edit,
  Eye,
  EyeOff,
  Heart,
  Shield,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { usePopupStore } from '../store/usePopupStore';
import { Header } from '../components/Header';
import { APP_VERSION, LAST_FIXES, LINKS } from '@/common/constants';

export const DashboardView = () => {
  const {
    isFriendFocus,
    toggleFriendFocus,
    blockedToday,
    isStatusIndicatorVisible,
    toggleStatusIndicatorVisibility,
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
    return daysAgo === 0 ? 'Just updated' : `Updated ${daysAgo}d ago`;
  };

  const needsFriendListUpdate = () => {
    return (
      !friendListUpdatedAt ||
      friendListUpdatedAt < LAST_FIXES.FRIEND_LIST.timestamp
    );
  };

  const formatCount = (count: number | null) => (count === null ? '-' : count);

  return (
    <div className='flex flex-col h-full bg-gray-50 dark:bg-slate-950 relative animate-in fade-in duration-300 transition-colors'>
      <Header />

      <div className='flex-1 px-6 py-6 flex flex-col gap-5 overflow-y-auto'>
        {/* Compact Status Card */}
        <div className='flex flex-col items-center text-center'>
          <button
            onClick={toggleFriendFocus}
            className={`relative w-28 h-14 rounded-full transition-all duration-300 mb-4 focus:outline-none focus:ring-4 focus:ring-offset-2 cursor-pointer select-none ${
              isFriendFocus
                ? 'bg-blue-500 shadow-[0_4px_20px_rgba(59,130,246,0.4)] focus:ring-blue-300'
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
                : 'bg-gray-100 dark:bg-slate-900 text-gray-400 dark:text-slate-400 border border-transparent'
            }`}
          >
            <Shield className='w-3.5 h-3.5 fill-current' />
            <span className='text-[11px] font-bold leading-none'>
              {blockedToday.toLocaleString()}{' '}
              <span className='font-medium opacity-80'>blocked today</span>
            </span>
          </div>
        </div>

        {/* Combined Settings Card */}
        <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden shrink-0'>
          {/* Section: Sources */}
          <div className='px-4 py-2 bg-gray-50/50 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800'>
            <span className='text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest'>
              Content Sources
            </span>
          </div>

          <div className='divide-y divide-gray-100 dark:divide-slate-800'>
            {/* Friends Row */}
            <div className='px-4 py-3 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1.5 rounded-lg'>
                  <Users className='w-4 h-4' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-bold text-gray-800 dark:text-slate-200 leading-none select-none'>
                      Friends
                    </span>
                    <span className='text-[10px] text-gray-500 dark:text-slate-400 font-bold bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded leading-none select-none'>
                      {formatCount(friendCount)}
                    </span>
                  </div>
                  <div className='flex items-center gap-1 mt-1'>
                    {needsFriendListUpdate() ? (
                      <>
                        <AlertTriangle className='w-2.5 h-2.5 text-amber-500' />
                        <span className='text-[10px] leading-none text-amber-600 dark:text-amber-500 font-medium select-none'>
                          {LAST_FIXES.FRIEND_LIST.message}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className='w-2.5 h-2.5 text-blue-500' />
                        <span className='text-[10px] leading-none text-gray-400 dark:text-slate-400'>
                          {getUpdateText(friendListUpdatedAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={buildFriendList}
                className='text-gray-400 hover:text-blue-600 transition-colors p-1.5 cursor-pointer select-none'
              >
                <Edit className='w-3.5 h-3.5' />
              </button>
            </div>

            {/* Followings Row */}
            <div className='px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors'>
              <div
                className='flex items-center gap-3 cursor-pointer select-none'
                onClick={toggleFollowings}
              >
                <div className='w-4 flex justify-center'>
                  <input
                    type='checkbox'
                    checked={isFollowingsEnabled}
                    readOnly
                    className='w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-gray-300 dark:border-slate-700 cursor-pointer'
                  />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-xs font-bold leading-none ${
                        isFollowingsEnabled
                          ? 'text-gray-800 dark:text-slate-200'
                          : 'text-gray-400 dark:text-slate-400'
                      }`}
                    >
                      Followings
                    </span>
                    <span className='text-[10px] text-gray-500 dark:text-slate-400 font-bold bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded leading-none'>
                      {formatCount(followingCount)}
                    </span>
                  </div>
                  <span className='text-[10px] text-gray-400 dark:text-slate-400 block mt-0.5 leading-none'>
                    Pages & accounts you follow
                  </span>
                </div>
              </div>
              <button
                onClick={() => buildFollowingsList()}
                className='text-gray-400 hover:text-blue-600 p-1.5 cursor-pointer select-none'
              >
                <Edit className='w-3.5 h-3.5' />
              </button>
            </div>

            {/* Groups Row */}
            <div className='px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors'>
              <div
                className='flex items-center gap-3 cursor-pointer select-none'
                onClick={toggleGroups}
              >
                <div className='w-4 flex justify-center'>
                  <input
                    type='checkbox'
                    checked={isGroupsEnabled}
                    readOnly
                    className='w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-gray-300 dark:border-slate-700 cursor-pointer'
                  />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-xs font-bold leading-none ${
                        isGroupsEnabled
                          ? 'text-gray-800 dark:text-slate-200'
                          : 'text-gray-400 dark:text-slate-400'
                      }`}
                    >
                      Groups
                    </span>
                    <span className='text-[10px] text-gray-500 dark:text-slate-400 font-bold bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded leading-none'>
                      {formatCount(groupCount)}
                    </span>
                  </div>
                  <span className='text-[10px] text-gray-400 dark:text-slate-400 block mt-0.5 leading-none'>
                    Posts from your joined groups
                  </span>
                </div>
              </div>
              <button
                onClick={() => buildGroupList()}
                className='text-gray-400 hover:text-blue-600 p-1.5 cursor-pointer select-none'
              >
                <Edit className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>

          {/* Section: Interface */}
          <div className='px-4 py-2 bg-gray-50/50 dark:bg-slate-800/30 border-y border-gray-100 dark:border-slate-800'>
            <span className='text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest'>
              Interface
            </span>
          </div>

          <div className='px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors'>
            <div
              className='flex items-center gap-3 cursor-pointer select-none'
              onClick={toggleStatusIndicatorVisibility}
            >
              <div className='w-4 flex justify-center'>
                <input
                  type='checkbox'
                  checked={isStatusIndicatorVisible}
                  readOnly
                  className='w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-gray-300 dark:border-slate-700 cursor-pointer'
                />
              </div>
              <div>
                <span
                  className={`text-xs font-bold leading-none block ${
                    isStatusIndicatorVisible
                      ? 'text-gray-800 dark:text-slate-200'
                      : 'text-gray-400 dark:text-slate-400'
                  }`}
                >
                  Status Indicator
                </span>
                <span className='text-[10px] text-gray-400 dark:text-slate-400 mt-0.5 block'>
                  Show a status badge on your Facebook feed
                </span>
              </div>
            </div>
            <div className='p-1.5 text-gray-400'>
              {isStatusIndicatorVisible ? (
                <Eye className='w-3.5 h-3.5' />
              ) : (
                <EyeOff className='w-3.5 h-3.5' />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Support Footer */}
      <div className='bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 py-4 px-6 transition-colors mt-auto shrink-0'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-[11px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider'>
            <Heart className='w-3.5 h-3.5 text-red-500 fill-current' />
            <span>v{APP_VERSION}</span>
          </div>

          <div className='flex items-center gap-4'>
            <a
              href={LINKS.GIVE_A_REVIEW}
              target='_blank'
              className='flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-fb-blue-alt transition-all group'
            >
              <Star className='w-4 h-4 group-hover:fill-current' />
              <span>Review</span>
            </a>
            <div className='w-px h-4 bg-gray-200 dark:bg-slate-800' />
            <a
              href={LINKS.BUY_ME_A_COFFEE}
              target='_blank'
              className='flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-bmc-yellow transition-all group'
            >
              <Coffee className='w-4 h-4' />
              <span>Donate</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
