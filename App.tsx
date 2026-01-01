import React, { useState, useCallback } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Plane } from 'lucide-react';
import AgencyForm from './components/AgencyForm';
import { modifyPdf } from './utils/pdfProcessor';
import { AgencyDetails, PdfProcessingState } from './types';

const INITIAL_AGENCY_DATA: AgencyDetails = {
  companyName: "Reservation Pour Visa",
  addressLine1: "123 EXAMPLE STREET",
  addressLine2: "BUILDING 4, FLOOR 2",
  addressLine3: "",
  cityCountry: "TANGER",
  phone: "+1 (815) 910-0266",
  email: "contact@reservationpourvisa.com",
  hideTicketingWarning: true 
};

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [agencyData, setAgencyData] = useState<AgencyDetails>(INITIAL_AGENCY_DATA);
  const [processingState, setProcessingState] = useState<PdfProcessingState>({
    isProcessing: false,
    error: null,
    success: false,
    downloadUrl: null,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setProcessingState(prev => ({ ...prev, error: "Please upload a valid PDF file." }));
        return;
      }
      setFile(selectedFile);
      setProcessingState(prev => ({ ...prev, error: null, success: false, downloadUrl: null }));
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!file) return;

    setProcessingState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const modifiedPdfBytes = await modifyPdf(arrayBuffer, agencyData);
      
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setProcessingState({
        isProcessing: false,
        error: null,
        success: true,
        downloadUrl: url,
      });
    } catch (error) {
      console.error(error);
      setProcessingState({
        isProcessing: false,
        error: "Failed to process PDF. Ensure the file is not password protected.",
        success: false,
        downloadUrl: null,
      });
    }
  }, [file, agencyData]);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900 text-white shadow-md">
            <Plane className="w-6 h-6" />
          </div>
          <div>
             <h1 className="text-2xl font-bold text-slate-900">Itinerary Modifier</h1>
             <p className="text-slate-500 text-sm">Update agency contact information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Input */}
          <div className="space-y-6">
            
            {/* 1. Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
               <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">1. Upload PDF</h2>
                <div className="relative border border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-4 p-4">
                    <div className="bg-slate-100 p-2 rounded text-slate-500">
                        {file ? <FileText className="w-6 h-6 text-blue-600" /> : <Upload className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        {file ? (
                          <div className="truncate">
                             <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                             <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                          </div>
                        ) : (
                          <div>
                             <p className="text-sm font-medium text-slate-700">Choose file...</p>
                             <p className="text-xs text-slate-400">PDF only</p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
            </div>

            {/* 2. Customize */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
               <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">2. Agency Details</h2>
               <AgencyForm 
                 data={agencyData} 
                 onChange={setAgencyData} 
                 disabled={processingState.isProcessing}
               />
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="space-y-6">
             <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 sticky top-6">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">3. Generate & Download</h2>
                
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                   The generated PDF will have the agency section updated with the details entered on the left, and the ticketing warning removed if selected.
                </p>

                {processingState.error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100 flex gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {processingState.error}
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={!file || processingState.isProcessing}
                    className={`w-full py-3 px-4 rounded font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2
                    ${!file || processingState.isProcessing 
                        ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                    }`}
                >
                    {processingState.isProcessing ? (
                        <>Processing...</>
                    ) : (
                        <>Update PDF</>
                    )}
                </button>

                {processingState.success && processingState.downloadUrl && (
                    <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <h3 className="text-green-800 font-bold mb-1">Success!</h3>
                            <p className="text-green-700 text-sm mb-4">Your itinerary has been updated.</p>
                            
                            <a
                                href={processingState.downloadUrl}
                                download={`pnr_${file?.name || 'itinerary.pdf'}`}
                                className="inline-flex items-center justify-center px-4 py-2 bg-white border border-green-300 rounded shadow-sm text-green-700 font-medium hover:bg-green-50 w-full"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download File
                            </a>
                        </div>
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;