import React, { useState } from 'react';

export default function CustomCakeModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    eventDate: '',
    guestCount: '10-15 people',
    flavor: 'Red Velvet & Cream Cheese',
    tiers: '1 Tier',
    themeNotes: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const message = 
`👑 *CUSTOM CELEBRATION CAKE INQUIRY - TEEDEE_K'S* 🧁

*Customer Name:* ${formData.name}
*Event Date:* ${formData.eventDate}
*Estimated Guests:* ${formData.guestCount}
*Tier Count:* ${formData.tiers}
*Preferred Flavor:* ${formData.flavor}

----------------------------------
*Design & Theme Notes:*
${formData.themeNotes || 'No specific notes provided.'}
----------------------------------

Please let me know your availability and estimated quote for this design!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '27764396093'; // Teedee_K WhatsApp contact
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#2d1b4e]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-[#d8c7a9] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-[#e8ded0] pb-3">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#331c4b]">
              Bespoke Celebration Cake Inquiry 🎂
            </h3>
            <p className="text-xs text-[#7a6442]">Tell us about your upcoming event!</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#7a6442] hover:text-[#331c4b] font-bold text-lg px-2"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-[#6e5d48]">
          
          <div>
            <label className="font-bold uppercase text-[10px] text-[#331c4b] block mb-1">
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Phaphs"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#f7f3eb] border border-[#d8c7a9] rounded-xl p-2.5 focus:outline-none focus:border-[#331c4b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold uppercase text-[10px] text-[#331c4b] block mb-1">
                Event Date *
              </label>
              <input
                type="date"
                name="eventDate"
                required
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full bg-[#f7f3eb] border border-[#d8c7a9] rounded-xl p-2.5 focus:outline-none focus:border-[#331c4b]"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-[10px] text-[#331c4b] block mb-1">
                Guest Count
              </label>
              <select
                name="guestCount"
                value={formData.guestCount}
                onChange={handleChange}
                className="w-full bg-[#f7f3eb] border border-[#d8c7a9] rounded-xl p-2.5 focus:outline-none focus:border-[#331c4b]"
              >
                <option value="5-10 people">Small (5 - 10 Guests)</option>
                <option value="10-15 people">Medium (10 - 15 Guests)</option>
                <option value="20-30 people">Large (20 - 30 Guests)</option>
                <option value="30+ people">Grand Event (30+ Guests)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold uppercase text-[10px] text-[#331c4b] block mb-1">
                Cake Tiers
              </label>
              <select
                name="tiers"
                value={formData.tiers}
                onChange={handleChange}
                className="w-full bg-[#f7f3eb] border border-[#d8c7a9] rounded-xl p-2.5 focus:outline-none focus:border-[#331c4b]"
              >
                <option value="1 Tier">1 Tier</option>
                <option value="2 Tiers">2 Tiers</option>
                <option value="3 Tiers">3 Tiers</option>
                <option value="Heart Shaped Cake">Heart Shaped</option>
              </select>
            </div>

            <div>
              <label className="font-bold uppercase text-[10px] text-[#331c4b] block mb-1">
                Primary Flavor Profile
              </label>
              <select
                name="flavor"
                value={formData.flavor}
                onChange={handleChange}
                className="w-full bg-[#f7f3eb] border border-[#d8c7a9] rounded-xl p-2.5 focus:outline-none focus:border-[#331c4b]"
              >
                <option value="Red Velvet & Cream Cheese">Red Velvet & Cream Cheese</option>
                <option value="Decadent Chocolate Crémeux">Decadent Chocolate</option>
                <option value="Crème Diplomate Vanilla">Vanilla Crème Diplomate</option>
                <option value="Caramel Malva Sponge">Caramel Sponge</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold uppercase text-[10px] text-[#331c4b] block mb-1">
              Design & Color Theme Notes
            </label>
            <textarea
              name="themeNotes"
              rows="3"
              placeholder="Describe colors, inscription wording (e.g. 'Happy Birthday Kyra!'), or toppers..."
              value={formData.themeNotes}
              onChange={handleChange}
              className="w-full bg-[#f7f3eb] border border-[#d8c7a9] rounded-xl p-2.5 focus:outline-none focus:border-[#331c4b]"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold tracking-wider shadow-md transition flex items-center justify-center space-x-2 text-xs"
          >
            <span>💬 Send Custom Inquiry via WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
}