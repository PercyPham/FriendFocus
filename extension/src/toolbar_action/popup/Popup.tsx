import { useEffect } from 'react';
import { usePopupStore } from './store/usePopupStore';
import { DashboardView } from './views/DashboardView';
import { LoginView } from './views/LoginView';
import { InitializingView } from './views/InitializingView';
import { FirstTimeSetupView } from './views/FirstTimeSetupView';
import { PaywallView } from './views/PaywallView';

const test = false;

export default function Popup() {
  const { user, isInitializing, initialize, hasFriendList } = usePopupStore();
  console.log('User in Popup:', user);

  useEffect(() => {
    initialize();
  }, []);

  if (test) {
    return (
      <div className='flex items-center justify-center min-h-screen font-sans'>
        <div className='w-[360px] h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-black/5'>
          <PaywallView />
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center min-h-screen font-sans'>
      <div className='w-[360px] h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-black/5'>
        {isInitializing ? (
          <InitializingView />
        ) : user ? (
          hasFriendList ? (
            <DashboardView />
          ) : (
            <FirstTimeSetupView />
          )
        ) : (
          <LoginView />
        )}
      </div>
    </div>
  );
}
