# 🧁 Teedee_K's Delicacies - A Full-Stack E-Commerce & Order Management System

Welcome to the official repository for **Teedee_K's Delicacies**, a custom-built e-commerce web application and live order management system tailored for a boutique artisan bakery based in Khayelitsha, Cape Town.

This platform bridges the gap between digital storefront ordering and real-time kitchen operations, providing customers with a seamless cake ordering experience and giving the baker total control over order fulfillment, live status updates, and revenue metrics.

---

## Live Application & Demos

*  Live Production Storefront: [https://teedeeks-delicacies.netlify.app/](https://teedeeks-delicacies.netlify.app/)
*  Live Backend API Service: [https://teedee-k-s-delicacies.onrender.com](https://teedee-k-s-delicacies.onrender.com)

---

## Key Features Overview

### Client-Facing Storefront
* **Dynamic Menu & Real-Time Stock Tracking:** Live availability badges (*Only X Left!*, *Sold Out Today*) with automatic cart caps based on physical inventory.
* **Smart Promo Engine:** Automated *"Buy 4 Cakes, Get 1 Free"* discount calculator and free delivery threshold progress indicators.
* **Custom Scheduling & Fulfillment:** Integrated date/time-slot selectors for delivery across Cape Town or local kitchen pickup.
* **WhatsApp Receipt Generator:** Generates formatted order summaries and opens direct WhatsApp chats with pre-filled order data.
* **Downloadable Invoices:** Client-side PDF invoice generation using `html2pdf.js`.
* **Live Order Tracking Modal:** Order status lookup system allowing customers to track their progress from preparation to final delivery.
* **Custom Cake Quote Modal:** Built-in inquiry form for custom event tiers and celebration requests.

### Kitchen Admin Dashboard
* **Passcode-Protected Access:** Secure PIN-based login session (`sessionStorage` persistence).
* **Live Order Control:** Instant order status updates (*Pending* ➔ *In Kitchen* ➔ *Out for Delivery* ➔ *Delivered*).
* **Business Analytics Cards:** Real-time tracking of total order count, active kitchen queue length, and gross revenue.
* **CSV Export Tool:** One-click conversion of order history into structured downloadable `.csv` business reports.

---

## Tech Stack & Infrastructure

* **Frontend:** React, Tailwind CSS, Lucide Icons, `html2pdf.js`
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL hosted on **Supabase**
* **Deployment:** 
  * Backend: **Render** (Web Service)
  * Frontend: **Netlify**
  * Database: **Supabase** (Managed PostgreSQL)

