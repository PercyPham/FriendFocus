interface Props {
  enabled: boolean;
  onChange: () => void;
}

export function FriendFocusToggle({ enabled, onChange }: Props) {
  return (
    <div className='flex flex-col items-center justify-center px-5 py-8'>
      <p className='text-[13px] text-muted-foreground mb-4'>Friend Focus</p>

      <button
        onClick={onChange}
        className={`relative inline-flex h-14 w-28 items-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          enabled ? 'bg-primary' : 'bg-switch-background'
        }`}
        role='switch'
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-md transition-transform ${
            enabled ? 'translate-x-18' : 'translate-x-2'
          }`}
        />
      </button>

      <p className='text-[15px] mt-4'>{enabled ? 'On' : 'Off'}</p>
      <p className='text-[12px] text-muted-foreground mt-1'>
        {enabled ? "Showing only friends' posts" : 'All posts visible'}
      </p>
    </div>
  );
}
