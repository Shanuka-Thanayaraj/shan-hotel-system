const API = '';
let cart = [], allRooms = [], allOrders = [], allMenu = [], currentCategory = 'all';

function formatCurrency(n) { return 'Rs. ' + (n||0).toLocaleString('en-LK'); }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '-'; }
function formatTime(d) { return d ? new Date(d).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : ''; }

function showToast(msg, err) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  document.getElementById('toast-icon').className = err ? 'fas fa-exclamation-circle text-red-400' : 'fas fa-check-circle text-emerald-400';
  t.classList.remove('translate-y-20','opacity-0');
  setTimeout(() => t.classList.add('translate-y-20','opacity-0'), 2800);
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
  const m = { confirmed:'bg-blue-50 text-blue-600', 'checked-in':'bg-emerald-50 text-emerald-600', 'checked-out':'bg-slate-100 text-slate-500', cancelled:'bg-red-50 text-red-500' };
  return m[s] || 'bg-slate-100 text-slate-500';
}
function orderBadge(s) {
  const m = { pending:'bg-amber-50 text-amber-600', preparing:'bg-blue-50 text-blue-600', ready:'bg-emerald-50 text-emerald-600', delivered:'bg-slate-100 text-slate-500', cancelled:'bg-red-50 text-red-500' };
  return m[s] || 'bg-slate-100 text-slate-500';
}

async function loadDashboard() {
  try {
    const [stats, bookings, orders] = await Promise.all([
      fetch(API+'/api/stats').then(r=>r.json()),
      fetch(API+'/api/bookings').then(r=>r.json()),
      fetch(API+'/api/orders').then(r=>r.json())
    ]);
    document.getElementById('stats-grid').innerHTML = `
      <div class="bg-white rounded-xl border border-slate-200 p-4 card shadow-sm">
        <p class="text-[11px] text-slate-400 font-semibold uppercase">Available</p>
        <p class="text-2xl font-bold text-emerald-500 mt-1">${stats.availableRooms}<span class="text-sm text-slate-300 font-normal">/${stats.totalRooms}</span></p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 card shadow-sm">
        <p class="text-[11px] text-slate-400 font-semibold uppercase">Occupied</p>
        <p class="text-2xl font-bold text-blue-500 mt-1">${stats.occupiedRooms}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 card shadow-sm">
        <p class="text-[11px] text-slate-400 font-semibold uppercase">Pending Orders</p>
        <p class="text-2xl font-bold text-amber-500 mt-1">${stats.pendingOrders}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 card shadow-sm">
        <p class="text-[11px] text-slate-400 font-semibold uppercase">Today Revenue</p>
        <p class="text-xl font-bold text-brand-500 mt-1">${formatCurrency(stats.todayRevenue)}</p>
      </div>`;

    const rb = bookings.slice(-5).reverse();
    document.getElementById('recent-bookings').innerHTML = rb.length ? rb.map(b => `
      <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
        <div><p class="text-sm font-medium">${b.guestName}</p><p class="text-xs text-slate-400">Room ${b.roomNumber} · ${formatDate(b.checkIn)}</p></div>
        <span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${statusBadge(b.status)}">${b.status}</span>
      </div>`).join('') : '<p class="text-slate-300 text-sm text-center py-6">No bookings yet</p>';

    const lo = orders.filter(o => ['pending','preparing','ready'].includes(o.status)).slice(0,6);
    document.getElementById('live-orders').innerHTML = lo.length ? lo.map(o => `
      <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
        <div><p class="text-sm font-medium">${o.orderNumber}</p><p class="text-xs text-slate-400">${o.items.length} items · ${formatCurrency(o.totalAmount)}</p></div>
        <span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${orderBadge(o.status)}">${o.status}</span>
      </div>`).join('') : '<p class="text-slate-300 text-sm text-center py-6">No active orders</p>';
  } catch(e) { showToast('Failed to load', true); }
}

async function loadRooms() {
  try {
    allRooms = await fetch(API+'/api/rooms').then(r=>r.json());
    renderRooms(allRooms);
  } catch(e) { showToast('Failed to load rooms', true); }
}

function filterRooms() {
  const f = document.getElementById('room-filter').value;
  renderRooms(f==='all' ? allRooms : allRooms.filter(r=>r.status===f));
}

function renderRooms(rooms) {
  document.getElementById('rooms-grid').innerHTML = rooms.map(r => `
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden card shadow-sm">
      <div class="h-2 ${r.status==='available'?'bg-emerald-400':r.status==='booked'?'bg-blue-400':'bg-amber-400'}"></div>
      <div class="p-4">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h3 class="font-semibold text-slate-800">Room ${r.number}</h3>
            <p class="text-sm text-brand-500 font-medium">${r.type}</p>
          </div>
          <span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${r.status==='available'?'bg-emerald-50 text-emerald-600':r.status==='booked'?'bg-blue-50 text-blue-600':'bg-amber-50 text-amber-600'}">${r.status}</span>
        </div>
        <p class="text-lg font-bold text-slate-800">${formatCurrency(r.price)}<span class="text-xs text-slate-400 font-normal"> /night</span></p>
        <p class="text-xs text-slate-400 mt-1"><i class="fas fa-users mr-1"></i>${r.capacity} guests · Floor ${r.floor}</p>
        <div class="flex flex-wrap gap-1 mt-2">
          ${r.amenities.slice(0,3).map(a=>`<span class="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">${a}</span>`).join('')}
        </div>
      </div>
    </div>`).join('');
}

async function loadBookings() {
  try {
    const bookings = await fetch(API+'/api/bookings').then(r=>r.json());
    const tbody = document.getElementById('bookings-table');
    if (!bookings.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-12 text-slate-300">No bookings yet</td></tr>';
      return;
    }
    tbody.innerHTML = bookings.slice().reverse().map(b => `
      <tr class="hover:bg-slate-50 transition">
        <td class="px-4 py-3"><p class="font-medium text-sm">${b.guestName}</p><p class="text-xs text-slate-400">${b.guestPhone}</p></td>
        <td class="px-4 py-3"><p class="font-medium text-sm">${b.roomNumber}</p><p class="text-xs text-slate-400">${b.roomType}</p></td>
        <td class="px-4 py-3 text-slate-500 text-sm">${formatDate(b.checkIn)}</td>
        <td class="px-4 py-3 text-slate-500 text-sm">${formatDate(b.checkOut)}</td>
        <td class="px-4 py-3 font-semibold text-sm text-brand-600">${formatCurrency(b.totalAmount)}</td>
        <td class="px-4 py-3"><span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${statusBadge(b.status)}">${b.status}</span></td>
        <td class="px-4 py-3">
          <div class="flex gap-1">
            ${b.status==='confirmed'?`<button onclick="updateBookingStatus('${b.id}','checked-in')" class="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md hover:bg-emerald-100" title="Check In"><i class="fas fa-sign-in-alt"></i></button>`:''}
            ${b.status==='checked-in'?`<button onclick="updateBookingStatus('${b.id}','checked-out')" class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md hover:bg-slate-200" title="Check Out"><i class="fas fa-sign-out-alt"></i></button>`:''}
            ${b.status==='confirmed'||b.status==='checked-in'?`<button onclick="updateBookingStatus('${b.id}','cancelled')" class="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-100" title="Cancel"><i class="fas fa-times"></i></button>`:''}
          </div>
        </td>
      </tr>`).join('');
  } catch(e) { showToast('Failed to load bookings', true); }
}

async function updateBookingStatus(id, status) {
  try {
    await fetch(API+'/api/bookings/'+id+'/status', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status}) });
    showToast('Booking '+status);
    loadBookings(); loadRooms();
  } catch(e) { showToast('Update failed', true); }
}

function openBookingModal() {
  const sel = document.getElementById('booking-room');
  const avail = allRooms.filter(r=>r.status==='available');
  if (!allRooms.length) loadRooms().then(()=>{
    const a = allRooms.filter(r=>r.status==='available');
    sel.innerHTML = '<option value="">Choose room...</option>'+a.map(r=>`<option value="${r.id}">Room ${r.number} - ${r.type} (${formatCurrency(r.price)})</option>`).join('');
  });
  else sel.innerHTML = '<option value="">Choose room...</option>'+avail.map(r=>`<option value="${r.id}">Room ${r.number} - ${r.type} (${formatCurrency(r.price)})</option>`).join('');
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
  try {
    const res = await fetch(API+'/api/bookings', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        roomId: document.getElementById('booking-room').value,
        guestName: document.getElementById('guest-name').value,
        guestPhone: document.getElementById('guest-phone').value,
        guestEmail: document.getElementById('guest-email').value,
        checkIn: document.getElementById('check-in').value,
        checkOut: document.getElementById('check-out').value,
        adults: +document.getElementById('adults').value||1,
        children: +document.getElementById('children').value||0,
        specialRequests: document.getElementById('special-requests').value
      })
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error||'Failed'); }
    showToast('Booking confirmed!');
    closeBookingModal();
    loadBookings(); loadRooms(); loadDashboard();
  } catch(e) { showToast(e.message||'Failed', true); }
}

async function loadMenu() {
  try {
    allMenu = await fetch(API+'/api/menu').then(r=>r.json());
    const cats = ['all', ...new Set(allMenu.map(m=>m.category))];
    document.getElementById('menu-categories').innerHTML = cats.map(c => `
      <button onclick="filterMenu('${c}')" class="category-btn px-3.5 py-1.5 rounded-full text-sm font-medium transition ${c===currentCategory?'bg-brand-500 text-white shadow-sm':'bg-white border border-slate-200 text-slate-500 hover:border-brand-300'}" data-cat="${c}">${c==='all'?'All':c}</button>
    `).join('');
    renderMenu(allMenu);
  } catch(e) { showToast('Failed to load menu', true); }
}

function filterMenu(cat) {
  currentCategory = cat;
  document.querySelectorAll('.category-btn').forEach(b => {
    const on = b.dataset.cat === cat;
    b.className = `category-btn px-3.5 py-1.5 rounded-full text-sm font-medium transition ${on?'bg-brand-500 text-white shadow-sm':'bg-white border border-slate-200 text-slate-500 hover:border-brand-300'}`;
  });
  renderMenu(cat==='all'?allMenu:allMenu.filter(m=>m.category===cat));
}

function renderMenu(items) {
  document.getElementById('menu-grid').innerHTML = items.map(item => `
    <div class="bg-white rounded-xl border border-slate-200 p-4 card shadow-sm flex gap-3">
      <div class="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
        <i class="fas ${item.category==='Drinks'?'fa-glass-water':item.category==='Desserts'?'fa-ice-cream':item.category==='Appetizers'?'fa-leaf':'fa-utensils'} text-brand-500"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between gap-2">
          <h3 class="text-sm font-semibold text-slate-800 leading-tight">${item.name}</h3>
          <span class="text-[10px] px-1.5 py-0.5 rounded ${item.type==='veg'?'bg-emerald-50 text-emerald-600':'bg-red-50 text-red-500'} flex-shrink-0">${item.type==='veg'?'VEG':'NON'}</span>
        </div>
        <p class="text-xs text-slate-400 mt-0.5 line-clamp-1">${item.description}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="font-bold text-brand-600 text-sm">${formatCurrency(item.price)}</span>
          <button onclick="addToCart('${item.id}')" class="w-7 h-7 rounded-lg bg-brand-50 hover:bg-brand-500 text-brand-500 hover:text-white flex items-center justify-center transition"><i class="fas fa-plus text-xs"></i></button>
        </div>
      </div>
    </div>`).join('');
}

function addToCart(id) {
  const item = allMenu.find(m=>m.id===id);
  if (!item) return;
  const ex = cart.find(c=>c.id===id);
  if (ex) ex.quantity++; else cart.push({id:item.id,name:item.name,price:item.price,quantity:1});
  updateCartUI();
  showToast(item.name+' added');
}

function updateCartUI() {
  const n = cart.reduce((s,i)=>s+i.quantity,0);
  const b = document.getElementById('cart-count');
  if (n>0) { b.textContent=n; b.classList.remove('hidden'); } else b.classList.add('hidden');
}

function openCart() { renderCart(); document.getElementById('cart-modal').classList.add('open'); }
function closeCart() { document.getElementById('cart-modal').classList.remove('open'); }

function renderCart() {
  const c = document.getElementById('cart-items');
  if (!cart.length) { c.innerHTML='<p class="text-slate-300 text-sm text-center py-4">Cart is empty</p>'; document.getElementById('cart-total').textContent='Rs. 0'; return; }
  c.innerHTML = cart.map((item,i) => `
    <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50">
      <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate">${item.name}</p><p class="text-xs text-slate-400">${formatCurrency(item.price)} × ${item.quantity}</p></div>
      <div class="flex items-center gap-1.5">
        <button onclick="changeQty(${i},-1)" class="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-xs"><i class="fas fa-minus"></i></button>
        <span class="text-sm font-medium w-4 text-center">${item.quantity}</span>
        <button onclick="changeQty(${i},1)" class="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-xs"><i class="fas fa-plus"></i></button>
      </div>
    </div>`).join('');
  document.getElementById('cart-total').textContent = formatCurrency(cart.reduce((s,i)=>s+i.price*i.quantity,0));
}

function changeQty(i, d) {
  cart[i].quantity += d;
  if (cart[i].quantity<=0) cart.splice(i,1);
  updateCartUI(); renderCart();
}

function toggleOrderFields() {
  const t = document.getElementById('order-type').value;
  document.getElementById('table-field').classList.toggle('hidden', t!=='dine-in');
  document.getElementById('room-field').classList.toggle('hidden', t!=='room-service');
}

async function placeOrder() {
  if (!cart.length) { showToast('Cart is empty', true); return; }
  const type = document.getElementById('order-type').value;
  const table = document.getElementById('table-number').value;
  const room = document.getElementById('order-room-number').value;
  if (type==='dine-in'&&!table) { showToast('Enter table number', true); return; }
  if (type==='room-service'&&!room) { showToast('Enter room number', true); return; }
  try {
    const res = await fetch(API+'/api/orders', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        items: cart.map(c=>({id:c.id,quantity:c.quantity})),
        orderType: type,
        tableNumber: type==='dine-in'?table:null,
        roomNumber: type==='room-service'?room:null,
        customerName: document.getElementById('order-customer-name').value||'Guest',
        customerPhone: document.getElementById('order-customer-phone').value,
        notes: document.getElementById('order-notes').value
      })
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error||'Failed'); }
    const o = await res.json();
    showToast('Order '+o.orderNumber+' placed!');
    cart=[]; updateCartUI(); closeCart();
    ['table-number','order-room-number','order-customer-name','order-customer-phone','order-notes'].forEach(id=>document.getElementById(id).value='');
  } catch(e) { showToast(e.message||'Failed', true); }
}

async function loadOrders() {
  try {
    allOrders = await fetch(API+'/api/orders').then(r=>r.json());
    renderOrders(allOrders);
  } catch(e) { showToast('Failed to load orders', true); }
}

function filterOrders() {
  const f = document.getElementById('order-filter').value;
  renderOrders(f==='all'?allOrders:allOrders.filter(o=>o.status===f));
}

function renderOrders(orders) {
  const c = document.getElementById('orders-list');
  if (!orders.length) { c.innerHTML='<div class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-300">No orders yet</div>'; return; }
  c.innerHTML = orders.map(o => `
    <div class="bg-white rounded-xl border border-slate-200 p-4 card shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg ${o.orderType==='dine-in'?'bg-blue-50 text-blue-500':o.orderType==='takeaway'?'bg-purple-50 text-purple-500':'bg-amber-50 text-amber-500'} flex items-center justify-center">
            <i class="fas ${o.orderType==='dine-in'?'fa-utensils':o.orderType==='takeaway'?'fa-bag-shopping':'fa-bell-concierge'} text-sm"></i>
          </div>
          <div>
            <p class="font-semibold text-sm">${o.orderNumber}</p>
            <p class="text-xs text-slate-400 capitalize">${o.orderType}${o.tableNumber?' · Table '+o.tableNumber:''}${o.roomNumber?' · Room '+o.roomNumber:''} · ${formatTime(o.createdAt)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${orderBadge(o.status)}">${o.status}</span>
          <span class="font-bold text-sm text-brand-600">${formatCurrency(o.totalAmount)}</span>
        </div>
      </div>
      <div class="bg-slate-50 rounded-lg p-3 mb-3">
        ${o.items.map(i=>`<div class="flex justify-between text-sm py-0.5"><span class="text-slate-500">${i.quantity}× ${i.name}</span><span>${formatCurrency(i.subtotal)}</span></div>`).join('')}
      </div>
      <div class="flex items-center justify-between">
        <p class="text-xs text-slate-400">${o.customerName}${o.notes?' · '+o.notes:''}</p>
        <div class="flex gap-1">
          ${o.status==='pending'?`<button onclick="updateOrderStatus('${o.id}','preparing')" class="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md hover:bg-blue-100 font-medium">Preparing</button>`:''}
          ${o.status==='preparing'?`<button onclick="updateOrderStatus('${o.id}','ready')" class="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md hover:bg-emerald-100 font-medium">Ready</button>`:''}
          ${o.status==='ready'?`<button onclick="updateOrderStatus('${o.id}','delivered')" class="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md hover:bg-slate-200 font-medium">Delivered</button>`:''}
          ${['pending','preparing'].includes(o.status)?`<button onclick="updateOrderStatus('${o.id}','cancelled')" class="text-xs bg-red-50 text-red-500 px-2.5 py-1 rounded-md hover:bg-red-100">Cancel</button>`:''}
        </div>
      </div>
    </div>`).join('');
}

async function updateOrderStatus(id, status) {
  try {
    await fetch(API+'/api/orders/'+id+'/status', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status}) });
    showToast('Order '+status);
    loadOrders();
  } catch(e) { showToast('Update failed', true); }
}

document.addEventListener('DOMContentLoaded', () => {
  showView('dashboard');
  setInterval(() => {
    const a = document.querySelector('.view.active');
    if (!a) return;
    const id = a.id.replace('view-','');
    if (id==='dashboard') loadDashboard();
    if (id==='orders') loadOrders();
    if (id==='rooms') loadRooms();
  }, 15000);
});
