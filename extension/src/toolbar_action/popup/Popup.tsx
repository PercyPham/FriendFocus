import { usePopupStore } from './store/usePopupStore';
import { DashboardView } from './views/DashboardView';
import { FirstTimeSetupView } from './views/FirstTimeSetupView';
import { useEffect } from 'react';

export default function Popup() {
  const { friendCount, init } = usePopupStore();

  useEffect(() => {
    init();
  }, []);

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-200 dark:bg-slate-950 font-sans'>
      <div className='w-[360px] h-[530px] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-black/5 transition-colors'>
        {friendCount ? <DashboardView /> : <FirstTimeSetupView />}
      </div>
    </div>
  );
}
