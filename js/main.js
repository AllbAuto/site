// ===================================================
// main.js — логика главной страницы
// ===================================================

async function loadConfig() {
    let cfg = null;
    try {
        const saved = localStorage.getItem('siteConfig');
        if (saved) cfg = JSON.parse(saved);
    } catch (e) {}

    if (!cfg) {
        try {
            const res = await fetch('data/config.json');
            cfg = await res.json();
        } catch (e) { return; }
    }

    const headerPhone = document.getElementById('header-phone');
    const footerPhone = document.getElementById('footer-phone');
    if (headerPhone && cfg.phone) { headerPhone.textContent = cfg.phone; headerPhone.href = 'tel:' + (cfg.phoneRaw || ''); }
    if (footerPhone && cfg.phone) { footerPhone.textContent = cfg.phone; footerPhone.href = 'tel:' + (cfg.phoneRaw || ''); }

    let messengersHTML = '';
    if (cfg.whatsapp) messengersHTML += `<a href="${cfg.whatsapp}" target="_blank" class="btn-messenger wa">WhatsApp</a>`;
    if (cfg.telegram) messengersHTML += `<a href="${cfg.telegram}" target="_blank" class="btn-messenger tg">Telegram</a>`;

    const hMess = document.getElementById('header-messengers');
    const fMess = document.getElementById('footer-messengers');
    if (hMess) hMess.innerHTML = messengersHTML;
    if (fMess) fMess.innerHTML = messengersHTML;
}

let allCars = [];

async function loadCars() {
    let cars = null;
    try {
        const saved = localStorage.getItem('siteCars');
        if (saved) cars = JSON.parse(saved);
    } catch (e) {}

    if (!cars) {
        try {
            const res = await fetch('data/cars.json');
            cars = await res.json();
        } catch (e) { return; }
    }
    allCars = cars || [];
    renderCars(allCars);
}

function renderCars(cars) {
    const grid = document.getElementById('cars-grid');
    if (!grid) return;
    if (!cars.length) { grid.innerHTML = '<p>Автомобили не найдены</p>'; return; }

    grid.innerHTML = cars.map(car => `
        <article class="car-card">
            <img src="${car.image || 'images/placeholder.jpg'}" alt="${car.brand}" class="car-card__img" onerror="this.style.display='none'">
            <div class="car-card__body">
                <h3 class="car-card__title">${car.brand} ${car.model}</h3>
                <ul class="car-card__specs">
                    <li>📅 ${car.year}</li>
                    <li>⚙️ ${car.transmission}</li>
                    <li>⛽ ${car.engine}</li>
                    <li>🛣 ${car.mileage}</li>
                </ul>
                <div class="car-card__price">${car.price}</div>
                <!-- ВОТ ЗДЕСЬ МЫ ИСПРАВИЛИ ССЫЛКУ НА КАРТОЧКУ -->
                <a href="car.html?id=${car.id}" class="btn btn--primary">Узнать подробнее</a>
            </div>
        </article>
    `).join('');
}

function initFilters() {
    const search = document.getElementById('search');
    const brandFilter = document.getElementById('filter-brand');
    if (!search || !brandFilter) return;

    function applyFilters() {
        let filtered = allCars;
        const q = search.value.toLowerCase().trim();
        const brand = brandFilter.value;
        if (q) filtered = filtered.filter(c => (c.brand + ' ' + c.model).toLowerCase().includes(q));
        if (brand) filtered = filtered.filter(c => c.brand === brand);
        renderCars(filtered);
    }
    search.addEventListener('input', applyFilters);
    brandFilter.addEventListener('change', applyFilters);
}

function initLeadForm() {
    const form = document.getElementById('lead-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: form.elements['name'].value.trim(),
            phone: form.elements['phone'].value.trim(),
            car: form.elements['car']?.value.trim() || ''
        };

        if (!data.name || !data.phone) { alert('Укажите имя и телефон'); return; }

        try {
            await fetch(`https://api.telegram.org/bot8904142562:AAGa0h2V-DI64L4k2JztG1LgmhSpTrTUqds/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chat_id: '423251438',
                    text: `🚗 Новая заявка с сайта!\n\n👤 Имя: ${data.name}\n📞 Телефон: ${data.phone}\n🚘 Авто: ${data.car || 'не указано'}`
                })
            });
        } catch (err) {
            console.error('Ошибка отправки:', err);
        }

        alert(`Спасибо, ${data.name}! Мы свяжемся с вами.`);
        form.reset();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    loadCars();
    initFilters();
    initLeadForm();
});