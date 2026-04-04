import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { returnResource, getRequestById } from '../services/api.js';

export default function QRScanner() {
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [scannedRequestId, setScannedRequestId] = useState('');
  const [scannedRequest, setScannedRequest] = useState(null);  // full request data
  const [condition, setCondition] = useState('GOOD');
  const [conditionNotes, setConditionNotes] = useState('');
  const [scanResult, setScanResult] = useState('');
  
  const scannerRef = useRef(null);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isCameraActive) {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: 'environment' }, // Back camera preferred
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Prevent multiple simultaneous scan triggers
          if (isProcessing) return;
          setIsProcessing(true);
          setErrorMsg(null);
          
          if (scannerRef.current && scannerRef.current.getState() === 2) { // 2 = SCANNING
             scannerRef.current.pause();
          }
          
          setScannedRequestId(decodedText);
          setScanResult(`QR Scanned! Request ID: ${decodedText}`);

          // Fetch full request to check overdue status
          getRequestById(decodedText)
            .then((res) => {
              setScannedRequest(res.data);
            })
            .catch(() => {
              setScannedRequest(null);
            })
            .finally(() => {
              setShowConditionModal(true);
              setIsProcessing(false);
            });
        },
        (errorMessage) => {
          // Ignore routine background scanning framework warnings
        }
      ).catch((err) => {
        console.error("Camera error:", err);
        setErrorMsg("Failed to start camera. Try restarting or checking permissions.");
        setIsCameraActive(false);
      });
    }

    return () => {
      // Component unmount cleanup
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isCameraActive]);

  const handleConfirmReturn = async () => {
    try {
      const response = await returnResource(scannedRequestId, condition, conditionNotes);
      const { daysLate, penaltyAmount } = response.data;
      
      let message = `✅ Return Confirmed!\n`;
      message += `Device Condition: ${condition}\n`;
      if (conditionNotes) message += `Notes: ${conditionNotes}\n`;
      if (penaltyAmount > 0) {
        message += `⚠️ Returned late!\nDays late: ${daysLate}\nPenalty: LKR ${penaltyAmount}`;
      } else {
        message += `No penalty — returned on time.`;
      }
      alert(message);
      
      setShowConditionModal(false);
      setScannedRequestId('');
      setScannedRequest(null);
      setCondition('GOOD');
      setConditionNotes('');
      setScanResult('Scan another QR code...');
      await stopScanner();
    } catch (err) {
      alert(err.response?.data?.message || 'Return failed — invalid QR code');
      setShowConditionModal(false);
      if (scannerRef.current && scannerRef.current.getState() === 3) { // 3 = PAUSED
        scannerRef.current.resume();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Scan QR Code to Return</h2>
      
      {/* Persist the DOM element safely so Html5Qrcode doesn't lose its map */}
      <div 
         className={`mb-6 mx-auto overflow-hidden rounded-lg bg-gray-50 border border-gray-200 ${!isCameraActive ? 'hidden' : ''}`}
      >
         <div id="qr-reader" className="w-full min-h-[300px]"></div>
         <button 
           onClick={stopScanner}
           className="my-4 px-4 py-2 bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-colors rounded-md"
         >
           Cancel Scanning
         </button>
      </div>

      {!isCameraActive && (
        <div className="mb-6 mx-auto flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 space-y-4">
           {/* Camera Icon Placeholder */}
           <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
           </svg>
           
           <p className="text-sm text-gray-500">Camera access is needed to scan item return logic signatures.</p>
           
           <button 
             onClick={() => {
               setResult(null);
               setErrorMsg(null);
               setIsCameraActive(true);
             }}
             className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm transition-colors"
           >
             Open Camera
           </button>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 font-semibold border border-green-200 rounded-md">
          {result}
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 font-semibold border border-red-200 rounded-md">
          {errorMsg}
        </div>
      )}

      {/* Device Condition Modal */}
      {showConditionModal && (() => {
        const now = new Date();
        const isOverdue = scannedRequest?.dueDate && now > new Date(scannedRequest.dueDate);
        const daysLate = isOverdue
          ? Math.floor((now - new Date(scannedRequest.dueDate)) / (1000 * 60 * 60 * 24))
          : 0;
        const estimatedPenalty = daysLate * 50;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-left">
              <h3 className={`text-lg font-semibold mb-1 ${
                isOverdue ? 'text-red-700' : 'text-gray-900'
              }`}>Device Condition Check</h3>
              <p className="text-sm text-gray-500 mb-4">QR scanned successfully — please inspect device before confirming</p>

              {/* Overdue alert banner */}
              {isOverdue && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-red-600 font-bold text-sm">⚠️ OVERDUE ITEM</span>
                  </div>
                  <div className="text-sm text-red-700">
                    <span className="font-medium">{scannedRequest?.student?.name}</span>
                    {scannedRequest?.student?.studentId && (
                      <span className="text-red-500 ml-1">({scannedRequest.student.studentId})</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-red-600 space-y-0.5">
                    <div>Resource: <span className="font-medium">{scannedRequest?.resource?.name}</span></div>
                    <div>Due: <span className="font-medium">{new Date(scannedRequest.dueDate).toLocaleDateString()}</span></div>
                    <div className="font-semibold">Days late: {daysLate} &nbsp;|&nbsp; Estimated penalty: LKR {estimatedPenalty}</div>
                  </div>
                </div>
              )}
              
              <div className="mb-4 text-center">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded border border-gray-200">
                  ID: {scannedRequestId}
                </span>
              </div>

            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Select Condition:</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setCondition('GOOD')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border text-left flex items-center justify-between ${
                    condition === 'GOOD' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Good
                  {condition === 'GOOD' && <span className="text-green-500">✓</span>}
                </button>
                <button 
                  onClick={() => setCondition('MINOR DAMAGE')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border text-left flex items-center justify-between ${
                    condition === 'MINOR DAMAGE' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Minor Damage
                  {condition === 'MINOR DAMAGE' && <span className="text-yellow-500">✓</span>}
                </button>
                <button 
                  onClick={() => setCondition('DAMAGED')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border text-left flex items-center justify-between ${
                    condition === 'DAMAGED' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Damaged
                  {condition === 'DAMAGED' && <span className="text-red-500">✓</span>}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows="3"
                className="w-full text-base sm:text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Details about damage or missing parts..."
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
              />
            </div>
            
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConditionModal(false);
                    setScannedRequestId('');
                    setScannedRequest(null);
                    setCondition('GOOD');
                    setConditionNotes('');
                    setScanResult('');
                    if (scannerRef.current && scannerRef.current.getState() === 3) {
                      scannerRef.current.resume();
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReturn}
                  className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    isOverdue
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  Confirm Return
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
