interface UpdateFriendListPopupProps {
  onStart: () => void;
  onCancel: () => void;
}

export default function UpdateFriendListPopup({ onStart, onCancel }: UpdateFriendListPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/70 z-99999 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md">
        <h2 className="text-2xl font-bold text-fb-blue mb-4">Update Friend List</h2>

        <p className="text-sm text-fb-gray mb-5">
          <b>Please keep this tab open</b> while we update your data in the background.
        </p>

        {/* <p className="text-sm text-fb-gray mb-6">Click the button below to start updating your friend list.</p> */}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onCancel}
            className="font-medium py-3 px-6 rounded-lg transition-colors duration-200 bg-white hover:bg-gray-50 text-gray-600 border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            className="bg-fb-blue hover:bg-fb-blue-hover text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Start Update Friend List
          </button>
        </div>
      </div>
    </div>
  );
}
