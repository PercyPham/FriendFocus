import { useState, useEffect } from 'react';

interface ManualSelectionUIProps {
  onConfirm: () => void;
  onCancel: () => void;
  getSelectedCount: () => number;
  clearAllSelections: () => void;
}

export default function ManualSelectionUI({
  onConfirm,
  onCancel,
  getSelectedCount,
  clearAllSelections,
}: ManualSelectionUIProps) {
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    // Use the provided function to get the actual count from the Map
    const updateCount = () => {
      setSelectedCount(getSelectedCount());
    };

    // Initial count
    updateCount();

    // Listen for custom events from group buttons
    const handleSelection = () => updateCount();
    window.addEventListener('friendfocus-selection-changed', handleSelection);

    return () => {
      window.removeEventListener(
        'friendfocus-selection-changed',
        handleSelection
      );
    };
  }, [getSelectedCount]);

  const handleClearAll = () => {
    // Clear the global Map directly
    clearAllSelections();

    // Dispatch event to update the count
    window.dispatchEvent(new CustomEvent('friendfocus-selection-changed'));
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className='fixed bottom-0 left-0 right-0 z-99999 bg-white border-t-2 border-fb-blue shadow-lg'>
      <div className='max-w-4xl mx-auto px-6 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='bg-fb-blue text-white font-bold text-lg rounded-full w-10 h-10 flex items-center justify-center'>
            {selectedCount}
          </div>
          <div>
            <p className='text-sm font-bold text-gray-900'>
              {selectedCount === 0
                ? 'No groups selected'
                : `${selectedCount} ${
                    selectedCount === 1 ? 'group' : 'groups'
                  } selected`}
            </p>
            <p className='text-xs text-fb-gray'>
              Click the + button next to items to add them
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {selectedCount > 0 && (
            <button
              onClick={handleClearAll}
              className='font-medium py-3 px-6 rounded-lg transition-all duration-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 border border-gray-300'
            >
              Clear All
            </button>
          )}
          <button
            onClick={onCancel}
            className='font-medium py-3 px-6 rounded-lg transition-all duration-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 border border-gray-300'
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            className={`font-bold py-3 px-8 rounded-lg transition-all duration-200 ${
              selectedCount === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-fb-blue hover:bg-fb-blue-hover text-white shadow-md hover:shadow-lg'
            }`}
          >
            Save {selectedCount > 0 ? `${selectedCount} ` : ''}
            {selectedCount === 1 ? 'Group' : 'Groups'}
          </button>
        </div>
      </div>
    </div>
  );
}

