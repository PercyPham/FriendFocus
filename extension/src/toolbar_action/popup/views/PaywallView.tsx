import { Crown } from 'lucide-react';
import { usePopupStore } from '../store/usePopupStore';
import { Header } from '../components/Header';

export const PaywallView = () => {
  const { upgrade } = usePopupStore();

  return (
    <div className='flex flex-col h-full'>
      <Header />
      <div className='flex-1 flex flex-col items-center justify-center p-8 text-center'>
        <div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6 relative'>
          <Crown className='w-8 h-8 text-gray-400' />
        </div>

        <h2 className='text-xl font-bold text-gray-900 mb-2'>Trial Expired</h2>
        <p className='text-sm text-gray-500 mb-8 leading-relaxed'>
          You saved hours of scrolling during your trial. Upgrade now to
          continue blocking ads and seeing only your friends.
        </p>

        <button
          onClick={upgrade}
          className='w-full bg-linear-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-bold py-3 px-4 rounded-xl shadow-xl transform transition-all hover:scale-[1.02]'
        >
          Unlock Full Access
        </button>
      </div>
    </div>
  );
};
