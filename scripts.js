// scripts.js - Manejo de pedidos y panel superadmin (usa localStorage)
(function () {
    const ORDER_KEY = 'cocteles_pedidos_v1';

    function qs(sel, ctx = document) { return ctx.querySelector(sel); }
    function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

    // Obtener nombres de cócteles desde el DOM
    function getCocktailsFromDOM() {
        const sections = qsa('main.cocteles > section');
        return sections.map(s => {
            const nameEl = s.querySelector('p');
            return nameEl ? nameEl.textContent.trim() : null;
        }).filter(Boolean);
    }

    // Poblar select
    function populateSelect() {
        const select = qs('#cocktail-select');
        const cocktails = getCocktailsFromDOM();
        cocktails.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            select.appendChild(opt);
        });
    }

    // Pedidos en localStorage
    function loadOrders() {
        try {
            return JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }
    function saveOrders(orders) {
        localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
    }

    function renderOrders() {
        const container = qs('#orders-list');
        const orders = loadOrders();
        container.innerHTML = '';
        if (!orders.length) {
            container.innerHTML = '<p>No hay pedidos</p>';
            return;
        }
        orders.slice().reverse().forEach(order => {
            const div = document.createElement('div');
            div.className = 'order-item';
            div.innerHTML = `<strong>${escapeHtml(order.cocktail)}</strong>
                <small>Pedido por: ${escapeHtml(order.name)} — ${new Date(order.t).toLocaleString()}</small>`;
            const del = document.createElement('button');
            del.textContent = 'Eliminar';
            del.style.marginLeft = '8px';
            del.addEventListener('click', () => {
                deleteOrder(order.id);
            });
            div.appendChild(del);
            container.appendChild(div);
        });
    }

    function deleteOrder(id) {
        const orders = loadOrders().filter(o => o.id !== id);
        saveOrders(orders);
        renderOrders();
    }

    function clearOrders() {
        localStorage.removeItem(ORDER_KEY);
        renderOrders();
    }

    function addOrder(name, cocktail) {
        const orders = loadOrders();
        const order = { id: Date.now() + '-' + Math.random().toString(36).slice(2,8), t: Date.now(), name, cocktail };
        orders.push(order);
        saveOrders(orders);
    }

    // Small helper
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
    }

    // Admin panel control (prompt simple)
    function openAdminPanel() {
        // contraseña simple; puedes cambiarla o implementar mejor método
        const pwd = prompt('Ingrese contraseña de superadmin:');
        if (pwd !== 'admin123') {
            alert('Contraseña incorrecta');
            return;
        }
        const panel = qs('#admin-panel');
        panel.style.display = 'block';
        panel.setAttribute('aria-hidden', 'false');
        renderOrders();
    }

    function closeAdminPanel() {
        const panel = qs('#admin-panel');
        panel.style.display = 'none';
        panel.setAttribute('aria-hidden', 'true');
    }

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        populateSelect();

        const form = qs('#order-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = qs('#customer-name').value.trim();
            const cocktail = qs('#cocktail-select').value;
            if (!name || !cocktail) return;
            addOrder(name, cocktail);
            qs('#order-msg').textContent = 'Pedido enviado. ¡Gracias!';
            form.reset();
            setTimeout(() => { qs('#order-msg').textContent = ''; }, 2500);
        });

        qs('#admin-btn').addEventListener('click', openAdminPanel);
        qs('#admin-close').addEventListener('click', closeAdminPanel);
        qs('#clear-orders').addEventListener('click', () => {
            if (confirm('¿Borrar todos los pedidos?')) clearOrders();
        });
    });
})();
