import { Users, AlertCircle, Lock, Download } from "lucide-react";
import { useRef, useState } from "react";
import { usePopupStore } from "../store/usePopupStore";
import { importData } from "../utils/data-transfer";

export const FirstTimeSetupView = () => {
  const { buildFriendList } = usePopupStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImportError(null);
    try {
      await importData(file);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed.");
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white dark:bg-slate-900 animate-in fade-in duration-300 transition-colors">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400`}
        >
          <Users className="w-8 h-8" />
        </div>

        <h2 className="text-xl text-gray-900 dark:text-slate-100 mb-2">Set Up Friend Filtering</h2>

        <p className="text-sm text-gray-500 dark:text-slate-400 px-4 mb-8">
          To filter your feed, we need to scan and save your Facebook friends list.
        </p>

        <div className="w-full mb-6 p-3 rounded-lg bg-gray-50 border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-start gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-900 dark:text-slate-100 mb-1">Here's what happens:</p>
              <ol className="text-[11px] text-gray-500 dark:text-slate-400 space-y-1 list-decimal list-inside">
                <li>We open your Facebook friends page</li>
                <li>Scroll through to load your friends list</li>
                <li>Save it locally to your device</li>
              </ol>
            </div>
          </div>
        </div>

        <button
          onClick={buildFriendList}
          className="w-full bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white dark:text-slate-100 font-semibold py-4 px-6 rounded-2xl shadow-md dark:shadow-none transition-all transform active:scale-95 leading-none"
        >
          Build My Friend List
        </button>

        <div className="w-full mt-4">
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          <p className="text-xs text-gray-400 dark:text-slate-500 text-center mb-2">Already have a backup?</p>
          <button
            onClick={handleImportClick}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium py-3 px-6 rounded-2xl transition-all active:scale-95 leading-none text-sm"
          >
            <Download className="w-4 h-4" />
            Import Backup
          </button>
          {importError && <p className="mt-2 text-xs text-red-500 dark:text-red-400 text-center">{importError}</p>}
        </div>
      </div>

      <div className="flex items-center justify-center text-xs text-center text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
        <Lock className="w-3 h-3 mr-1" />
        Your data never leaves your device.
      </div>
    </div>
  );
};
