import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { QrCode, Keyboard, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

const TokenScanner = ({ onTokenScanned, loading }) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'camera'
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    let scanner = null;
    if (activeTab === 'camera') {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            if (onTokenScanned) {
              onTokenScanned(decodedText);
            }
          },
          (error) => {
            // Non-critical scan failure while searching for QR
          }
        );
      } catch (err) {
        console.warn('QR Scanner initialization error:', err);
      }
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((err) => console.error('Scanner clear error', err));
      }
    };
  }, [activeTab]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onTokenScanned(manualCode.trim().toUpperCase());
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
      <div className="bg-gradient-to-r from-gov-navy to-slate-900 text-white p-5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <QrCode className="w-5 h-5 text-emerald-400" />
          <h3 className="font-black text-sm">Token Verification Scanner</h3>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-5">
        {/* Toggle between Camera and Manual Input */}
        <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'manual'
                ? 'bg-white text-blue-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4 text-blue-700" />
            <span>{t('manualEntry')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'camera'
                ? 'bg-white text-blue-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>{t('scanQr')} (Webcam)</span>
          </button>
        </div>

        {/* Tab 1: Manual Input */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Enter Token Code or Paste Cryptographic QR Payload
              </label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. TN-PDS-9482 or full cryptographic JSON payload"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                'Verifying Token Authenticity...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authenticate & Verify Token</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Webcam Camera Scanner */}
        {activeTab === 'camera' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 text-center">
              Position the citizen's mobile QR token or printed pass inside the scanner frame
            </p>
            <div id="qr-reader" className="mx-auto max-w-sm rounded-2xl overflow-hidden"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenScanner;