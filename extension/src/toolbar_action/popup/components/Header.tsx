import { Settings } from 'lucide-react';
import { usePopupStore } from '../store/usePopupStore';

export const Header = () => {
  const { user } = usePopupStore();
  return (
    <div className='flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10'>
      <div className='flex items-center justify-center gap-2'>
        <img src='/icon.svg' alt='FriendFocus icon' className='w-6 h-6' />
        <span className='text-base text-gray-800 tracking-tight'>
          Friend Focus
        </span>
      </div>
      {user && (
        <button
          onClick={() => {}}
          className='text-gray-400 hover:text-gray-600 transition-colors'
          title='Reset Demo'
        >
          <Settings className='w-5 h-5' />
        </button>
      )}
    </div>
  );
};
