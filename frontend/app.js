const API = ''; // same origin

let cart = [];
let allRooms = [];
let allOrders = [];
let allMenu = [];
let currentCategory = 'all';

// ========== UTILS ==========
function formatCurrency(amount) {
  return 'Rs. ' + amount.toLocaleString('en-LK');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  const icon = toast.querySelector('i');
  document.getElementById('toast-msg').textContent = msg;
  icon.className = isError ? 'fas fa-exclamation-circle text-red-400' : 'fas fa-check-circle text-emerald-400';
  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
}

function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('hidden');
}

// ========== NAVIGATION ==========
function showView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById(`view-${viewName}`).classList.remove('hidden');
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('bg-orange-50', 'text-primary-600');
    if (btn.dataset.view === viewName) {
      btn.classList.add('bg-orange-50', 'text-primary-600');
    }
  });

  // Refresh data when switching views
  if (viewName === 'dashboard') loadDashboard();
  if (viewName === 'rooms') loadRooms();
  if (viewName === 'bookings') loadBookings();
  if (viewName === 'menu') loadMenu();
  if (viewName === 'orders') loadOrders();
}

// ========== DASHBOARD ==========
async function loadDashboard() {
  try {
    const [stats, bookings, orders] = await Promise.all([
      fetch(`${API}/api/stats`).then(r => r.json()),
      fetch(`${API}/api/bookings`).then(r => r.json()),
      fetch(`${API}/api/orders`).then(r => r.json())
    ]);

    // Stats cards
    document.getElementById('stats-grid').innerHTML = `
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Available Rooms</p>
            <p class="text-2xl font-bold text-emerald-600 mt-1">${stats.availableRooms}<span class="text-sm text-slate-400 font-normal">/${stats.totalRooms}</span></p>
          </div>
          <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center"><i class="fas fa-door-open text-emerald-500 text-xl"></i></div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Occupied</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">${stats.occupiedRooms}</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><i class="fas fa-bed text-blue-500 text-xl"></i></div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Pending Orders</p>
            <p class="text-2xl font-bold text-amber-600 mt-1">${stats.pendingOrders}</p>
          </div>
          <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><i class="fas fa-clock text-amber-500 text-xl"></i></div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Today's Revenue</p>
            <p class="text-2xl font-bold text-primary-600 mt-1">${formatCurrency(stats.todayRevenue)}</p>
          </div>
          <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center"><i class="fas fa-coins text-primary-500 text-xl"></i></div>
        </div>
      </div>
    `;

    // Recent bookings
    const recentBookings = bookings.slice(-5).reverse();
    document.getElementById('recent-bookings').innerHTML = recentBookings.length ? recentBookings.map(b => `
      <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
        <div>
          <p class="font-medium text-slate-800 text-sm">${b.guestName}</p>
          <p class="text-xs text-slate-500">Room ${b.roomNumber} · ${formatDate(b.checkIn)}</p>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(b.status)}">${b.status}</span>
      </div>
    `).join('') : '<p class="text-slate-400 text-sm text-center py-6">No bookings yet</p>';

    // Live orders
    const liveOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).slice(0, 6);
    document.getElementById('live-orders').innerHTML = liveOrders.length ? liveOrders.map(o => `
      <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
        <div>
          <p class="font-medium text-slate-800 text-sm">${o.orderNumber} · ${o.orderType}</p>
          <p class="text-xs text-slate-500">${o.items.length} items · ${formatCurrency(o.totalAmount)}</p>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-full font-medium ${orderStatusBadge(o.status)}">${o.status}</span>
      </div>
    `).join('') : '<p class="text-slate-400 text-sm text-center py-6">No active orders</p>';

  } catch (err) {
    console.error(err);
    showToast('Failed to load dashboard', true);
  }
}

function statusBadge(status) {
  const map = {
    confirmed: 'bg-blue-100 text-blue-700',
    'checked-in': 'bg-emerald-100 text-emerald-700',
    'checked-out': 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-700'
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

function orderStatusBadge(status) {
  const map = {
    pending: 'bg-amber-100 text-amber-700',
    preparing: 'bg-blue-100 text-blue-700',
    ready: 'bg-emerald-100 text-emerald-700',
    delivered: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-700'
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

function roomStatusColor(status) {
  const map = {
    available: 'bg-emerald-500',
    booked: 'bg-blue-500',
    occupied: 'bg-amber-500'
  };
  return map[status] || 'bg-slate-400';
}

// ========== ROOMS ==========
async function loadRooms() {
  try {
    allRooms = await fetch(`${API}/api/rooms`).then(r => r.json());
    renderRooms(allRooms);
  } catch (err) {
    showToast('Failed to load rooms', true);
  }
}

function filterRooms() {
  const filter = document.getElementById('room-filter').value;
  const filtered = filter === 'all' ? allRooms : allRooms.filter(r => r.status === filter);
  renderRooms(filtered);
}

function renderRooms(rooms) {
  document.getElementById('rooms-grid').innerHTML = rooms.map(room => `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover">
      <div class="h-2 ${roomStatusColor(room.status)}"></div>
      <div class="p-5">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-slate-800 text-lg">Room ${room.number}</h3>
            <p class="text-sm text-primary-600 font-medium">${room.type}</p>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
            room.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
            room.status === 'booked' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
          }">${room.status}</span>
        </div>
        <div class="flex items-center gap-4 text-sm text-slate-500 mb-3">
          <span><i class="fas fa-users mr-1"></i> ${room.capacity} guests</span>
          <span><i class="fas fa-building mr-1"></i> Floor ${room.floor}</span>
        </div>
        <p class="text-lg font-bold text-slate-800 mb-3">${formatCurrency(room.price)}<span class="text-xs text-slate-400 font-normal"> / night</span></p>
        <div class="flex flex-wrap gap-1.5">
          ${room.amenities.slice(0, 4).map(a => `<span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">${a}</span>`).join('')}
          ${room.amenities.length > 4 ? `<span class="text-xs text-slate-400">+${room.amenities.length - 4}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// ========== BOOKINGS ==========
async function loadBookings() {
  try {
    const bookings = await fetch(`${API}/api/bookings`).then(r => r.json());
    const tbody = document.getElementById('bookings-table');
    
    if (!bookings.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12 text-slate-400">No bookings yet. Create your first booking!</td></tr>`;
      return;
    }

    tbody.innerHTML = bookings.slice().reverse().map(b => `
      <tr class="hover:bg-slate-50">
        <td class="px-4 py-3">
          <p class="font-medium text-slate-800">${b.guestName}</p>
          <p class="text-xs text-slate-500">${b.guestPhone}</p>
        </td>
        <td class="px-4 py-3">
          <p class="font-medium">${b.roomNumber}</p>
          <p class="text-xs text-slate-500">${b.roomType}</p>
        </td>
        <td class="px-4 py-3 text-slate-600">${formatDate(b.checkIn)}</td>
        <td class="px-4 py-3 text-slate-600">${formatDate(b.checkOut)}</td>
        <td class="px-4 py-3 font-medium">${formatCurrency(b.totalAmount)}</td>
        <td class="px-4 py-3"><span class="text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(b.status)}">${b.status}</span></td>
        <td class="px-4 py-3">
          <div class="flex gap-1">
            ${b.status === 'confirmed' ? `<button onclick="updateBookingStatus('${b.id}','checked-in')" class="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-100" title="Check In"><i class="fas fa-sign-in-alt"></i></button>` : ''}
            ${b.status === 'checked-in' ? `<button onclick="updateBookingStatus('${b.id}','checked-out')" class="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-200" title="Check Out"><i class="fas fa-sign-out-alt"></i></button>` : ''}
            ${b.status === 'confirmed' || b.status === 'checked-in' ? `<button onclick="updateBookingStatus('${b.id}','cancelled')" class="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100" title="Cancel"><i class="fas fa-times"></i></button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Failed to load bookings', true);
  }
}

async function updateBookingStatus(id, status) {
  try {
    await fetch(`${API}/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast(`Booking ${status}`);
    loadBookings();
    loadRooms();
  } catch (err) {
    showToast('Failed to update booking', true);
  }
}

function openBookingModal() {
  // Load available rooms
  const select = document.getElementById('booking-room');
  const available = allRooms.filter(r => r.status === 'available');
  select.innerHTML = '<option value="">Choose available room...</option>' +
    available.map(r => `<option value="${r.id}">Room ${r.number} - ${r.type} (${formatCurrency(r.price)}/night)</option>`).join('');
  
  // Set min dates
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('check-in').min = today;
  document.getElementById('check-out').min = today;
  
  document.getElementById('booking-modal').classList.remove('hidden');
  document.getElementById('booking-modal').classList.add('flex');
}

function closeBookingModal() {
  document.getElementById('booking-modal').classList.add('hidden');
  document.getElementById('booking-modal').classList.remove('flex');
  document.getElementById('booking-form').reset();
}

async function submitBooking(e) {
  e.preventDefault();
  const data = {
    roomId: document.getElementById('booking-room').value,
    guestName: document.getElementById('guest-name').value,
    guestPhone: document.getElementById('guest-phone').value,
    guestEmail: document.getElementById('guest-email').value,
    checkIn: document.getElementById('check-in').value,
    checkOut: document.getElementById('check-out').value,
    adults: parseInt(document.getElementById('adults').value) || 1,
    children: parseInt(document.getElementById('children').value) || 0,
    specialRequests: document.getElementById('special-requests').value
  };

  try {
    const res = await fetch(`${API}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed');
    }
    showToast('Booking confirmed successfully!');
    closeBookingModal();
    loadBookings();
    loadRooms();
    loadDashboard();
  } catch (err) {
    showToast(err.message || 'Booking failed', true);
  }
}

// ========== MENU & CART ==========
async function loadMenu() {
  try {
    allMenu = await fetch(`${API}/api/menu`).then(r => r.json());
    const categories = ['all', ...new Set(allMenu.map(m => m.category))];
    
    document.getElementById('menu-categories').innerHTML = categories.map(cat => `
      <button onclick="filterMenu('${cat}')" class="category-btn px-4 py-2 rounded-xl text-sm font-medium transition ${
        cat === currentCategory ? 'bg-primary-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'
      }" data-cat="${cat}">
        ${cat === 'all' ? 'All' : cat}
      </button>
    `).join('');

    renderMenu(allMenu);
  } catch (err) {
    showToast('Failed to load menu', true);
  }
}

function filterMenu(cat) {
  currentCategory = cat;
  document.querySelectorAll('.category-btn').forEach(btn => {
    const active = btn.dataset.cat === cat;
    btn.className = `category-btn px-4 py-2 rounded-xl text-sm font-medium transition ${
      active ? 'bg-primary-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'
    }`;
  });
  const filtered = cat === 'all' ? allMenu : allMenu.filter(m => m.category === cat);
  renderMenu(filtered);
}

function renderMenu(items) {
  document.getElementById('menu-grid').innerHTML = items.map(item => `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 card-hover flex gap-4">
      <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
        <i class="fas ${item.category === 'Drinks' ? 'fa-glass-water' : item.category === 'Desserts' ? 'fa-ice-cream' : item.category === 'Appetizers' ? 'fa-leaf' : 'fa-utensils'} text-primary-500 text-xl"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-semibold text-slate-800 text-sm leading-tight">${item.name}</h3>
          <span class="text-xs px-1.5 py-0.5 rounded ${item.type === 'veg' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}">${item.type === 'veg' ? 'Veg' : 'Non-Veg'}</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">${item.description}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="font-bold text-primary-600">${formatCurrency(item.price)}</span>
          <button onclick="addToCart('${item.id}')" class="bg-primary-50 hover:bg-primary-100 text-primary-600 w-8 h-8 rounded-lg flex items-center justify-center transition">
            <i class="fas fa-plus text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function addToCart(itemId) {
  const item = allMenu.find(m => m.id === itemId);
  if (!item) return;
  
  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });
  }
  updateCartUI();
  showToast(`${item.name} added to cart`);
}

function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function openCart() {
  renderCart();
  document.getElementById('cart-modal').classList.remove('hidden');
  document.getElementById('cart-modal').classList.add('flex');
}

function closeCart() {
  document.getElementById('cart-modal').classList.add('hidden');
  document.getElementById('cart-modal').classList.remove('flex');
}

function renderCart() {
  const container = document.getElementById('cart-items');
  if (!cart.length) {
    container.innerHTML = '<p class="text-slate-400 text-sm text-center py-4">Cart is empty</p>';
    document.getElementById('cart-total').textContent = 'Rs. 0';
    return;
  }

  container.innerHTML = cart.map((item, idx) => `
    <div class="flex items-center justify-between gap-3">
      <div class="flex-1 min-w-0">
        <p class="font-medium text-sm text-slate-800 truncate">${item.name}</p>
        <p class="text-xs text-slate-500">${formatCurrency(item.price)} × ${item.quantity}</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="changeQty(${idx}, -1)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm"><i class="fas fa-minus"></i></button>
        <span class="text-sm font-medium w-5 text-center">${item.quantity}</span>
        <button onclick="changeQty(${idx}, 1)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm"><i class="fas fa-plus"></i></button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  document.getElementById('cart-total').textContent = formatCurrency(total);
}

function changeQty(idx, delta) {
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  updateCartUI();
  renderCart();
}

function toggleOrderFields() {
  const type = document.getElementById('order-type').value;
  document.getElementById('table-field').classList.toggle('hidden', type !== 'dine-in');
  document.getElementById('room-field').classList.toggle('hidden', type !== 'room-service');
}

async function placeOrder() {
  if (!cart.length) {
    showToast('Cart is empty', true);
    return;
  }

  const orderType = document.getElementById('order-type').value;
  const tableNumber = document.getElementById('table-number').value;
  const roomNumber = document.getElementById('order-room-number').value;

  if (orderType === 'dine-in' && !tableNumber) {
    showToast('Please enter table number', true);
    return;
  }
  if (orderType === 'room-service' && !roomNumber) {
    showToast('Please enter room number', true);
    return;
  }

  const data = {
    items: cart.map(c => ({ id: c.id, quantity: c.quantity })),
    orderType,
    tableNumber: orderType === 'dine-in' ? tableNumber : null,
    roomNumber: orderType === 'room-service' ? roomNumber : null,
    customerName: document.getElementById('order-customer-name').value || 'Guest',
    customerPhone: document.getElementById('order-customer-phone').value,
    notes: document.getElementById('order-notes').value
  };

  try {
    const res = await fetch(`${API}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed');
    }
    const order = await res.json();
    showToast(`Order ${order.orderNumber} placed successfully!`);
    cart = [];
    updateCartUI();
    closeCart();
    // Reset form fields
    document.getElementById('table-number').value = '';
    document.getElementById('order-room-number').value = '';
    document.getElementById('order-customer-name').value = '';
    document.getElementById('order-customer-phone').value = '';
    document.getElementById('order-notes').value = '';
  } catch (err) {
    showToast(err.message || 'Order failed', true);
  }
}

// ========== ORDERS ==========
async function loadOrders() {
  try {
    allOrders = await fetch(`${API}/api/orders`).then(r => r.json());
    renderOrders(allOrders);
  } catch (err) {
    showToast('Failed to load orders', true);
  }
}

function filterOrders() {
  const filter = document.getElementById('order-filter').value;
  const filtered = filter === 'all' ? allOrders : allOrders.filter(o => o.status === filter);
  renderOrders(filtered);
}

function renderOrders(orders) {
  const container = document.getElementById('orders-list');
  if (!orders.length) {
    container.innerHTML = '<div class="bg-white rounded-2xl p-12 text-center text-slate-400">No orders yet</div>';
    return;
  }

  container.innerHTML = orders.map(o => `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 card-hover">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl ${
            o.orderType === 'dine-in' ? 'bg-blue-50 text-blue-600' :
            o.orderType === 'takeaway' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
          } flex items-center justify-center">
            <i class="fas ${o.orderType === 'dine-in' ? 'fa-utensils' : o.orderType === 'takeaway' ? 'fa-bag-shopping' : 'fa-bell-concierge'}"></i>
          </div>
          <div>
            <p class="font-semibold text-slate-800">${o.orderNumber}</p>
            <p class="text-xs text-slate-500 capitalize">${o.orderType}${o.tableNumber ? ' · Table ' + o.tableNumber : ''}${o.roomNumber ? ' · Room ' + o.roomNumber : ''} · ${formatTime(o.createdAt)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs px-2.5 py-1 rounded-full font-medium ${orderStatusBadge(o.status)}">${o.status}</span>
          <span class="font-bold text-slate-800">${formatCurrency(o.totalAmount)}</span>
        </div>
      </div>
      <div class="bg-slate-50 rounded-xl p-3 mb-3">
        ${o.items.map(i => `<div class="flex justify-between text-sm py-0.5"><span class="text-slate-600">${i.quantity}× ${i.name}</span><span class="text-slate-800">${formatCurrency(i.subtotal)}</span></div>`).join('')}
      </div>
      <div class="flex items-center justify-between">
        <p class="text-xs text-slate-500">${o.customerName}${o.notes ? ' · Note: ' + o.notes : ''}</p>
        <div class="flex gap-1.5">
          ${o.status === 'pending' ? `<button onclick="updateOrderStatus('${o.id}','preparing')" class="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">Start Preparing</button>` : ''}
          ${o.status === 'preparing' ? `<button onclick="updateOrderStatus('${o.id}','ready')" class="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 font-medium">Mark Ready</button>` : ''}
          ${o.status === 'ready' ? `<button onclick="updateOrderStatus('${o.id}','delivered')" class="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 font-medium">Delivered</button>` : ''}
          ${['pending','preparing'].includes(o.status) ? `<button onclick="updateOrderStatus('${o.id}','cancelled')" class="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100">Cancel</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

async function updateOrderStatus(id, status) {
  try {
    await fetch(`${API}/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast(`Order marked as ${status}`);
    loadOrders();
  } catch (err) {
    showToast('Failed to update order', true);
  }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  showView('dashboard');
  
  // Auto refresh every 15 seconds for live feel
  setInterval(() => {
    const activeView = document.querySelector('.view:not(.hidden)');
    if (activeView) {
      const id = activeView.id.replace('view-', '');
      if (id === 'dashboard') loadDashboard();
      if (id === 'orders') loadOrders();
      if (id === 'rooms') loadRooms();
    }
  }, 15000);
});
