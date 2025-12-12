import React from 'react';
import googleIcon from '../assests/google_icon.svg';

interface Props {
  onClick: () => void;
}

export const GoogleSignInButton: React.FC<Props> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className='flex items-center justify-center gap-3 px-6 py-2.5 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-all duration-200'
    >
      <img src={googleIcon} alt='Google' className='w-[18px] h-[18px]' />
      <span>Sign in with Google</span>
    </button>
  );
};
