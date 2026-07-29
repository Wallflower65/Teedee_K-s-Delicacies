import React, { useState } from 'react';
import Storefront from './components/Storefront';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [view, setView] = useState('store'); // 'store' or 'admin'

  return (
    <div>
      {/* Navigation Switcher */}
      <nav className="bg-[#331c4b] text-[#e0c388] text-xs font-sans font-bold px-6 py-2 flex justify-end space-x-4 border-b border-[#c2a265]/30">
        <button
          onClick={() => setView('store')}
          className={`hover:text-white transition ${view === 'store' ? 'underline' : ''}`}
        >
          Storefront
        </button>
        <button
          onClick={() => setView('admin')}
          className={`hover:text-white transition ${view === 'admin' ? 'underline' : ''}`}
        >
        Admin Kitchen
        </button>
      </nav>

      {view === 'store' ? <Storefront /> : <AdminDashboard />}
    </div>
  );
}

export default App;