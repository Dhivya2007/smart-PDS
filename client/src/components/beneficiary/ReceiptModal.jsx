import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Printer, X, CheckCircle, ShieldCheck, Download } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  const { language, t } = useLanguage();

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between no-print">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
            Digital Receipt Preview
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('printReceipt')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div id="printable-receipt" className="p-8 space-y-6 text-slate-800">
          {/* Official Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4">
            <div className="flex justify-center mb-1">
              <span className="text-3xl">🌾</span>
            </div>
            <h2 className="font-extrabold text-lg uppercase tracking-wide text-blue-950">
              Department of Food & Consumer Protection
            </h2>
            <p className="text-xs font-semibold text-slate-600">
              TAMIL NADU SMART PUBLIC DISTRIBUTION SYSTEM (TNPDS)
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Official Digital Cash / Distribution Acknowledgement
            </p>
          </div>

          {/* Receipt Info Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500 uppercase text-[10px] font-bold">Receipt Number</p>
              <p className="font-mono font-bold text-sm text-blue-900">{receipt.receiptNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 uppercase text-[10px] font-bold">Distribution Date</p>
              <p className="font-medium text-slate-800">
                {new Date(receipt.distributedAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-slate-500 uppercase text-[10px] font-bold">Ration Card No.</p>
              <p className="font-mono font-bold text-slate-900">
                {receipt.rationCardId?.cardNumber || 'N/A'}{' '}
                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-normal">
                  {receipt.rationCardId?.cardType}
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-slate-500 uppercase text-[10px] font-bold">Fair Price Shop (FPS)</p>
              <p className="font-bold text-slate-900">
                {receipt.shopId?.fpsCode} - {receipt.shopId?.shopName}
              </p>
            </div>
          </div>

          {/* Collector Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-500">Collected by: </span>
              <strong className="text-slate-800">
                {receipt.collectedByMember?.name || receipt.beneficiaryUserId?.name}
              </strong>
            </div>
            <div className="font-mono text-slate-600 text-[11px]">
              Aadhaar: XXXX-XXXX-{receipt.collectedByMember?.aadhaarLast4 || 'XXXX'}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-2 px-2">#</th>
                  <th className="py-2 px-2">Commodity</th>
                  <th className="py-2 px-2 text-right">Quantity</th>
                  <th className="py-2 px-2 text-right">Rate/Unit</th>
                  <th className="py-2 px-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {receipt.itemsDistributed?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-2 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-2 font-medium text-slate-900">
                      {item.commodityName || item.commodity}
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-semibold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-600 font-mono">
                      ₹{item.ratePerUnit.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                      ₹{item.itemTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-800 font-bold text-sm">
                  <td colSpan="4" className="py-2.5 px-2 text-right">
                    Grand Total Paid:
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-blue-900">
                    ₹{receipt.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment & Security Footer */}
          <div className="pt-4 border-t border-dashed border-slate-300 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>
                Payment Method: {receipt.paymentMethod} (Verified)
              </span>
            </div>
            <div className="text-right text-[10px] text-slate-400 font-mono">
              Cycle: {receipt.monthCycle}
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2">
            This is a computer-generated digital receipt authenticated by the Smart PDS Network. No physical signature required.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
