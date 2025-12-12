import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { usePopupStore } from '../store/usePopupStore';

export const LoginView = () => {
  const { loginWithGoogle } = usePopupStore();

  return (
    <div className='flex flex-col h-full p-8 bg-white text-center justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6'>
        <img
          src='/icon.svg'
          alt='FriendFocus icon'
          className='w-full h-full object-contain'
        />
      </div>

      <h2 className='text-2xl font-bold text-gray-900 mb-2'>
        Welcome to Friend Focus
      </h2>
      <p className='text-[13px] text-muted-foreground mb-6 max-w-[240px]'>
        Sign in with Google to start filtering your Facebook feed
      </p>

      <GoogleSignInButton onClick={loginWithGoogle} />

      <p className='mt-6 text-xs text-gray-400'>
        Secure login via Google Authentication
      </p>
    </div>
  );
};
