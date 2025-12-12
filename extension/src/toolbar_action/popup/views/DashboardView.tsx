import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  X,
  Zap,
} from 'lucide-react';
import { usePopupStore } from '../store/usePopupStore';
import { useState } from 'react';
import { Header } from '../components/Header';

export const DashboardView = () => {
  const {
    isFriendFocus,
    setIsFriendFocus,
    buildFriendList,
    friendCount,
    upgrade: onUpgrade,
  } = usePopupStore();
  const [showReviewPrompt, setShowReviewPrompt] = useState(true);

  const blockedToday = 100;

  const subscription = {
    status: 'trial',
    daysLeft: 2,
  };

  const dismissReview = () => {
    setShowReviewPrompt(false);
  };

  return (
    <div className='flex flex-col h-full bg-gray-50 relative animate-in fade-in duration-300'>
      <Header />

      {/* Main Content */}
      <div className='flex-1 p-6 flex flex-col gap-6 overflow-y-auto'>
        {/* Toggle Card */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center'>
          <div className='mb-4'>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                isFriendFocus
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              FOCUS MODE
            </span>
          </div>

          <button
            onClick={() => setIsFriendFocus(!isFriendFocus)}
            className={`relative w-28 h-14 rounded-full transition-colors duration-300 mb-4 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
              isFriendFocus
                ? 'bg-blue-500 focus:ring-blue-300'
                : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-200'
            }`}
          >
            <div
              className={`absolute top-1 left-1 bg-white w-12 h-12 rounded-full transform transition-transform duration-300 flex items-center justify-center ${
                isFriendFocus ? 'translate-x-14' : 'translate-x-0'
              }`}
            >
              <Zap
                className={`w-6 h-6 ${
                  isFriendFocus ? 'text-blue-500 fill-current' : 'text-gray-300'
                }`}
              />
            </div>
          </button>

          <p className='text-sm text-gray-500'>
            {isFriendFocus
              ? "Showing only friends' posts"
              : 'All posts visible'}
          </p>
        </div>

        {/* Stats & Data */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm'>
            <p className='text-xs text-gray-400 font-medium uppercase mb-1'>
              Blocked Today
            </p>
            <p className='text-2xl font-bold text-gray-800'>{blockedToday}</p>
          </div>
          <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm'>
            <p className='text-xs text-gray-400 font-medium uppercase mb-1'>
              Friends
            </p>
            <div className='flex items-center gap-2'>
              <p className='text-2xl font-bold text-gray-800'>{friendCount}</p>
              <button
                onClick={buildFriendList}
                className='text-indigo-500 hover:bg-indigo-50 p-1 rounded-full transition-colors'
                title='Rebuild List'
              >
                <RefreshCw className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Widget (Conditional Slide-up) */}
      {showReviewPrompt && (
        <div className='absolute bottom-16 left-4 right-4 bg-gray-900 text-white p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-10 z-20'>
          <div className='flex justify-between items-start mb-3'>
            <p className='font-medium pr-4'>
              Is Friend Focus helping you save time?
            </p>
            <button
              onClick={dismissReview}
              className='text-gray-400 hover:text-white'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
          <div className='flex gap-2'>
            <button className='flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors'>
              <ThumbsDown className='w-4 h-4' /> No
            </button>
            <button className='flex-1 bg-white text-gray-900 hover:bg-gray-100 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors'>
              <ThumbsUp className='w-4 h-4' /> Yes
            </button>
          </div>
        </div>
      )}

      {/* Footer / Trial Status */}
      <div className='bg-white border-t border-gray-100 p-3'>
        {subscription.status === 'trial' ? (
          <div className='flex items-center justify-between bg-orange-50 text-orange-800 px-3 py-2 rounded-lg text-sm'>
            <span className='font-medium flex items-center gap-2'>
              <AlertCircle className='w-4 h-4' />
              {subscription.daysLeft} days left in trial
            </span>
            <button
              onClick={onUpgrade}
              className='text-orange-600 font-bold hover:underline text-xs uppercase tracking-wide'
            >
              Upgrade
            </button>
          </div>
        ) : (
          <div className='text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-1'>
            <CheckCircle2 className='w-3 h-3 text-green-500' /> PRO Active
          </div>
        )}
      </div>
    </div>
  );
};
