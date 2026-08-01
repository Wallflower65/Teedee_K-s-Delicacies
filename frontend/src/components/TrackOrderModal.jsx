import React, { useState } from 'react';

const STATUS_STEPS = ['Pending', 'In Kitchen', 'Out for Delivery', 'Delivered'];

export default function TrackOrderModal({ isOpen, onClose }) {
  const [searchId, setSearchId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setTrackedOrder(null);

    try {
      const res = await fetch(`https://teedee-k-s-delicacies.onrender.com/api/orders/track/${searchId.trim()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setTrackedOrder(data.order);
      } else {
        setErrorMsg(data.message || 'Order ID not found.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = trackedOrder 
    ? STATUS_STEPS.indexOf(trackedOrder.status) 
    : 0;

  return (
    <div className="fixed inset-0 bg-[#2d1b4e]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-[#d8c7a9] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#f2ebd9] pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔎</span>
            <h3 className="text-xl font-serif font-bold text-[#331c4b]">Track Your Order</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#aa9477] hover:text-[#331c4b] font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleTrack} className="space-y-3">
          <label className="text-xs font-bold text-[#6e5d48] block">Enter Order ID (e.g. TD-123456):</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="TD-XXXXXX"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-[#f7f3eb] border border-[#d8c7a9] text-[#2d1b4e] text-xs uppercase font-bold tracking-wider rounded-xl p-3 focus:outline-none focus:border-[#331c4b]"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#331c4b] hover:bg-[#432761] text-[#e0c388] text-xs font-bold px-4 py-3 rounded-xl transition whitespace-nowrap"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
          {errorMsg && (
            <p className="text-[11px] text-red-500 font-semibold">{errorMsg}</p>
          )}
        </form>

        {/* Tracked Result Display */}
        {trackedOrder && (
          <div className="bg-[#f7f3eb] border border-[#ece3d3] rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-start border-b border-[#ede2cd] pb-2">
              <div>
                <span className="font-bold text-sm text-[#331c4b]">{trackedOrder.orderId}</span>
                <p className="text-[11px] text-[#7a6442]">Customer: {trackedOrder.customerName || 'Valued Guest'}</p>
              </div>
              <span className="bg-[#331c4b] text-[#e0c388] text-[10px] font-bold px-2.5 py-1 rounded-full">
                {trackedOrder.status}
              </span>
            </div>

            {/* Visual Progress Steps */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#6e5d48] uppercase">Order Status Progress:</p>
              <div className="grid grid-cols-4 gap-1 text-center">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  return (
                    <div key={step} className="space-y-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isDone ? 'bg-[#331c4b]' : 'bg-[#d8c7a9]/40'
                        }`}
                      />
                      <span className={`text-[9px] font-bold block ${
                        isDone ? 'text-[#331c4b]' : 'text-[#aa9477]'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary details */}
            <div className="text-xs text-[#6e5d48] pt-1 space-y-1">
              <p><strong>Fulfillment:</strong> {trackedOrder.fulfillmentType} ({trackedOrder.suburb})</p>
              <p><strong>Total Paid:</strong> R {trackedOrder.finalTotal.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}