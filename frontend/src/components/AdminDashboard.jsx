import React, { useState, useEffect } from 'react';

const ADMIN_PASSCODE = '1234'; 

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  // This is my admin to stay logged without relogging in all the time
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('teedee_admin_authed');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      const data = await res.json();
      
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('teedee_admin_authed', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('teedee_admin_authed');
    setPasscode('');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Helper to convert orders array into a downloadable CSV report
  const exportToCSV = () => {
    if (orders.length === 0) {
      alert('No orders available to export!');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone',
      'Fulfillment',
      'Suburb',
      'Payment Method',
      'Status',
      'Items',
      'Total Paid (R)'
    ];

    const rows = orders.map((o) => {
      const itemSummary = Array.isArray(o.items)
        ? o.items.map((i) => `${i.name} (x${i.quantity})`).join(' | ')
        : '';

      return [
        `"${o.orderId || ''}"`,
        `"${o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}"`,
        `"${o.customerName || 'Walk-in'}"`,
        `"${o.customerPhone || 'N/A'}"`,
        `"${o.fulfillmentType || 'Delivery'}"`,
        `"${o.suburb || ''}"`,
        `"${o.paymentMethod || ''}"`,
        `"${o.status || 'Pending'}"`,
        `"${itemSummary}"`,
        `"${(o.finalTotal || 0).toFixed(2)}"`
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TeedeeK_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------
  // 1. LOGIN SCREEN (If Not Authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f3eb] flex items-center justify-center p-4 font-serif">
        <div className="bg-white border border-[#d8c7a9] rounded-2xl p-8 max-w-sm w-full shadow-xl text-center space-y-5">
          <div className="space-y-1">
            <span className="text-4xl block">👑</span>
            <h2 className="text-2xl font-bold text-[#331c4b]">Kitchen Admin</h2>
            <p className="text-xs text-[#7a6442] font-sans">Enter passcode to access order management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 font-sans">
            <div>
              <input
                type="password"
                placeholder="Enter Admin PIN (Default: 1234)"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setLoginError(false);
                }}
                className={`w-full bg-[#f7f3eb] border ${
                  loginError ? 'border-red-500' : 'border-[#d8c7a9]'
                } text-[#2d1b4e] text-center text-sm font-bold tracking-widest rounded-xl p-3 focus:outline-none focus:border-[#331c4b]`}
              />
              {loginError && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">
                  Incorrect PIN. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#331c4b] hover:bg-[#432761] text-[#e0c388] py-3 rounded-xl font-bold text-xs tracking-wider shadow transition"
            >
              Unlock Dashboard 🔑
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. DASHBOARD VIEW (If Authenticated)
  // -------------------------------------------------------------
  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter((o) => o.status === filterStatus);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#2d1b4e] font-sans p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#e8ded0] shadow-sm">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#331c4b] flex items-center space-x-2">
              <span>Teedee_K's Kitchen Admin</span>
            </h1>
            <p className="text-xs text-[#7a6442] mt-0.5">Live order tracking and fulfillment control</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchOrders}
              className="bg-[#f7f3eb] hover:bg-[#ede2cd] text-[#331c4b] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#d8c7a9] transition"
            >
              🔄 Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="bg-[#331c4b] hover:bg-[#432761] text-[#e0c388] text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
            >
              📥 Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2.5 rounded-xl border border-red-200 transition"
            >
              🔒 Lock Dashboard
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e8ded0] shadow-sm">
            <span className="text-xs font-bold text-[#7a6442] uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl font-serif font-bold text-[#331c4b] mt-1 block">{orders.length}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e8ded0] shadow-sm">
            <span className="text-xs font-bold text-[#7a6442] uppercase tracking-wider block">Pending Kitchen Queue</span>
            <span className="text-2xl font-serif font-bold text-amber-600 mt-1 block">{pendingCount} Orders</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e8ded0] shadow-sm">
            <span className="text-xs font-bold text-[#7a6442] uppercase tracking-wider block">Total Recorded Sales</span>
            <span className="text-2xl font-serif font-bold text-emerald-700 mt-1 block">R {totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {['All', 'Pending', 'In Kitchen', 'Out for Delivery', 'Delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                filterStatus === status
                  ? 'bg-[#331c4b] border-[#331c4b] text-[#e0c388]'
                  : 'bg-white border-[#d8c7a9] text-[#6e5d48] hover:bg-[#f7f3eb]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-[#e8ded0] text-xs text-[#7a6442]">
            Loading active orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-[#e8ded0] text-xs text-[#7a6442]">
            No orders found matching filter "{filterStatus}".
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white border border-[#e8ded0] rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#f2ebd9] pb-3">
                  <div>
                    <span className="font-bold text-sm text-[#331c4b]">{order.orderId}</span>
                    <span className="text-xs text-[#7a6442] ml-3">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  
                  {/* Status Dropdown */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#6e5d48]">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                      className="bg-[#f7f3eb] border border-[#d8c7a9] text-[#2d1b4e] text-xs font-bold rounded-xl p-2 focus:outline-none focus:border-[#331c4b]"
                    >
                      <option value="Pending">🕒 Pending</option>
                      <option value="In Kitchen">👩‍🍳 In Kitchen</option>
                      <option value="Out for Delivery">🚚 Out for Delivery</option>
                      <option value="Delivered">✅ Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Customer & Fulfillment Info */}
                <div className="grid sm:grid-cols-2 gap-3 bg-[#f7f3eb] p-3.5 rounded-xl text-xs text-[#6e5d48]">
                  <div>
                    <p className="font-bold text-[#331c4b]">
                      Customer: {order.customerName || 'Walk-in'}
                    </p>
                    <p className="text-[11px]">Phone: {order.customerPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-[#331c4b]">
                      Fulfillment: {order.fulfillmentType || 'Delivery'}
                    </p>
                    <p className="text-[11px]">Location / Suburb: {order.suburb}</p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1 text-xs text-[#2d1b4e]">
                  <p className="font-bold text-[11px] text-[#7a6442] uppercase tracking-wider">Order Items:</p>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    {Array.isArray(order.items) &&
                      order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.name} <span className="font-bold">(x{item.quantity})</span> - R {(item.price * item.quantity).toFixed(2)}
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-between items-center border-t border-[#f2ebd9] pt-3 text-xs">
                  <span className="text-[#6e5d48]">
                    Payment: <strong className="text-[#331c4b]">{order.paymentMethod}</strong>
                  </span>
                  <span className="text-sm font-bold text-[#331c4b]">
                    Total Paid: R {order.finalTotal?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}