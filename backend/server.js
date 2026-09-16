const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Data paths
const DATA_DIR = path.join(__dirname, '../data');
const ROOMS_FILE = path.join(DATA_DIR, 'rooms.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper: Read JSON
function readData(file) {
  try {
    if (!fs.existsSync(file)) return [];
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return [];
  }
}

// Helper: Write JSON
function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Initialize sample data if empty
function initializeData() {
  // Rooms
  if (!fs.existsSync(ROOMS_FILE) || readData(ROOMS_FILE).length === 0) {
    const rooms = [
      { id: 'R101', number: '101', type: 'Standard', floor: 1, price: 4500, capacity: 2, status: 'available', amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom'] },
      { id: 'R102', number: '102', type: 'Standard', floor: 1, price: 4500, capacity: 2, status: 'available', amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom'] },
      { id: 'R103', number: '103', type: 'Standard', floor: 1, price: 4500, capacity: 2, status: 'available', amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom'] },
      { id: 'R201', number: '201', type: 'Deluxe', floor: 2, price: 7500, capacity: 3, status: 'available', amenities: ['AC', 'TV', 'WiFi', 'Mini Fridge', 'Balcony', 'King Bed'] },
      { id: 'R202', number: '202', type: 'Deluxe', floor: 2, price: 7500, capacity: 3, status: 'available', amenities: ['AC', 'TV', 'WiFi', 'Mini Fridge', 'Balcony', 'King Bed'] },
      { id: 'R203', number: '203', type: 'Deluxe', floor: 2, price: 7500, capacity: 3, status: 'available', amenities: ['AC', 'TV', 'WiFi', 'Mini Fridge', 'Balcony', 'King Bed'] },
      { id: 'R301', number: '301', type: 'Suite', floor: 3, price: 12000, capacity: 4, status: 'available', amenities: ['AC', 'Smart TV', 'WiFi', 'Mini Bar', 'Living Area', 'Jacuzzi', 'City View'] },
      { id: 'R302', number: '302', type: 'Suite', floor: 3, price: 12000, capacity: 4, status: 'available', amenities: ['AC', 'Smart TV', 'WiFi', 'Mini Bar', 'Living Area', 'Jacuzzi', 'City View'] },
      { id: 'R401', number: '401', type: 'Presidential Suite', floor: 4, price: 25000, capacity: 6, status: 'available', amenities: ['AC', 'Smart TV', 'WiFi', 'Full Kitchen', 'Private Butler', 'Jacuzzi', 'Panoramic View', 'Office'] }
    ];
    writeData(ROOMS_FILE, rooms);
  }

  // Menu
  if (!fs.existsSync(MENU_FILE) || readData(MENU_FILE).length === 0) {
    const menu = [
      // Breakfast
      { id: 'M001', name: 'Sri Lankan Breakfast', category: 'Breakfast', price: 850, description: 'String hoppers, dhal curry, pol sambol, egg, tea', available: true, type: 'veg' },
      { id: 'M002', name: 'English Breakfast', category: 'Breakfast', price: 1200, description: 'Eggs, bacon, sausages, toast, baked beans, coffee', available: true, type: 'non-veg' },
      { id: 'M003', name: 'Pancake Stack', category: 'Breakfast', price: 750, description: 'Fluffy pancakes with maple syrup & butter', available: true, type: 'veg' },
      { id: 'M004', name: 'Fresh Fruit Platter', category: 'Breakfast', price: 650, description: 'Seasonal tropical fruits', available: true, type: 'veg' },

      // Main Course
      { id: 'M005', name: 'Chicken Kottu', category: 'Main Course', price: 1100, description: 'Famous Sri Lankan kottu with chicken', available: true, type: 'non-veg' },
      { id: 'M006', name: 'Vegetable Kottu', category: 'Main Course', price: 850, description: 'Classic kottu with mixed vegetables', available: true, type: 'veg' },
      { id: 'M007', name: 'Seafood Fried Rice', category: 'Main Course', price: 1450, description: 'Prawns, squid & fish with aromatic rice', available: true, type: 'non-veg' },
      { id: 'M008', name: 'Chicken Curry & Rice', category: 'Main Course', price: 1250, description: 'Spicy Sri Lankan chicken curry with basmati rice', available: true, type: 'non-veg' },
      { id: 'M009', name: 'Vegetable Biryani', category: 'Main Course', price: 950, description: 'Fragrant basmati rice with mixed vegetables & raita', available: true, type: 'veg' },
      { id: 'M010', name: 'Grilled Fish', category: 'Main Course', price: 1800, description: 'Fresh catch of the day with lemon butter sauce', available: true, type: 'non-veg' },
      { id: 'M011', name: 'Beef Steak', category: 'Main Course', price: 2200, description: 'Tender steak cooked to perfection with sides', available: true, type: 'non-veg' },
      { id: 'M012', name: 'Pasta Alfredo', category: 'Main Course', price: 1150, description: 'Creamy alfredo pasta with garlic bread', available: true, type: 'veg' },

      // Appetizers
      { id: 'M013', name: 'Chicken Spring Rolls', category: 'Appetizers', price: 650, description: 'Crispy spring rolls with sweet chili sauce', available: true, type: 'non-veg' },
      { id: 'M014', name: 'Vegetable Samosas', category: 'Appetizers', price: 450, description: 'Crispy samosas with mint chutney', available: true, type: 'veg' },
      { id: 'M015', name: 'Prawn Tempura', category: 'Appetizers', price: 950, description: 'Lightly battered prawns with dipping sauce', available: true, type: 'non-veg' },

      // Desserts
      { id: 'M016', name: 'Watalappan', category: 'Desserts', price: 450, description: 'Traditional Sri Lankan coconut custard', available: true, type: 'veg' },
      { id: 'M017', name: 'Chocolate Lava Cake', category: 'Desserts', price: 750, description: 'Warm chocolate cake with molten center', available: true, type: 'veg' },
      { id: 'M018', name: 'Ice Cream Sundae', category: 'Desserts', price: 550, description: 'Vanilla ice cream with toppings', available: true, type: 'veg' },

      // Drinks
      { id: 'M019', name: 'King Coconut', category: 'Drinks', price: 250, description: 'Fresh king coconut water', available: true, type: 'veg' },
      { id: 'M020', name: 'Fresh Lime Juice', category: 'Drinks', price: 350, description: 'Freshly squeezed lime with soda', available: true, type: 'veg' },
      { id: 'M021', name: 'Ceylon Tea', category: 'Drinks', price: 200, description: 'Premium Ceylon black tea', available: true, type: 'veg' },
      { id: 'M022', name: 'Cappuccino', category: 'Drinks', price: 450, description: 'Rich espresso with steamed milk', available: true, type: 'veg' },
      { id: 'M023', name: 'Fresh Mango Juice', category: 'Drinks', price: 400, description: 'Seasonal fresh mango juice', available: true, type: 'veg' },
      { id: 'M024', name: 'Soft Drinks', category: 'Drinks', price: 300, description: 'Coke / Sprite / Fanta', available: true, type: 'veg' }
    ];
    writeData(MENU_FILE, menu);
  }

  // Bookings & Orders empty initially
  if (!fs.existsSync(BOOKINGS_FILE)) writeData(BOOKINGS_FILE, []);
  if (!fs.existsSync(ORDERS_FILE)) writeData(ORDERS_FILE, []);
}

initializeData();

// ==================== API ROUTES ====================

// --- ROOMS ---
app.get('/api/rooms', (req, res) => {
  const rooms = readData(ROOMS_FILE);
  res.json(rooms);
});

app.get('/api/rooms/:id', (req, res) => {
  const rooms = readData(ROOMS_FILE);
  const room = rooms.find(r => r.id === req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

app.put('/api/rooms/:id/status', (req, res) => {
  const rooms = readData(ROOMS_FILE);
  const index = rooms.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Room not found' });
  
  rooms[index].status = req.body.status;
  writeData(ROOMS_FILE, rooms);
  res.json(rooms[index]);
});

// --- BOOKINGS ---
app.get('/api/bookings', (req, res) => {
  const bookings = readData(BOOKINGS_FILE);
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const { roomId, guestName, guestPhone, guestEmail, checkIn, checkOut, adults, children, specialRequests } = req.body;
  
  if (!roomId || !guestName || !guestPhone || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const rooms = readData(ROOMS_FILE);
  const room = rooms.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.status !== 'available') return res.status(400).json({ error: 'Room is not available' });

  // Calculate nights
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (nights < 1) return res.status(400).json({ error: 'Invalid dates' });

  const totalAmount = nights * room.price;

  const booking = {
    id: uuidv4(),
    roomId,
    roomNumber: room.number,
    roomType: room.type,
    guestName,
    guestPhone,
    guestEmail: guestEmail || '',
    checkIn,
    checkOut,
    nights,
    adults: adults || 1,
    children: children || 0,
    specialRequests: specialRequests || '',
    totalAmount,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  // Update room status
  room.status = 'booked';
  writeData(ROOMS_FILE, rooms);

  const bookings = readData(BOOKINGS_FILE);
  bookings.push(booking);
  writeData(BOOKINGS_FILE, bookings);

  res.status(201).json(booking);
});

app.put('/api/bookings/:id/status', (req, res) => {
  const bookings = readData(BOOKINGS_FILE);
  const index = bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Booking not found' });

  const newStatus = req.body.status;
  bookings[index].status = newStatus;

  // Update room status accordingly
  const rooms = readData(ROOMS_FILE);
  const roomIndex = rooms.findIndex(r => r.id === bookings[index].roomId);
  
  if (roomIndex !== -1) {
    if (newStatus === 'checked-in') {
      rooms[roomIndex].status = 'occupied';
    } else if (newStatus === 'checked-out' || newStatus === 'cancelled') {
      rooms[roomIndex].status = 'available';
    }
    writeData(ROOMS_FILE, rooms);
  }

  writeData(BOOKINGS_FILE, bookings);
  res.json(bookings[index]);
});

// --- MENU ---
app.get('/api/menu', (req, res) => {
  const menu = readData(MENU_FILE);
  res.json(menu);
});

app.get('/api/menu/categories', (req, res) => {
  const menu = readData(MENU_FILE);
  const categories = [...new Set(menu.map(item => item.category))];
  res.json(categories);
});

// --- ORDERS ---
app.get('/api/orders', (req, res) => {
  const orders = readData(ORDERS_FILE);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { items, orderType, tableNumber, roomNumber, customerName, customerPhone, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }
  if (!orderType || !['dine-in', 'takeaway', 'room-service'].includes(orderType)) {
    return res.status(400).json({ error: 'Invalid order type' });
  }
  if (orderType === 'dine-in' && !tableNumber) {
    return res.status(400).json({ error: 'Table number required for dine-in' });
  }
  if (orderType === 'room-service' && !roomNumber) {
    return res.status(400).json({ error: 'Room number required for room service' });
  }

  const menu = readData(MENU_FILE);
  let totalAmount = 0;
  const orderItems = items.map(item => {
    const menuItem = menu.find(m => m.id === item.id);
    if (!menuItem) throw new Error(`Item ${item.id} not found`);
    const qty = item.quantity || 1;
    totalAmount += menuItem.price * qty;
    return {
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: qty,
      subtotal: menuItem.price * qty
    };
  });

  const order = {
    id: uuidv4(),
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    items: orderItems,
    orderType,
    tableNumber: tableNumber || null,
    roomNumber: roomNumber || null,
    customerName: customerName || 'Guest',
    customerPhone: customerPhone || '',
    notes: notes || '',
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const orders = readData(ORDERS_FILE);
  orders.push(order);
  writeData(ORDERS_FILE, orders);

  res.status(201).json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
  const orders = readData(ORDERS_FILE);
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Order not found' });

  orders[index].status = req.body.status;
  orders[index].updatedAt = new Date().toISOString();
  writeData(ORDERS_FILE, orders);
  res.json(orders[index]);
});

// --- DASHBOARD STATS ---
app.get('/api/stats', (req, res) => {
  const rooms = readData(ROOMS_FILE);
  const bookings = readData(BOOKINGS_FILE);
  const orders = readData(ORDERS_FILE);

  const today = new Date().toISOString().split('T')[0];

  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
    bookedRooms: rooms.filter(r => r.status === 'booked').length,
    totalBookings: bookings.length,
    activeBookings: bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length,
    todayCheckIns: bookings.filter(b => b.checkIn === today && b.status !== 'cancelled').length,
    todayCheckOuts: bookings.filter(b => b.checkOut === today && b.status === 'checked-in').length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'preparing').length,
    todayOrders: orders.filter(o => o.createdAt.startsWith(today)).length,
    todayRevenue: [
      ...bookings.filter(b => b.createdAt.startsWith(today) && b.status !== 'cancelled').map(b => b.totalAmount),
      ...orders.filter(o => o.createdAt.startsWith(today) && o.status !== 'cancelled').map(o => o.totalAmount)
    ].reduce((a, b) => a + b, 0)
  };

  res.json(stats);
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n\ud83c\udfe8 Shan Hotel System is running!`);
  console.log(`\ud83d\udccd Open: http://localhost:${PORT}`);
  console.log(`\u23f0 Started at: ${new Date().toLocaleString()}\n`);
});
