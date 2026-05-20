interface ModeSelectionPopupProps {
  onSelectMode: (mode: 'auto' | 'manual') => void;
}

export default function ModeSelectionPopup({
  onSelectMode,
}: ModeSelectionPopupProps) {
  return (
    <div className='fixed inset-0 bg-black/70 z-99999 flex items-center justify-center'>
      <div className='bg-white p-8 rounded-xl shadow-2xl text-center max-w-md'>
        <h2 className='text-2xl font-bold text-fb-blue mb-4'>
          Collect Following List
        </h2>

        <p className='text-sm text-fb-gray mb-6'>
          Choose how you'd like to collect your followings:
        </p>

        <div className='flex flex-col gap-3'>
          <button
            onClick={() => onSelectMode('manual')}
            className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer'
          >
            Manual Select
          </button>

          <button
            onClick={() => onSelectMode('auto')}
            className='bg-white hover:bg-gray-200 text-fb-blue font-bold py-3 px-6 rounded-lg border-2 border-fb-blue transition-colors duration-200 cursor-pointer'
          >
            Collect All
          </button>
        </div>

        <p className='text-xs text-fb-gray mt-4'>
          Collect All will automatically collect all your followings.
          <br />
          Manual Select lets you choose specific followings.
        </p>
      </div>
    </div>
  );
}
