import { useEffect, useState } from 'react';

interface ProgressPopupProps {
  count: number;
}

export default function ProgressPopup({ count }: ProgressPopupProps) {
  const [showAdblockerWarning, setShowAdblockerWarning] = useState(false);

  useEffect(() => {
    setShowAdblockerWarning(count === 0);
  }, [count]);

  return (
    <div className='fixed inset-0 bg-black/70 z-99999 flex items-center justify-center'>
      <div className='bg-white p-8 rounded-xl shadow-2xl text-center min-w-[300px]'>
        <h2 className='text-xl font-bold text-[#1877f2] mb-4'>
          Updating Friend List…
        </h2>

        <p className='text-[#65676b] text-base mb-3'>
          Please keep this tab open while your friend list is being updated.
        </p>

        <p className='text-[#65676b] text-base font-semibold'>
          Friends found: {count}
        </p>

        {showAdblockerWarning && (
          <p className='text-[#65676b] text-sx italic mb-3'>
            If the count remains at 0, please temporarily disable your
            ad-blocker and try again. You can turn it back on once the update is
            complete.
          </p>
        )}
      </div>
    </div>
  );
}
