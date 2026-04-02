import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { returnResource } from '../services/api.js';

export default function QRScanner() {
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
        async (decodedText) => {
          // Prevent multiple simultaneous scan triggers
          if (isProcessing) return;
          setIsProcessing(true);
          setErrorMsg(null);
          
          try {
            // Pause scanning while waiting for API
            if (scannerRef.current && scannerRef.current.getState() === 2) { // 2 = SCANNING
               scannerRef.current.pause();
            }
            
            await returnResource(decodedText);
            setResult('Return confirmed successfully!');
            await stopScanner(); // Turn off camera upon success
          } catch (apiError) {
            setErrorMsg('Return failed — invalid QR code or server error.');
            // Resume scanning to allow another try
            if (scannerRef.current) {
               scannerRef.current.resume();
            }
          } finally {
            setIsProcessing(false);
          }
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
    </div>
  );
}
