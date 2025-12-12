export const InitializingView = () => {
  return (
    <div className='flex flex-col h-full bg-white items-center justify-center z-50'>
      <div className='relative flex items-center justify-center'>
        {/* The Breathing Pulse Effect */}
        <div className='absolute w-24 h-24 bg-blue-100 rounded-full animate-ping opacity-75'></div>
        <div className='relative bg-white p-2 rounded-full'>
          {/* <ShieldCheck className='w-16 h-16 text-blue-600 animate-pulse duration-1000' /> */}
          <img
            src='/icon.svg'
            alt='FriendFocus icon'
            className='w-20 h-20 text-blue-600 animate-pulse duration-1000'
          />
        </div>
      </div>

      {/* Subtle Text */}
      <div className='mt-8 flex flex-col items-center gap-2'>
        <p className='text-xs font-semibold text-blue-600/80 tracking-widest uppercase animate-pulse'></p>
      </div>
    </div>
  );
};
