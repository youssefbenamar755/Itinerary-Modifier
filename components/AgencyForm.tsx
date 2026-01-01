import React, { useState } from 'react';
import { AgencyDetails } from '../types';
import { Sparkles, Eraser, Loader2 } from 'lucide-react';
import { parseAgencyText } from '../services/geminiService';

interface AgencyFormProps {
  data: AgencyDetails;
  onChange: (data: AgencyDetails) => void;
  disabled: boolean;
}

const AgencyForm: React.FC<AgencyFormProps> = ({ data, onChange, disabled }) => {
  const [smartPasteContent, setSmartPasteContent] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [showSmartPaste, setShowSmartPaste] = useState(false);

  const handleInputChange = (field: keyof AgencyDetails, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleSmartParse = async () => {
    if (!smartPasteContent.trim()) return;
    
    setIsParsing(true);
    try {
      const parsedData = await parseAgencyText(smartPasteContent);
      if (parsedData) {
        onChange({ ...parsedData, hideTicketingWarning: data.hideTicketingWarning });
        setShowSmartPaste(false);
        setSmartPasteContent('');
      }
    } catch (e) {
      alert("Failed to parse text. Please try entering details manually.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Smart Paste Toggle & Warning Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <div className="relative flex items-center">
                <input 
                    type="checkbox" 
                    checked={data.hideTicketingWarning}
                    onChange={(e) => handleInputChange('hideTicketingWarning', e.target.checked)}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm checked:border-red-500 checked:bg-red-500 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
                <Eraser className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
            </div>
            <span className="text-sm font-medium text-slate-700">Remove "Ticketing Deadline" text</span>
        </label>

        <button
          onClick={() => setShowSmartPaste(!showSmartPaste)}
          className="text-sm font-medium text-blue-700 hover:text-blue-800 flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100 transition-colors"
          disabled={disabled}
        >
          <Sparkles className="w-4 h-4" />
          {showSmartPaste ? 'Close AI Paste' : 'AI Smart Paste'}
        </button>
      </div>

      {/* AI Paste Drawer */}
      {showSmartPaste && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-inner">
          <p className="text-xs text-blue-700 mb-2 font-semibold uppercase tracking-wide">
            Paste raw text below (e.g. email footer):
          </p>
          <textarea
            className="w-full p-3 rounded border border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white"
            rows={4}
            placeholder="My Agency, 123 Street, City, Phone..."
            value={smartPasteContent}
            onChange={(e) => setSmartPasteContent(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleSmartParse}
              disabled={isParsing || !smartPasteContent.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Auto-Fill Fields'}
            </button>
          </div>
        </div>
      )}

      {/* Visual Editor - Matches PDF Look */}
      <div className="pt-4 pb-8 pl-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">
            New Information Preview
          </p>
          
          <div className="flex flex-col items-start space-y-1 max-w-md">
            {/* Company Name - Bold */}
            <div className="w-full relative group">
                <input
                    type="text"
                    value={data.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full block bg-transparent border-none focus:ring-0 px-0 py-1 text-base font-bold text-[#1e3a8a] uppercase placeholder:text-blue-200 transition-all border-b border-transparent hover:border-slate-300 focus:border-blue-500 rounded-none"
                    placeholder="AGENCY NAME"
                    disabled={disabled}
                />
            </div>

            {/* Address Lines - Regular */}
            <input
                type="text"
                value={data.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                className="w-full block bg-transparent border-none focus:ring-0 px-0 py-0.5 text-sm font-normal text-[#1e3a8a] uppercase placeholder:text-blue-200 border-b border-transparent hover:border-slate-300 focus:border-blue-500 rounded-none"
                placeholder="ADDRESS LINE 1"
                disabled={disabled}
            />
            
            <input
                type="text"
                value={data.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                className="w-full block bg-transparent border-none focus:ring-0 px-0 py-0.5 text-sm font-normal text-[#1e3a8a] uppercase placeholder:text-blue-200 border-b border-transparent hover:border-slate-300 focus:border-blue-500 rounded-none"
                placeholder="ADDRESS LINE 2"
                disabled={disabled}
            />

            <input
                type="text"
                value={data.addressLine3}
                onChange={(e) => handleInputChange('addressLine3', e.target.value)}
                className="w-full block bg-transparent border-none focus:ring-0 px-0 py-0.5 text-sm font-normal text-[#1e3a8a] uppercase placeholder:text-blue-200 border-b border-transparent hover:border-slate-300 focus:border-blue-500 rounded-none"
                placeholder="ADDRESS LINE 3 (OPTIONAL)"
                disabled={disabled}
            />

            <input
                type="text"
                value={data.cityCountry}
                onChange={(e) => handleInputChange('cityCountry', e.target.value)}
                className="w-full block bg-transparent border-none focus:ring-0 px-0 py-0.5 text-sm font-normal text-[#1e3a8a] uppercase placeholder:text-blue-200 border-b border-transparent hover:border-slate-300 focus:border-blue-500 rounded-none"
                placeholder="CITY, COUNTRY"
                disabled={disabled}
            />

            {/* Spacer */}
            <div className="h-2"></div>

            {/* Contact - Regular */}
            <input
                type="text"
                value={data.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full block bg-transparent border-none focus:ring-0 px-0 py-0.5 text-sm font-normal text-[#1e3a8a] placeholder:text-blue-200 border-b border-transparent hover:border-slate-300 focus:border-blue-500 rounded-none"
                placeholder="+1 234 567 890"
                disabled={disabled}
            />

            <input
                type="email"
                value={data.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full block bg-transparent border-none focus:ring-0 px-0 py-0.5 text-sm font-normal text-[#1d4ed8] placeholder:text-blue-200 border-b border-transparent hover:border-slate-300 focus:border-blue-500 rounded-none"
                placeholder="email@agency.com"
                disabled={disabled}
            />
          </div>

          {/* Warning Visualizer */}
          {data.hideTicketingWarning && (
             <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400 italic">
                * The "Please ticket before..." warning below this section will be removed.
             </div>
          )}
      </div>
    </div>
  );
};

export default AgencyForm;