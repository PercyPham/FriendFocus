interface UpdateFriendListPopupProps {
  onStart: () => void;
}

export default function UpdateFriendListPopup({
  onStart,
}: UpdateFriendListPopupProps) {
  return (
    <div className='fixed inset-0 bg-black/70 z-99999 flex items-center justify-center'>
      <div className='bg-white p-8 rounded-xl shadow-2xl text-center max-w-md'>
        <h2 className='text-2xl font-bold text-[#1877f2] mb-4'>
          Update Friend List
        </h2>

        <p className='text-sm text-[#65676b] mb-5'>
          Keep this tab open until the process is complete.
        </p>

        <p className='text-sm text-[#65676b] mb-6'>
          Click the button below to start collecting your friends list.
        </p>

        <button
          onClick={onStart}
          className='bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200'
        >
          Update Friend List
        </button>
      </div>
    </div>
  );
}
