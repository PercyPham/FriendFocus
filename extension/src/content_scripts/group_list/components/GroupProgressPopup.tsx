import { useEffect, useState } from "react";

interface GroupProgressPopupProps {
  count: number;
}

export default function GroupProgressPopup({ count }: GroupProgressPopupProps) {
  const [showAdblockerWarning, setShowAdblockerWarning] = useState(false);

  useEffect(() => {
    setShowAdblockerWarning(count === 0);
  }, [count]);

  return (
    <div className="fixed inset-0 bg-black/70 z-99999 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center min-w-[300px]">
        <h2 className="text-xl font-bold text-fb-blue mb-4">Collecting Group List…</h2>

        <p className="text-fb-gray text-base mb-3">
          <b>Please keep this tab open</b> while your group list is being collected.
        </p>

        <p className="text-fb-gray text-base font-semibold">Groups found: {count}</p>

        {showAdblockerWarning && (
          <p className="text-fb-gray text-sx italic mb-3">
            If the count remains at 0, please temporarily disable your ad-blocker and try again. You can turn it back on
            once the collection is complete.
          </p>
        )}
      </div>
    </div>
  );
}
