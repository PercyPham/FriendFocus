import { APP_VERSION, LINKS } from "@/common/constants";
import { Github, ExternalLink, Settings, HelpCircle, Download, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { exportData, importData } from "../utils/data-transfer";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showStatus = (text: string, ok: boolean) => {
    setStatusMessage({ text, ok });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExport = async () => {
    setIsMenuOpen(false);
    try {
      await exportData();
    } catch {
      showStatus("Export failed.", false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsMenuOpen(false);
    try {
      await importData(file);
      showStatus("Data imported successfully.", true);
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Import failed.", false);
    }
  };

  const MenuRow = ({ icon: Icon, label, onClick, extra, isLink = false, href }: any) => (
    <a
      onClick={onClick}
      href={href}
      target={isLink ? "_blank" : undefined}
      className="w-full flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-left group cursor-pointer"
    >
      <div className="flex items-center gap-3 text-gray-700 dark:text-slate-200">
        <div className="flex items-center justify-center w-5">
          <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400" />
        </div>
        <span className="text-sm font-medium leading-none">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {extra && <span className="text-xs text-gray-400 font-normal leading-none">{extra}</span>}
        <div className="flex items-center justify-center w-4">
          {isLink ? (
            <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400" />
          ) : (
            <></>
          )}
        </div>
      </div>
    </a>
  );

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-20 transition-colors">
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
      {statusMessage && (
        <div
          className={`px-6 py-2 text-xs font-medium text-center ${
            statusMessage.ok
              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {statusMessage.text}
        </div>
      )}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center bg-blue-600 p-1.5 rounded-lg">
            <img src="/icon.svg" alt="Friend Focus icon" className="w-6 h-6" />
          </div>
          <span className="text-base font-bold text-gray-800 dark:text-slate-100 tracking-tight leading-none">
            Friend Focus
          </span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors p-1.5 rounded-md ${
              isMenuOpen ? "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-200" : ""
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 z-30 p-1.5">
              <>
                <MenuRow icon={HelpCircle} label="FAQ" isLink href={LINKS.FAQ} />
                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1" />
                <MenuRow icon={Github} label="Feedback & Bug Report" isLink href={LINKS.GITHUB_ISSUES} />
                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1" />
                <MenuRow icon={Download} label="Import Data" onClick={handleImportClick} />
                <MenuRow icon={Upload} label="Export Data" onClick={handleExport} />
                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1" />
                <button className="w-full text-center py-2 text-xs text-gray-400 dark:text-slate-400 font-medium tracking-widest leading-none">
                  v{APP_VERSION}
                </button>
              </>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
