import { usePopupStore } from './store/usePopupStore';
import { DashboardView } from './views/DashboardView';
import { FirstTimeSetupView } from './views/FirstTimeSetupView';
import { useEffect } from 'react';

export default function Popup() {
  const { hasFriendList, init } = usePopupStore();

  useEffect(() => {
    init();
  }, []);

  return (
    <div className='flex items-center justify-center min-h-screen font-sans'>
      <div className='w-[360px] h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-black/5'>
        {hasFriendList ? <DashboardView /> : <FirstTimeSetupView />}
      </div>
    </div>
  );
}
