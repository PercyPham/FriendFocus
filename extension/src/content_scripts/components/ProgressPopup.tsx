interface ProgressPopupProps {
  count: number;
}

export default function ProgressPopup({ count }: ProgressPopupProps) {
  return (
    <div className='fixed inset-0 bg-black/70 z-99999 flex items-center justify-center'>
      <div className='bg-white p-8 rounded-xl shadow-2xl text-center min-w-[300px]'>
        <h2 className='text-xl font-bold text-[#1877f2] mb-4'>
          Collecting Friends...
        </h2>

        <p className='text-[#65676b] text-base mb-3'>
          Keep this tab open until the process is complete.
        </p>

        <p className='text-[#65676b] text-base font-semibold'>
          Found: {count} friends
        </p>
      </div>
    </div>
  );
}
