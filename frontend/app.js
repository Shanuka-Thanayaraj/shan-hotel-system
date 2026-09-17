const API = '';
let cart = [], allRooms = [], allOrders = [], allMenu = [], allBookings = [], currentCategory = 'all';
let confirmCallback = null;

function formatCurrency(n) { return 'Rs. ' + (n || 0).toLocaleString('en-LK'); }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'; }
function formatTime(d) { return d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''; }

function showToast(msg, err) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  document.getElementById('toast-icon').className = err ? 'fas fa-exclamation-circle text-red-400' : 'fas fa-check-circle text-emerald-400';
  t.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => t.classList.add('translate-y-20', 'opacity-0'), 2800);
}

function toggleMobile() {
  const m = document.getElementById('mobileMenu');
  const i = document.getElementById('menuIcon');
  m.classList.toggle('hidden');
  i.className = m.classList.contains('hidden') ? 'fas fa-bars' : 'fas fa-times';
}

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('view-' + name);
  if (el) el.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.remove('active');
    if (b.dataset.view === name) b.classList.add('active');
  });

  if (name === 'dashboard') loadDashboard();
  if (name === 'rooms') loadRooms();
  if (name === 'bookings') loadBookings();
  if (name === 'menu') loadMenu();
  if (name === 'orders') loadOrders();
}

function statusBadge(s) {
  const m = {
    confirmed: 'bg-blue-50 text-blue-600',
    'checked-in': 'bg-emerald-50 text-emerald-600',
    'checked-out': 'bg-slate-100 text-slate-500',
    cancelled: 'bg-red-50 text-red-500'
  };
  return m[s] || 'bg-slate-100 text-slate-500';
}

function orderBadge(s) {
  const m = {
    pending: 'bg-amber-50 text-amber-600',
    preparing: 'bg-blue-50 text-blue-600',
    ready: 'bg-emerald-50 text-emerald-600',
    delivered: 'bg-slate-100 text-slate-500',
    cancelled: 'bg-red-50 text-red-500'
  };
  return m[s] || 'bg-slate-100 text-slate-500';
}

function emptyState(icon, title, sub) {
  return `<div class="empty-state">
    <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-300 text-xl"><i class="fas ${icon}"></i></div>
    <p class="font-medium text-slate-400 text-sm">${title}</p>
    ${sub ? `<p class="text-xs text-slate-300 mt-1">${sub}</p>` : ''}
  </div>`;
}

// Confirm dialog
function openConfirm(title, msg, icon, okText, cb) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('confirm-icon').innerHTML = `<i class="fas ${icon || 'fa-question'}"></i>`;
  document.getElementById('confirm-ok').textContent = okText || 'Confirm';
  confirmCallback = cb;
  document.getElementById('confirm-modal').classList.add('open');
}

function closeConfirm() {
  document.getElementById('confirm-modal').classList.remove('open');
  confirmCallback = null;
}

document.getElementById('confirm-ok').onclick = () => {
  if (confirmCallback) confirmCallback();
  closeConfirm();
};

// ==================== DASHBOARD ====================
async function loadDashboard() {
  try {
    const [stats, bookings, orders] = await Promise.all([
      fetch(API + '/api/stats').then(r => r.json()),
      fetch(API + '/api/bookings').then(r => r.json()),
      fetch(API + '/api/orders').then(r => r.json())
    ]);

    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card bg-white rounded-2xl border border-slate-200 p-4 card shadow-card">
        <div class="flex items-center justify-between">
          <p class="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Available</p>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><i class="fas fa-door-open text-emerald-500 text-xs"></i></div>
        </div>
        <p class="text-2xl font-bold text-emerald-500 mt-2">${stats.availableRooms}<span class="text-sm text-slate-300 font-normal">/${stats.totalRooms}</span></p>
      </div>
      <div class="stat-card bg-white rounded-2xl border border-slate-200 p-4 card shadow-card">
        <div class="flex items-center justify-between">
 class="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Occupied</p>
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><i class="fas fa-bed text-blue-500 text-xs"></i></div>
        </div>
        <p class="text-2xl font-bold text-blue-500 mt-2">${stats.occupiedRooms}</p>
      </div>
      <div class="stat-card bg-white rounded-2xl border border-slate-200 p-4 card shadow-card">
        <div class="flex items-center justify-between">
          <p class="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Pending Orders</p>
          <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><i class="fas fa-clock text-amber-500 text-xs"></i></div>
        </div>
        <p class="text-2xl font-bold text-amber-500 mt-2">${stats.pendingOrders}</p>
      </div>
      <div class="stat-card bg-white rounded-2xl border border-slate-200 p-4 card shadow-card">
        <div class="flex items-center justify-between">
          <p class="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Today Revenue</p>
          <div class="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center"><i class="fas fa-coins text-brand-500 text-xs"></i></div>
        </div>
        <p class="text-xl font-bold text-brand-500 mt-2">${formatCurrency(stats.todayRevenue)}</p>
      </div>`;

    const rb = bookings.slice(-5).reverse();
    document.getElementById('recent-bookings').innerHTML = rb.length ? rb.map(b => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
        <div class="min-w-0">
          <p class="text-sm font-medium truncate">${b.guestName}</p>
          <p class="text-xs text-slate-400">Room ${b.roomNumber} · ${formatDate(b.checkIn)}</p>
        </div>
        <span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${statusBadge(b.status)} flex-shrink-0">${b.status}</span>
      </div>`).join('') : emptyState('fa-calendar', 'No bookings yet', 'Create your first booking');

    const lo = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).slice(0, 6);
    document.getElementById('live-orders').innerHTML = lo.length ? lo.map(o => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
        <div class="min-w-0">
          <p class="text-sm font-medium">${o.orderNumber}</p>
          <p class="text-xs text-slate-400">${o.items.length} items · ${formatCurrency(o.totalAmount)}</p>
        </div>
        <span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${orderBadge(o.status)} flex-shrink-0">${o.status}</span>
      </div>`).join('') : emptyState('fa-receipt', 'No active orders', 'Orders will appear here');
  } catch (e) {
    showToast('Failed to load dashboard', true);
  }
}

// ==================== ROOMS ====================
async function loadRooms() {
  try {
    allRooms = await fetch(API + '/api/rooms').then(r => r.json());
    filterRooms();
  } catch (e) {
    showToast('Failed to load rooms', true);
  }
}

function filterRooms() {
  const f = document.getElementById('room-filter').value;
  renderRooms(f === 'all' ? allRooms : allRooms.filter(r => r.status === f));
}

function renderRooms(rooms) {
  const grid = document.getElementById('rooms-grid');
  if (!rooms.length) {
    grid.innerHTML = `<div class="col-span-full">${emptyState('fa-bed', 'No rooms match filter')}</div>`;
    return;
  }
  grid.innerHTML = rooms.map(r => {
    const statusColor = r.status === 'available' ? 'bg-emerald-400' : r.status === 'booked' ? 'bg-blue-400' : 'bg-amber-400';
    const badge = r.status === 'available' ? 'bg-emerald-50 text-emerald-600' : r.status === 'booked' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600';
    return `
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden card shadow-card">
      <div class="h-1.5 ${statusColor}"></div>
      <div class="p-4">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h3 class="font-semibold text-slate-800">Room ${r.number}</h3>
            <p class="text-sm text-brand-500 font-medium">${r.type}</p>
          </div>
          <span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${badge}">${r.status}</span>
        </div>
        <p class="text-lg font-bold text-slate-800">${formatCurrency(r.price)}<span class="text-xs text-slate-400 font-normal"> /night</span></p>
        <p class="text-xs text-slate-400 mt-1.5"><i class="fas fa-users mr-1"></i>${r.capacity} guests · Floor ${r.floor}</p>
        <div class="flex flex-wrap gap-1 mt-2.5">
          ${r.amenities.slice(0, 4).map(a => `<span class="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">${a}</span>`).join('')}
          ${r.amenities.length > 4 ? `<span class="text-[10px] text-slate-400">+${r.amenities.length - 4}</span>` : ''}
        </div>
        ${r.status === 'available' ? `
        <button onclick="quickBook('${r.id}')" class="mt-3 w-full text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 py-2 rounded-lg transition">
          <i class="fas fa-calendar-plus mr-1"></i> Book Now
        </button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function quickBook(roomId) {
  openBookingModal(roomId);
}

// ==================== BOOKINGS ====================
async function loadBookings() {
  try {
    allBookings = await fetch(API + '/api/bookings').then(r => r.json());
    filterBookings();
  } catch (e) {
    showToast('Failed to load bookings', true);
  }
}

function filterBookings() {
  const q = (document.getElementById('booking-search')?.value || '').toLowerCase().trim();
  let list = allBookings.slice().reverse();
  if (q) {
    list = list.filter(b =>
      b.guestName.toLowerCase().includes(q) ||
      String(b.roomNumber).includes(q) ||
      (b.guestPhone || '').includes(q)
    );
  }
  renderBookings(list);
}

function renderBookings(bookings) {
  const tbody = document.getElementById('bookings-table');
  if (!bookings.length) {
    tbody.innerHTML = `<tr><td colspan="8">${emptyState('fa-calendar-check', 'No bookings found', 'Try a different search or create a new booking')}</td></tr>`;
    return;
  }
  tbody.innerHTML = bookings.map(b => `
    <tr class="hover:bg-slate-50 transition">
      <td class="px-4 py-3">
        <p class="font-medium text-sm">${b.guestName}</p>
        <p class="text-xs text-slate-400">${b.guestPhone || '—'}</p>
      </td>
      <td class="px-4 py-3">
        <p class="font-medium text-sm">${b.roomNumber}</p>
        <p class="text-xs text-slate-400">${b.roomType}</p>
      </td>
      <td class="px-4 py-3 text-slate-500 text-sm">${formatDate(b.checkIn)}</td>
      <td class="px-4 py-3 text-slate-500 text-sm">${formatDate(b.checkOut)}</td>
      <td class="px-4 py-3 text-slate-500 text-sm">${b.nights || '—'}</td>
      <td class="px-4 py-3 font-semibold text-sm text-brand-600">${formatCurrency(b.totalAmount)}</td>
      <td class="px-4 py-3"><span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${statusBadge(b.status)}">${b.status}</span></td>
      <td class="px-4 py-3">
        <div class="flex gap-1">
          ${b.status === 'confirmed' ? `<button onclick="confirmAction('Check In', 'Check in ${b.guestName} to Room ${b.roomNumber}?', 'fa-sign-in-alt', 'Check In', () => updateBookingStatus('${b.id}','checked-in'))" class="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md hover:bg-emerald-100" title="Check In"><i class="fas fa-sign-in-alt"></i></button>` : ''}
          ${b.status === 'checked-in' ? `<button onclick="confirmAction('Check Out', 'Check out ${b.guestName} from Room ${b.roomNumber}?', 'fa-sign-out-alt', 'Check Out', () => updateBookingStatus('${b.id}','checked-out'))" class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md hover:bg-slate-200" title="Check Out"><i class="fas fa-sign-out-alt"></i></button>` : ''}
          ${b.status === 'confirmed' || b.status === 'checked-in' ? `<button onclick="confirmAction('Cancel Booking', 'Cancel booking for ${b.guestName}? This cannot be undone.', 'fa-times', 'Cancel Booking', () => updateBookingStatus('${b.id}','cancelled'))" class="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100" title="Cancel"><i class="fas fa-times"></i></button>` : ''}
        </div>
      </td>
    </tr>`).join('');
}

function confirmAction(title, msg, icon, okText, cb) {
  openConfirm(title, msg, icon, okText, cb);
}

async function updateBookingStatus(id, status) {
  try {
    await fetch(API + '/api/bookings/' + id + '/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast('Booking ' + status);
    loadBookings();
    loadRooms();
    loadDashboard();
  } catch (e) {
    showToast('Update failed', true);
  }
}

function openBookingModal(preselectRoomId) {
  const sel = document.getElementById('booking-room');
  const fill = () => {
    const avail = allRooms.filter(r => r.status === 'available');
    sel.innerHTML = '<option value="">Choose room...</option>' +
      avail.map(r => `<option value="${r.id}" ${preselectRoomId === r.id ? 'selected' : ''}>Room ${r.number} — ${r.type} (${formatCurrency(r.price)})</option>`).join('');
  };
  if (!allRooms.length) {
    loadRooms().then(fill);
  } else {
    fill();
  }
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('check-in').min = today;
  document.getElementById('check-out').min = today;
  document.getElementById('booking-modal').classList.add('open');
}

function closeBookingModal() {
  document.getElementById('booking-modal').classList.remove('open');
  document.getElementById('booking-form').reset();
}

async function submitBooking(e) {
  e.preventDefault();
  const btn = document.getElementById('booking-submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> Saving...';

  try {
    const checkIn = document.getElementById('check-in').value;
    const checkOut = document.getElementById('check-out').value;
    if (new Date(checkOut) <= new Date(checkIn)) {
      throw new Error('Check-out must be after check-in');
    }

    const res = await fetch(API + '/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: document.getElementById('booking-room').value,
        guestName: document.getElementById('guest-name').value.trim(),
        guestPhone: document.getElementById('guest-phone').value.trim(),
        guestEmail: document.getElementById('guest-email').value.trim(),
        checkIn,
        checkOut,
        adults: +document.getElementById('adults').value || 1,
        children: +document.getElementById('children').value || 0,
        specialRequests: document.getElementById('special-requests').value.trim()
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed');
    }
    showToast('Booking confirmed!');
    closeBookingModal();
    loadBookings();
    loadRooms();
    loadDashboard();
  } catch (e) {
    showToast(e.message || 'Failed', true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Confirm Booking';
  }
}

// ==================== MENU ====================
async function loadMenu() {
  try {
    allMenu = await fetch(API + '/api/menu').then(r => r.json());
    const cats = ['all', ...new Set(allMenu.map(m => m.category))];
    document.getElementById('menu-categories').innerHTML = cats.map(c => `
      <button onclick="filterMenu('${c}')" class="category-btn px-3.5 py-1.5 rounded-full text-sm font-medium transition ${c === currentCategory ? 'bg-brand-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-brand-300'}" data-cat="${c}">${c === 'all' ? 'All' : c}</button>
    `).join('');
    renderMenu(allMenu);
  } catch (e) {
    showToast('Failed to load menu', true);
  }
}

function filterMenu(cat) {
  currentCategory = cat;
  document.querySelectorAll('.category-btn').forEach(b => {
    const on = b.dataset.cat === cat;
    b.className = `category-btn px-3.5 py-1.5 rounded-full text-sm font-medium transition ${on ? 'bg-brand-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-brand-300'}`;
  });
  renderMenu(cat === 'all' ? allMenu : allMenu.filter(m => m.category === cat));
}

function renderMenu(items) {
  const grid = document.getElementById('menu-grid');
  if (!items.length) {
    grid.innerHTML = `<div class="col-span-full">${emptyState('fa-utensils', 'No items in this category')}</div>`;
    return;
  }
  grid.innerHTML = items.map(item => `
    <div class="bg-white rounded-2xl border border-slate-200 p-4 card shadow-card flex gap-3">
      <div class="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
        <i class="fas ${item.category === 'Drinks' ? 'fa-glass-water' : item.category === 'Desserts' ? 'fa-ice-cream' : item.category === 'Appetizers' ? 'fa-leaf' : item.category === 'Breakfast' ? 'fa-mug-hot' : 'fa-utensils'} text-brand-500"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between gap-2">
          <h3 class="text-sm font-semibold text-slate-800 leading-tight">${item.name}</h3>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-medium ${item.type === 'veg' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'} flex-shrink-0">${item.type === 'veg' ? 'VEG' : 'NON'}</span>
        </div>
        <p class="text-xs text-slate-400 mt-0.5 line-clamp-1">${item.description}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="font-bold text-brand-600 text-sm">${formatCurrency(item.price)}</span>
          <button onclick="addToCart('${item.id}')" class="w-8 h-8 rounded-lg bg-brand-50 hover:bg-brand-500 text-brand-500 hover:text-white flex items-center justify-center transition">
            <i class="fas fa-plus text-xs"></i>
          </button>
        </div>
      </div>
    </div>`).join('');
}

function addToCart(id) {
  const item = allMenu.find(m => m.id === id);
  if (!item) return;
  const ex = cart.find(c => c.id === id);
  if (ex) ex.quantity++;
  else cart.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });
  updateCartUI();
  showToast(item.name + ' added');
}

function updateCartUI() {
  const n = cart.reduce((s, i) => s + i.quantity, 0);
  const b = document.getElementById('cart-count');
  if (n > 0) {
    b.textContent = n;
    b.classList.remove('hidden');
  } else {
    b.classList.add('hidden');
  }
}

function openCart() {
  renderCart();
  document.getElementById('cart-modal').classList.add('open');
}

function closeCart() {
  document.getElementById('cart-modal').classList.remove('open');
}

function renderCart() {
  const c = document.getElementById('cart-items');
  if (!cart.length) {
    c.innerHTML = '<p class="text-slate-300 text-sm text-center py-4">Cart is empty</p>';
    document.getElementById('cart-total').textContent = 'Rs. 0';
    return;
  }
  c.innerHTML = cart.map((item, i) => `
    <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">${item.name}</p>
        <p class="text-xs text-slate-400">${formatCurrency(item.price)} × ${item.quantity}</p>
      </div>
      <div class="flex items-center gap-1.5">
        <button onclick="changeQty(${i},-1)" class="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs hover:bg-slate-50"><i class="fas fa-minus"></i></button>
        <span class="text-sm font-medium w-5 text-center">${item.quantity}</span>
        <button onclick="changeQty(${i},1)" class="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs hover:bg-slate-50"><i class="fas fa-plus"></i></button>
      </div>
    </div>`).join('');
  document.getElementById('cart-total').textContent = formatCurrency(cart.reduce((s, i) => s + i.price * i.quantity, 0));
}

function changeQty(i, d) {
  cart[i].quantity += d;
  if (cart[i].quantity <= 0) cart.splice(i, 1);
  updateCartUI();
  renderCart();
}

function toggleOrderFields() {
  const t = document.getElementById('order-type').value;
  document.getElementById('table-field').classList.toggle('hidden', t !== 'dine-in');
  document.getElementById('room-field').classList.toggle('hidden', t !== 'room-service');
}

async function placeOrder() {
  if (!cart.length) {
    showToast('Cart is empty', true);
    return;
  }
  const type = document.getElementById('order-type').value;
  const table = document.getElementById('table-number').value.trim();
  const room = document.getElementById('order-room-number').value.trim();
  if (type === 'dine-in' && !table) {
    showToast('Enter table number', true);
    return;
  }
  if (type === 'room-service' && !room) {
    showToast('Enter room number', true);
    return;
  }

  const btn = document.getElementById('place-order-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> Placing...';

  try {
    const res = await fetch(API + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(c => ({ id: c.id, quantity: c.quantity })),
        orderType: type,
        tableNumber: type === 'dine-in' ? table : null,
        roomNumber: type === 'room-service' ? room : null,
        customerName: document.getElementById('order-customer-name').value.trim() || 'Guest',
        customerPhone: document.getElementById('order-customer-phone').value.trim(),
        notes: document.getElementById('order-notes').value.trim()
      })
    });
    if (!res.ok) {
      const e = await res.json();
      throw new Error(e.error || 'Failed');
    }
    const o = await res.json();
    showToast('Order ' + o.orderNumber + ' placed!');
    cart = [];
    updateCartUI();
    closeCart();
    ['table-number', 'order-room-number', 'order-customer-name', 'order-customer-phone', 'order-notes'].forEach(id => {
      document.getElementById(id).value = '';
    });
    loadOrders();
    loadDashboard();
  } catch (e) {
    showToast(e.message || 'Failed', true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Place Order';
  }
}

// ==================== ORDERS ====================
async function loadOrders() {
  try {
    allOrders = await fetch(API + '/api/orders').then(r => r.json());
    filterOrders();
  } catch (e) {
    showToast('Failed to load orders', true);
  }
}

function filterOrders() {
  const f = document.getElementById('order-filter').value;
  renderOrders(f === 'all' ? allOrders : allOrders.filter(o => o.status === f));
}

function renderOrders(orders) {
  const c = document.getElementById('orders-list');
  if (!orders.length) {
    c.innerHTML = emptyState('fa-receipt', 'No orders yet', 'Place an order from the Dining menu');
    return;
  }
  c.innerHTML = orders.map(o => `
    <div class="bg-white rounded-2xl border border-slate-200 p-4 card shadow-card">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl ${o.orderType === 'dine-in' ? 'bg-blue-50 text-blue-500' : o.orderType === 'takeaway' ? 'bg-purple-50 text-purple-500' : 'bg-amber-50 text-amber-500'} flex items-center justify-center">
            <i class="fas ${o.orderType === 'dine-in' ? 'fa-utensils' : o.orderType === 'takeaway' ? 'fa-bag-shopping' : 'fa-bell-concierge'} text-sm"></i>
          </div>
          <div>
            <p class="font-semibold text-sm">${o.orderNumber}</p>
            <p class="text-xs text-slate-400 capitalize">${o.orderType}${o.tableNumber ? ' · Table ' + o.tableNumber : ''}${o.roomNumber ? ' · Room ' + o.roomNumber : ''} · ${formatTime(o.createdAt)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${orderBadge(o.status)}">${o.status}</span>
          <span class="font-bold text-sm text-brand-600">${formatCurrency(o.totalAmount)}</span>
        </div>
      </div>
      <div class="bg-slate-50 rounded-xl p-3 mb-3">
        ${o.items.map(i => `<div class="flex justify-between text-sm py-0.5"><span class="text-slate-500">${i.quantity}× ${i.name}</span><span class="font-medium">${formatCurrency(i.subtotal)}</span></div>`).join('')}
      </div>
      <div class="flex items-center justify-between">
        <p class="text-xs text-slate-400 truncate max-w-[50%]">${o.customerName}${o.notes ? ' · ' + o.notes : ''}</p>
        <div class="flex gap-1.5">
          ${o.status === 'pending' ? `<button onclick="updateOrderStatus('${o.id}','preparing')" class="text-xs bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 font-medium transition">Preparing</button>` : ''}
          ${o.status === 'preparing' ? `<button onclick="updateOrderStatus('${o.id}','ready')" class="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 font-medium transition">Ready</button>` : ''}
          ${o.status === 'ready' ? `<button onclick="updateOrderStatus('${o.id}','delivered')" class="text-xs bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 font-medium transition">Delivered</button>` : ''}
          ${['pending', 'preparing'].includes(o.status) ? `<button onclick="confirmAction('Cancel Order', 'Cancel order ${o.orderNumber}?', 'fa-times', 'Cancel Order', () => updateOrderStatus('${o.id}','cancelled'))" class="text-xs bg-red-50 text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition">Cancel</button>` : ''}
        </div>
      </div>
    </div>`).join('');
}

async function updateOrderStatus(id, status) {
  try {
    await fetch(API + '/api/orders/' + id + '/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast('Order ' + status);
    loadOrders();
    loadDashboard();
  } catch (e) {
    showToast('Update failed', true);
  }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  showView('dashboard');
  // Date validation: auto-set min check-out
  document.getElementById('check-in')?.addEventListener('change', function () {
    const out = document.getElementById('check-out');
    if (out) {
      out.min = this.value;
      if (out.value && out.value <= this.value) out.value = '';
    }
  });
  // Auto-refresh every 15s
  setInterval(() => {
    const a = document.querySelector('.view.active');
    if (!a) return;
    const id = a.id.replace('view-', '');
    if (id === 'dashboard') loadDashboard();
    if (id === 'orders') loadOrders();
    if (id === 'rooms') loadRooms();
  }, 15000);
});
