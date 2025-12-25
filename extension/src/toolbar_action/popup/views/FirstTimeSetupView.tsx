import { Users, AlertCircle, Lock } from 'lucide-react';
import { usePopupStore } from '../store/usePopupStore';

export const FirstTimeSetupView = () => {
  const { buildFriendList } = usePopupStore();

  return (
    <div className='flex flex-col h-full p-6 bg-white dark:bg-slate-900 animate-in fade-in duration-300 transition-colors'>
      <div className='flex-1 flex flex-col items-center justify-center text-center'>
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400`}
        >
          <Users className='w-8 h-8' />
        </div>

        <h2 className='text-xl text-gray-900 dark:text-slate-100 mb-2'>
          First Time Setup!
        </h2>

        <p className='text-sm text-gray-500 dark:text-slate-400 px-4 mb-8'>
          To filter your feed correctly, we need to identify who your friends
          are.
        </p>

        <div className='w-full mb-6 p-3 rounded-lg bg-gray-50 border border-gray-200 dark:bg-slate-800 dark:border-slate-700'>
          <div className='flex items-start gap-2.5 text-left'>
            <AlertCircle className='w-4 h-4 text-gray-500 mt-0.5 shrink-0' />
            <div>
              <p className='text-xs text-gray-900 dark:text-slate-100 mb-1'>
                What happens next:
              </p>
              <ol className='text-[11px] text-gray-500 dark:text-slate-400 space-y-1 list-decimal list-inside'>
                <li>We'll open your Facebook friends page</li>
                <li>Automatically scroll to load all friends</li>
                <li>Save friend list for filtering</li>
              </ol>
            </div>
          </div>
        </div>

        <button
          onClick={buildFriendList}
          className='w-full bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white dark:text-slate-100 font-semibold py-4 px-6 rounded-2xl shadow-md dark:shadow-none transition-all transform active:scale-95 leading-none'
        >
          Build Friend List
        </button>
      </div>

      <div className='flex items-center justify-center text-xs text-center text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg'>
        <Lock className='w-3 h-3 mr-1' />
        Data is stored locally on your device.
      </div>
    </div>
  );
};
