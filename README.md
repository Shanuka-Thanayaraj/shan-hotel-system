# 🏨 Shan Hotel Management System

A **live, real-time hotel management system** for **Shan Hotel** with complete room booking and restaurant order management.

![Shan Hotel](https://img.shields.io/badge/Shan%20Hotel-Live%20System-orange)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### 🛏️ Room Booking
- View all rooms with live status (Available / Booked / Occupied)
- Multiple room types: Standard, Deluxe, Suite, Presidential Suite
- Create new bookings with guest details
- Check-in / Check-out management
- Automatic room status updates
- Pricing with night calculation

### 🍽️ Food & Restaurant
- Full digital menu (Breakfast, Main Course, Appetizers, Desserts, Drinks)
- **Dine-in** orders (with table number)
- **Takeaway** orders
- **Room Service** orders (with room number)
- Live order tracking: Pending → Preparing → Ready → Delivered
- Kitchen-friendly order management panel

### 📊 Live Dashboard
- Real-time statistics
- Available / Occupied rooms count
- Pending orders
- Today's revenue
- Recent bookings & live orders feed
- Auto-refreshes every 15 seconds

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed

### Installation

```bash
# Clone the repository
git clone https://github.com/Shanuka-Thanayaraj/shan-hotel-system.git
cd shan-hotel-system

# Install dependencies
npm install

# Start the server
npm start
```

Open your browser: **http://localhost:3000**

---

## 📁 Project Structure

```
shan-hotel-system/
├── backend/
│   └── server.js          # Express API + data logic
├── frontend/
│   ├── index.html         # Main UI
│   └── app.js             # Frontend logic
├── data/                  # Auto-created JSON storage
│   ├── rooms.json
│   ├── bookings.json
│   ├── menu.json
│   └── orders.json
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Backend     | Node.js + Express       |
| Frontend    | HTML + Tailwind CSS + Vanilla JS |
| Storage     | JSON files (zero config) |
| Icons       | Font Awesome            |

No database setup required — everything works out of the box!

---

## 📱 Screens Overview

1. **Dashboard** – Live stats, recent bookings & active orders
2. **Rooms** – All rooms with status, type, price & amenities
3. **Bookings** – Create & manage reservations + check-in/out
4. **Food Menu** – Browse menu & add to cart
5. **Orders** – Live kitchen/order management board

---

## 💰 Sample Room Rates (LKR)

| Type                | Price/Night |
|---------------------|-------------|
| Standard            | Rs. 4,500   |
| Deluxe              | Rs. 7,500   |
| Suite               | Rs. 12,000  |
| Presidential Suite  | Rs. 25,000  |

---

## 👨‍💻 Author

**Shanuka Thanayaraj**  
GitHub: [@Shanuka-Thanayaraj](https://github.com/Shanuka-Thanayaraj)

---

## 📄 License

MIT License – feel free to use and modify for your hotel!
