import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#331c4b] text-[#e0c388] font-sans border-t border-[#c2a265]/30 pt-10 pb-6 mt-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div className="space-y-3 md:col-span-1">
          <h3 className="font-serif text-2xl font-normal tracking-wide text-white">
            Teedee_K's
          </h3>
          <p className="text-[10px] tracking-widest text-[#c2a265] uppercase">
            D E L I C A C I E S
          </p>
          <p className="text-xs text-gray-300 leading-relaxed font-serif italic">
            "Indulge in layers of bliss, made with love."
          </p>

          {/* Allergen Notice Banner */}
          <div className="bg-[#432761]/60 border border-[#c2a265]/20 p-2.5 rounded-xl text-[10px] text-gray-300 leading-normal">
            <span className="font-bold text-[#e0c388] block mb-0.5">⚠️ Allergen Info:</span>
            Contains dairy, gluten, and eggs. Baked in a facility that handles nuts and chocolate products.
          </div>
        </div>

        {/* Operating Hours & Delivery */}
        <div className="space-y-2 text-xs">
          <h4 className="font-serif font-bold text-sm text-white mb-3 border-b border-[#c2a265]/20 pb-1 w-fit">
            📍 Pickup & Operating Info
          </h4>
          <p className="text-gray-300">
            <strong className="text-[#e0c388]">Operating Days:</strong> Selective Baking Days (Check social media / WhatsApp for weekly slots)
          </p>
          <p className="text-gray-300">
            <strong className="text-[#e0c388]">Hours:</strong> Pre-orders & Scheduled Collection Slots Only
          </p>
          <p className="text-gray-300">
            <strong className="text-[#e0c388]">Location:</strong> Site B, Khayelitsha, Cape Town
          </p>
        </div>

        {/* 3. Direct Contact */}
        <div className="space-y-2 text-xs">
          <h4 className="font-serif font-bold text-sm text-white mb-3 border-b border-[#c2a265]/20 pb-1 w-fit">
            📞 Direct Orders
          </h4>
          <p className="text-gray-300">
            <strong className="text-[#e0c388]">WhatsApp:</strong> +27 76 439 6093
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/27764396093"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#e0c388] hover:bg-[#d8b570] text-[#331c4b] font-bold px-3 py-1.5 rounded-lg text-[11px] transition shadow-sm"
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* 4. Social Media Links */}
        <div className="space-y-3 text-xs">
          <h4 className="font-serif font-bold text-sm text-white mb-3 border-b border-[#c2a265]/20 pb-1 w-fit">
            Follow Us
          </h4>
          <div className="flex flex-col space-y-2 font-medium">
            <a
              href="https://www.tiktok.com/@teedee_ks.delicac?_r=1&_t=ZS-98beUygCT5d"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition flex items-center space-x-2"
            >
              <span>TikTok</span>
            </a>
            <a
              href="https://www.instagram.com/teedee_k_delicacies?igsh=bG84b29vcTh5bmhq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition flex items-center space-x-2"
            >
              <span>Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/share/17dtSxGnR2/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition flex items-center space-x-2"
            >
              <span>Facebook</span>
            </a>
          </div>
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 pt-4 border-t border-[#c2a265]/20 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-400">
        <p>© {currentYear} Teedee_K's Delicacies. All rights reserved.</p>
        
        <p className="text-center md:text-right">
          Need a custom web application or store for your business?{' '}
          <a
            href="https://travel-project-capetown.netlify.app" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e0c388] font-bold hover:underline transition ml-1"
          >
            Work with Phaphamani ↗
          </a>
        </p>
      </div>
    </footer>
  );
}