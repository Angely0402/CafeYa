// Base de datos simulada del catálogo de CaféYa
const menuProducts = [
    { id: 1, name: "Espresso Intenso", category: "calientes", price: 5500, img: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500", desc: "Café de origen colombiano con notas a chocolate amargo y cuerpo denso." },
    { id: 2, name: "Cappuccino Clásico", category: "calientes", price: 7800, img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500", desc: "Espresso doble con leche texturizada en microespuma y toque de cacao." },
    { id: 3, name: "Latte Avellana", category: "calientes", price: 8900, img: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=500", desc: "Suave mezcla de espresso, leche cremosa y jarabe artesanal de avellanas." },
    { id: 4, name: "Cold Brew Tonic", category: "frios", price: 9200, img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500", desc: "Café extraído en frío durante 18 horas, combinado con agua tónica y cítricos." },
    { id: 5, name: "Iced Caramel Latte", category: "frios", price: 9500, img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500", desc: "Espresso doble sobre hielo, leche fría y caramelo salado artesanal." },
    { id: 6, name: "Croissant de Mantequilla", category: "pasteleria", price: 6500, img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500", desc: "Hojaldre francés crujiente horneado al amanecer con mantequilla pura." }
];

let cart = [];
let currentUser = null;
let currentSelectedProduct = null;
let countdownInterval = null;

// Sistema de navegación SPA
function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active-view'));
    document.getElementById(viewId).classList.add('active-view');
    
    if (viewId === 'menu-view') renderMenu(menuProducts);
    if (viewId === 'cart-view') renderCart();
    if (viewId === 'payment-view') renderPaymentForm('Nequi');
}

// Pestañas de Autenticación
function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('signup-form').classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    currentUser = email.split('@')[0];
    document.getElementById('welcome-user-name').innerText = `Hola, ${currentUser}`;
    showToast("¡Bienvenido de nuevo a CaféYa!");
    navigateTo('menu-view');
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    currentUser = name;
    document.getElementById('welcome-user-name').innerText = `Hola, ${currentUser}`;
    showToast("¡Cuenta creada con éxito!");
    navigateTo('menu-view');
}

function quickLogin(method) {
    currentUser = method === 'Google' ? 'Usuario Google' : 'Usuario Biométrico';
    document.getElementById('welcome-user-name').innerText = `Hola, ${currentUser}`;
    showToast(`Acceso exitoso vía ${method}`);
    navigateTo('menu-view');
}

function logout() {
    currentUser = null;
    cart = [];
    document.getElementById('cart-counter').innerText = '0';
    navigateTo('auth-view');
    showToast("Sesión cerrada correctamente.");
}

// Renderizado del Menú
function renderMenu(products) {
    const container = document.getElementById('menu-items-container');
    container.innerHTML = products.map(p => `
        <div class="menu-card" onclick="openProductDetail(${p.id})">
            <img src="${p.img}" alt="${p.name}">
            <h4>${p.name}</h4>
            <span class="price">$${p.price.toLocaleString()}</span>
        </div>
    `).join('');
}

function filterCategory(category, element) {
    document.querySelectorAll('.cat-pill').forEach(pill => pill.classList.remove('active'));
    element.classList.add('active');
    
    if (category === 'all') {
        renderMenu(menuProducts);
    } else {
        const filtered = menuProducts.filter(p => p.category === category);
        renderMenu(filtered);
    }
}

function filterMenu() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = menuProducts.filter(p => p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query));
    renderMenu(filtered);
}

// Detalle de Producto y Personalización
function openProductDetail(id) {
    currentSelectedProduct = menuProducts.find(p => p.id === id);
    const container = document.getElementById('detail-card-content');
    
    container.innerHTML = `
        <img src="${currentSelectedProduct.img}" alt="${currentSelectedProduct.name}">
        <h2>${currentSelectedProduct.name}</h2>
        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 12px;">${currentSelectedProduct.desc}</p>
        <h3 style="color: var(--primary-brown); margin-bottom: 16px;">$${currentSelectedProduct.price.toLocaleString()}</h3>
        
        <div class="product-options">
            <h4>Tamaño</h4>
            <div class="options-group" id="size-options">
                <div class="opt-pill selected" onclick="selectOption(this, 'size')">Regular (12oz)</div>
                <div class="opt-pill" onclick="selectOption(this, 'size')">Grande (+16oz)</div>
            </div>
            
            <h4>Tipo de Leche</h4>
            <div class="options-group" id="milk-options">
                <div class="opt-pill selected" onclick="selectOption(this, 'milk')">Entera</div>
                <div class="opt-pill" onclick="selectOption(this, 'milk')">Deslactosada</div>
                <div class="opt-pill" onclick="selectOption(this, 'milk')">Almendra</div>
            </div>
        </div>

        <button class="btn-primary" style="width:100%; margin-top:20px;" onclick="addToCart()">Agregar al Pedido</button>
    `;
    navigateTo('product-detail-view');
}

function selectOption(element, groupName) {
    const parent = element.parentElement;
    parent.querySelectorAll('.opt-pill').forEach(pill => pill.classList.remove('selected'));
    element.classList.add('selected');
}

function addToCart() {
    const size = document.querySelector('#size-options .selected').innerText;
    const milk = document.querySelector('#milk-options .selected').innerText;
    
    cart.push({
        ...currentSelectedProduct,
        customization: `${size}, ${milk}`,
        cartId: Date.now()
    });

    document.getElementById('cart-counter').innerText = cart.length;
    showToast(`¡${currentSelectedProduct.name} agregado al carrito!`);
    navigateTo('menu-view');
}

// Gestión del Carrito
function renderCart() {
    const list = document.getElementById('cart-items-list');
    if (cart.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px;">Tu carrito está vacío.</p>`;
        document.getElementById('cart-subtotal').innerText = '$0';
        document.getElementById('cart-total').innerText = '$0';
        return;
    }

    list.innerHTML = cart.map(item => `
        <div class="cart-item-row">
            <div>
                <h4 style="font-size:14px; color:var(--primary-brown);">${item.name}</h4>
                <small style="color:var(--text-muted);">${item.customization}</small>
                <div style="font-weight:700; font-size:13px; color:var(--secondary-brown); margin-top:4px;">$${item.price.toLocaleString()}</div>
            </div>
            <button onclick="removeFromCart(${item.cartId})" style="background:none; border:none; color:#E07A5F; cursor:pointer; font-size:16px;"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');

    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    document.getElementById('cart-subtotal').innerText = `$${subtotal.toLocaleString()}`;
    document.getElementById('cart-total').innerText = `$${subtotal.toLocaleString()}`;
}

function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    document.getElementById('cart-counter').innerText = cart.length;
    renderCart();
}

// Pasarela de Pago
function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-method-card').forEach(card => card.classList.remove('active'));
    event.currentTarget.classList.add('active');
    renderPaymentForm(method);
}

function renderPaymentForm(method) {
    const container = document.getElementById('payment-form-dynamic');
    if (method === 'Nequi') {
        container.innerHTML = `
            <div class="input-group">
                <label>Número de Celular Nequi</label>
                <input type="text" placeholder="300 000 0000" maxlength="10">
            </div>
        `;
    } else if (method === 'PSE') {
        container.innerHTML = `
            <div class="input-group">
                <label>Selecciona tu Banco</label>
                <select>
                    <option>Bancolombia</option>
                    <option>Banco de Bogotá</option>
                    <option>Davivienda</option>
                    <option>Nequi</option>
                </select>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="input-group">
                <label>Número de Tarjeta</label>
                <input type="text" placeholder="•••• •••• •••• ••••">
            </div>
            <div style="display:flex; gap:10px;">
                <div class="input-group"><label>Expiración</label><input type="text" placeholder="MM/AA"></div>
                <div class="input-group"><label>CVV</label><input type="text" placeholder="123"></div>
            </div>
        `;
    }
}

function processPayment() {
    if (cart.length === 0) {
        showToast("Agrega productos antes de pagar.");
        return;
    }
    navigateTo('status-view');
    startCountdown(480); // 8 minutos en segundos
}

// Temporizador y Simulación Push
function startCountdown(durationSeconds) {
    let timer = durationSeconds;
    const display = document.getElementById('countdown-timer');
    const statusText = document.getElementById('order-status-text');

    // Notificación Push inicial
    setTimeout(() => {
        showPushNotification("☕ ¡Pedido en preparación!", "Nuestros baristas ya están preparando tu café express.");
    }, 2000);

    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        let minutes = Math.floor(timer / 60);
        let seconds = timer % 60;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        // A los 4 minutos (240 segundos), cambia estado a Listo
        if (timer === 240) {
            statusText.textContent = "Listo para recoger";
            statusText.className = "status-badge ready";
            showPushNotification("🎉 ¡Tu café está listo!", "Pasa directo a la barra de la tienda sin hacer fila.");
        }

        if (--timer < 0) {
            clearInterval(countdownInterval);
            display.textContent = "00:00";
        }
    }, 1000);
}

function resetApp() {
    cart = [];
    document.getElementById('cart-counter').innerText = '0';
    navigateTo('menu-view');
}

// Sistema de Notificaciones Toast / Push
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showPushNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
    } else {
        // Fallback visual flotante estilo Push Notification
        const container = document.getElementById('toast-container');
        const push = document.createElement('div');
        push.className = 'toast';
        push.style.borderLeft = "4px solid #E07A5F";
        push.innerHTML = `<strong>${title}</strong><br><span style="font-size:11px; font-weight:400;">${body}</span>`;
        container.appendChild(push);

        setTimeout(() => {
            push.remove();
        }, 5000);
    }
}
