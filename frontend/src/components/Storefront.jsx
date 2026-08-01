import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import CustomCakeModal from './CustomCakeModal';
import TrackOrderModal from './TrackOrderModal';

import chocolateImg from '../assets/chocolate.jpg'; 
import diplomateImg from '../assets/diplomate.jpg';
import redVelvetImg from '../assets/redvelvet.jpg';
import malvaImg from '../assets/malva.jpg';

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Chocolate Crémeux Cake',
    price: 65.00,
    is_cake: true,
    image: chocolateImg,
    description: 'Decadent chocolate layers topped with silk crémeux glaze.',
    stock: 8, 
  },
  {
    id: 2,
    name: 'Crème Diplomate Cake',
    price: 65.00,
    is_cake: true,
    image: diplomateImg,
    description: 'Light sponge layered with rich vanilla diplomat cream and cookies.',
    stock: 5,
  },
  {
    id: 3,
    name: 'Cream Cheese Frosted Red Velvet Cake',
    price: 75.00,
    is_cake: true,
    image: redVelvetImg,
    description: 'Classic velvety red cake coated with cream cheese and berries.',
    stock: 2,
  },
  {
    id: 4,
    name: 'Malva Pudding Lunchbox',
    price: 55.00,
    is_cake: false,
    image: malvaImg,
    description: 'Warm, sticky caramelized sponge drenched in butter cream sauce.',
    stock: 0, // Out of stock example
  }
];

const SUBURBS = [
  { name: 'Khayelitsha (Site B / Harare / Town Two)', baseFee: 20 },
  { name: 'Gugulethu / Nyanga', baseFee: 35 },
  { name: 'Mitchells Plain', baseFee: 40 },
  { name: 'Cape Town CBD / Southern Suburbs', baseFee: 65 }
];

const PICKUP_ADDRESS = "TeeDee K's Kitchen, Site B, Khayelitsha, Cape Town";

export default function Storefront() {
  const today = new Date().toISOString().split('T')[0];

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Customer & Fulfillment Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState('Delivery'); 
  const [suburb, setSuburb] = useState(SUBURBS[0].name);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  
  // Scheduling States
  const [scheduledDate, setScheduledDate] = useState(today);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('Morning (10:00 - 12:00)');

  // Modals & Banners
  const [showPromo, setShowPromo] = useState(true);
  const [isCakeModalOpen, setIsCakeModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const receiptRef = useRef();

  // Helper function to trigger Toast Notifications
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return;

    const cartItem = cart.find((i) => i.id === product.id);
    const currentQtyInCart = cartItem ? cartItem.quantity : 0;

    if (currentQtyInCart >= product.stock) {
      showToast(`⚠️ Reached max available stock for ${product.name}!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    showToast(`🧁 Added ${product.name} to cart!`);
  };

  const removeFromCart = (id) => {
    const itemToRemove = cart.find((i) => i.id === id);
    setCart((prev) => prev.filter((item) => item.id !== id));
    if (itemToRemove) {
      showToast(`🗑️ Removed ${itemToRemove.name} from cart.`);
    }
  };

  // Pricing Calculations
  const totalCakes = cart.reduce((sum, item) => sum + (item.is_cake ? item.quantity : 0), 0);
  const freeCakes = Math.floor(totalCakes / 5);
  const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = freeCakes * 65.00;

  const selectedSuburbObj = SUBURBS.find((s) => s.name === suburb) || SUBURBS[0];
  const deliveryFee = (cart.length === 0 || fulfillmentType === 'Pickup') 
    ? 0 
    : rawSubtotal > 300 
    ? 0 
    : selectedSuburbObj.baseFee;

  const finalTotal = Math.max(0, rawSubtotal - discount + deliveryFee);

  // Submit Order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your Name and Phone Number so we can notify you of your order status!');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      items: cart,
      suburb: fulfillmentType === 'Delivery' ? suburb : 'Self Pickup',
      pickupAddress: fulfillmentType === 'Pickup' ? PICKUP_ADDRESS : null,
      paymentMethod,
      fulfillmentType,
      customerName,
      customerPhone,
      scheduledDate,
      scheduledTimeSlot,
      rawSubtotal,
      discount,
      deliveryFee,
      finalTotal,
    };

    try {
      const res = await fetch('https://teedee-k-s-delicacies.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrderConfirmation({
          orderId: data.orderId,
          ...payload,
        });

        // Deduct stock locally
        setProducts((prev) =>
          prev.map((p) => {
            const orderedItem = cart.find((c) => c.id === p.id);
            return orderedItem ? { ...p, stock: p.stock - orderedItem.quantity } : p;
          })
        );

        // WhatsApp Receipt Message
        const itemLines = cart
          .map((item) => `• ${item.name} (x${item.quantity}) - R${(item.price * item.quantity).toFixed(2)}`)
          .join('\n');

        const fulfillmentDetails = fulfillmentType === 'Delivery'
          ? `*Delivery Suburb:* ${suburb}\n*Delivery Fee:* ${deliveryFee === 0 ? 'FREE' : `R${deliveryFee.toFixed(2)}`}`
          : `*Fulfillment:* Self Pickup 🛍️\n*Collection Address:* ${PICKUP_ADDRESS}`;

        const message = 
`👑 *NEW ORDER - TEEDEE_K'S DELICACIES* 🧁

*Order ID:* ${data.orderId}
*Customer Name:* ${customerName}
*Phone Number:* ${customerPhone}

*Scheduled Date:* 📅 ${scheduledDate}
*Preferred Time Slot:* ⏰ ${scheduledTimeSlot}

*Order Items:*
${itemLines}

----------------------------------
*Subtotal:* R${rawSubtotal.toFixed(2)}
${freeCakes > 0 ? `*Promo Discount:* -R${discount.toFixed(2)} (${freeCakes} Free Cake)\n` : ''}${fulfillmentDetails}
*Total Amount:* *R${finalTotal.toFixed(2)}*
----------------------------------
*Payment Option:* ${paymentMethod}

Please send your payment details and notify me when my order status changes!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = '27764396093';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        setCart([]);
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('Could not connect to server. Proceeding to WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDFInvoice = () => {
    const element = receiptRef.current;
    const opt = {
      margin: 0.5,
      filename: `Invoice_${orderConfirmation.orderId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#2d1b4e] font-serif pb-16 relative">
      
      {/* 1. TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#331c4b] text-[#e0c388] border border-[#e0c388]/30 font-sans font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl transition-all duration-300 animate-bounce flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      {showPromo && (
        <div className="bg-[#331c4b] text-[#e0c388] px-4 py-2.5 text-xs font-semibold tracking-wider flex justify-between items-center shadow-md border-b border-[#c2a265]/30">
          <div className="mx-auto flex items-center space-x-2 font-sans">
            <span>✨ SPECIAL OFFER: Buy 4 Cakes, Get 1 FREE Automatically!</span>
          </div>
          <button 
            onClick={() => setShowPromo(false)} 
            className="text-[#e0c388] hover:opacity-70 font-bold text-base px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#f2ebd9] border-b border-[#d8c7a9] sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-normal tracking-wide text-[#2d1b4e]">
              Teedee_K's
            </h1>
            <p className="text-xs tracking-widest text-[#7a6442] uppercase font-sans mt-0.5">
              D E L I C A C I E S
            </p>
          </div>

          <div className="flex items-center space-x-3 font-sans">
            <button
              onClick={() => setIsTrackModalOpen(true)}
              className="bg-[#331c4b] hover:bg-[#432761] text-[#e0c388] text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
            >
              🔎 Track Order
            </button>
            <div className="bg-[#331c4b] text-[#e0c388] font-bold px-4 py-2 rounded-xl text-xs shadow">
              🛒 {cart.reduce((sum, i) => sum + i.quantity, 0)} Items
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 mt-8 grid lg:grid-cols-3 gap-8">
        
        {/* Menu Grid */}
        <section className="lg:col-span-2 space-y-6">
          
          {/* Custom Cake Banner */}
          <div className="bg-[#ffffff] border border-[#e8ded0] p-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#331c4b]">Looking for a Custom Celebration Cake?</h3>
              <p className="text-xs text-[#7a6442] font-sans">Birthdays, anniversaries & custom tiers crafted to order.</p>
            </div>
            <button
              onClick={() => setIsCakeModalOpen(true)}
              className="bg-[#331c4b] hover:bg-[#432761] text-[#e0c388] font-sans font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap"
            >
              ✨ Request Custom Quote
            </button>
          </div>

          <div className="text-center md:text-left border-b border-[#e5d8bf] pb-4">
            <h2 className="text-xl md:text-2xl font-normal tracking-wider text-[#331c4b] uppercase">
              Gateaux Cakes in a Cup
            </h2>
            <p className="text-xs text-[#7a6442] italic mt-1 font-sans">
              "Indulge in layers of bliss, made with love."
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {products.map((product) => {
              const isSoldOut = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 3;

              return (
                <div
                  key={product.id}
                  className={`group bg-[#ffffff] border border-[#e8ded0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
                    isSoldOut ? 'opacity-75' : ''
                  }`}
                >
                  <div>
                    <div className="relative h-56 bg-[#f2ebd9] flex items-center justify-center p-4 overflow-hidden border-b border-[#ede2cd]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`h-full w-auto object-contain drop-shadow-md transition-transform duration-300 ${
                          isSoldOut ? 'grayscale-[50%]' : 'group-hover:scale-105'
                        }`}
                      />
                      
                      {/* 2. STOCK BADGES */}
                      {isSoldOut ? (
                        <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-sans font-bold px-3 py-1 rounded-full shadow-sm z-10">
                          Sold Out Today ❌
                        </span>
                      ) : isLowStock ? (
                        <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-sans font-bold px-2.5 py-1 rounded-full shadow-sm z-10 animate-pulse">
                          Only {product.stock} Left! 🔥
                        </span>
                      ) : product.is_cake ? (
                        <span className="absolute top-3 right-3 bg-[#331c4b]/90 backdrop-blur-sm text-[#e0c388] text-[10px] font-sans font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
                          Cup Cake
                        </span>
                      ) : null}
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-[#2d1b4e] leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#6e5d48] font-sans mt-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex justify-between items-center mt-2">
                    <span className="text-lg font-bold font-sans text-[#331c4b]">
                      R {product.price.toFixed(2)}
                    </span>
                    
                    <button
                      onClick={() => addToCart(product)}
                      disabled={isSoldOut}
                      className={`font-sans px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${
                        isSoldOut
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#331c4b] hover:bg-[#432761] text-[#e0c388] active:scale-95'
                      }`}
                    >
                      {isSoldOut ? 'Sold Out' : '+ Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sidebar Order Summary */}
        <section className="bg-[#ffffff] border border-[#e8ded0] rounded-2xl p-6 shadow-sm h-fit sticky top-28 font-sans">
          <h2 className="text-lg font-serif font-semibold text-[#331c4b] border-b border-[#e8ded0] pb-3 mb-4">
            Your Order Summary
          </h2>

          {cart.length === 0 ? (
            <div className="text-center py-10 text-[#8c7a63] space-y-2">
              <span className="text-3xl block">🧁</span>
              <p className="text-xs font-medium">Your cart is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Cart Items */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-[#f7f3eb] p-3 rounded-xl border border-[#ece3d3]"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-[#2d1b4e]">{item.name}</h4>
                      <p className="text-[11px] text-[#7a6442]">
                        x{item.quantity} @ R {item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-xs text-[#2d1b4e]">
                        R {(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#aa9477] hover:text-red-500 text-xs transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Details */}
              <div className="border-t border-[#ede2cd] pt-3 space-y-2">
                <label className="text-[11px] font-bold text-[#6e5d48] uppercase tracking-wider block">
                  Contact Info (For Updates 📲)
                </label>
                <input
                  type="text"
                  placeholder="Your Full Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#f7f3eb] border border-[#d8c7a9] text-[#2d1b4e] text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#331c4b]"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp / Phone Number *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#f7f3eb] border border-[#d8c7a9] text-[#2d1b4e] text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#331c4b]"
                />
              </div>

              {/* Scheduled Date & Time Slot */}
              <div className="border-t border-[#ede2cd] pt-3 space-y-2 text-xs">
                <label className="text-[11px] font-bold text-[#6e5d48] uppercase tracking-wider block">
                  🗓️ Scheduled Delivery / Pickup
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#7a6442] font-semibold block mb-0.5">Date:</label>
                    <input
                      type="date"
                      min={today}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-[#f7f3eb] border border-[#d8c7a9] rounded-xl p-2 text-xs font-bold text-[#2d1b4e] focus:outline-none focus:border-[#331c4b]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#7a6442] font-semibold block mb-0.5">Time Slot:</label>
                    <select
                      value={scheduledTimeSlot}
                      onChange={(e) => setScheduledTimeSlot(e.target.value)}
                      className="w-full bg-[#f7f3eb] border border-[#d8c7a9] rounded-xl p-2 text-xs font-bold text-[#2d1b4e] focus:outline-none focus:border-[#331c4b]"
                    >
                      <option value="Morning (10:00 - 12:00)">Morning (10:00 - 12:00)</option>
                      <option value="Early Afternoon (12:00 - 14:00)">Early Afternoon (12:00 - 14:00)</option>
                      <option value="Late Afternoon (14:00 - 16:00)">Late Afternoon (14:00 - 16:00)</option>
                      <option value="Evening (16:00 - 18:00)">Evening (16:00 - 18:00)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fulfillment Option */}
              <div className="border-t border-[#ede2cd] pt-3 space-y-2">
                <label className="text-[11px] font-bold text-[#6e5d48] uppercase tracking-wider block">
                  Order Option
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFulfillmentType('Delivery')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      fulfillmentType === 'Delivery'
                        ? 'bg-[#331c4b] border-[#331c4b] text-[#e0c388]'
                        : 'bg-[#f7f3eb] border-[#d8c7a9] text-[#6e5d48]'
                    }`}
                  >
                    🚚 Delivery
                  </button>
                  <button
                    onClick={() => setFulfillmentType('Pickup')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      fulfillmentType === 'Pickup'
                        ? 'bg-[#331c4b] border-[#331c4b] text-[#e0c388]'
                        : 'bg-[#f7f3eb] border-[#d8c7a9] text-[#6e5d48]'
                    }`}
                  >
                    🛍️ Self Pickup
                  </button>
                </div>

                {fulfillmentType === 'Delivery' ? (
                  <div className="space-y-1.5 pt-1">
                    <select
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                      className="w-full bg-[#f7f3eb] border border-[#d8c7a9] text-[#2d1b4e] text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#331c4b]"
                    >
                      {SUBURBS.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name} (R {s.baseFee})
                        </option>
                      ))}
                    </select>
                    {rawSubtotal > 300 && (
                      <p className="text-[11px] text-emerald-700 font-medium">✨ FREE Delivery Unlocked!</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#f7f3eb] p-2.5 rounded-xl border border-[#ece3d3] text-[11px] text-[#6e5d48] space-y-1">
                    <p className="font-bold text-[#331c4b]">📍 Collection Address:</p>
                    <p>{PICKUP_ADDRESS}</p>
                  </div>
                )}
              </div>

              {/* Price Calculation */}
              <div className="border-t border-[#ede2cd] pt-3 space-y-1.5 text-xs text-[#6e5d48]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#2d1b4e] font-semibold">R {rawSubtotal.toFixed(2)}</span>
                </div>

                {freeCakes > 0 && (
                  <div className="flex justify-between text-[#8a6828] font-semibold">
                    <span>Promo Discount ({freeCakes} Free)</span>
                    <span>- R {discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-[#2d1b4e] font-semibold">
                    {fulfillmentType === 'Pickup' ? 'FREE' : deliveryFee === 0 ? 'FREE' : `R ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-[#331c4b] border-t border-[#ede2cd] pt-2.5 mt-2">
                  <span>Total Amount</span>
                  <span>R {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Option */}
              <div className="border-t border-[#ede2cd] pt-3 space-y-1.5">
                <label className="text-[11px] font-bold text-[#6e5d48] uppercase tracking-wider block">
                  Payment Option
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      paymentMethod === 'Card'
                        ? 'bg-[#331c4b] border-[#331c4b] text-[#e0c388]'
                        : 'bg-[#f7f3eb] border-[#d8c7a9] text-[#6e5d48]'
                    }`}
                  >
                    💳 Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      paymentMethod === 'Cash'
                        ? 'bg-[#331c4b] border-[#331c4b] text-[#e0c388]'
                        : 'bg-[#f7f3eb] border-[#d8c7a9] text-[#6e5d48]'
                    }`}
                  >
                    💵 Cash
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full bg-[#331c4b] hover:bg-[#432761] text-[#e0c388] py-3 rounded-xl font-bold text-xs tracking-wider shadow-sm transition active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? 'Recording Order...' : `Place Order (R ${finalTotal.toFixed(2)})`}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Printable Receipt Modal */}
      {orderConfirmation && (
        <div className="fixed inset-0 bg-[#2d1b4e]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-[#ffffff] border border-[#d8c7a9] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div ref={receiptRef} className="p-4 bg-[#f7f3eb] rounded-xl border border-[#d8c7a9] space-y-3">
              <div className="text-center border-b border-[#d8c7a9] pb-3">
                <h2 className="font-serif font-bold text-xl text-[#331c4b]">Teedee_K's Delicacies</h2>
                <p className="text-[10px] text-[#7a6442] uppercase tracking-widest">Official Order Invoice</p>
                <p className="text-xs font-bold text-[#331c4b] mt-1">Order ID: {orderConfirmation.orderId}</p>
              </div>

              <div className="text-xs space-y-1 text-[#2d1b4e]">
                <p><strong>Customer:</strong> {orderConfirmation.customerName}</p>
                <p><strong>Phone:</strong> {orderConfirmation.customerPhone}</p>
                <p><strong>Fulfillment:</strong> {orderConfirmation.fulfillmentType} ({orderConfirmation.suburb})</p>
                <p><strong>Scheduled Date:</strong> 📅 {orderConfirmation.scheduledDate}</p>
                <p><strong>Time Slot:</strong> ⏰ {orderConfirmation.scheduledTimeSlot}</p>
              </div>

              <div className="border-t border-[#d8c7a9] pt-2 space-y-1 text-xs">
                <p className="font-bold text-[#331c4b]">Items Ordered:</p>
                {orderConfirmation.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.name} (x{i.quantity})</span>
                    <span>R {(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#d8c7a9] pt-2 text-xs space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>R {orderConfirmation.rawSubtotal.toFixed(2)}</span></div>
                {orderConfirmation.discount > 0 && (
                  <div className="flex justify-between text-[#8a6828] font-bold"><span>Promo Discount:</span><span>-R {orderConfirmation.discount.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between"><span>Delivery:</span><span>R {orderConfirmation.deliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-sm text-[#331c4b] border-t border-[#d8c7a9] pt-1 mt-1">
                  <span>Total Paid:</span>
                  <span>R {orderConfirmation.finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={downloadPDFInvoice}
                className="w-full bg-[#331c4b] hover:bg-[#432761] text-[#e0c388] font-bold text-xs py-3 rounded-xl shadow transition flex items-center justify-center space-x-2"
              >
                <span>📄 Download PDF Receipt</span>
              </button>

              <button
                onClick={() => setOrderConfirmation(null)}
                className="w-full bg-[#f7f3eb] hover:bg-[#ede2cd] text-[#6e5d48] font-bold text-xs py-2.5 rounded-xl border border-[#d8c7a9] transition"
              >
                Close & Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CustomCakeModal isOpen={isCakeModalOpen} onClose={() => setIsCakeModalOpen(false)} />
      <TrackOrderModal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} />
    </div>
  );
}