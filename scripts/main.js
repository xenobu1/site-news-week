// Регистрация Service Worker
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Обработчик прокрутки для меню
document.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const menuToggle = document.getElementById('menu__toggle');
    
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Закрываем мобильное меню при прокрутке
    if (menuToggle && menuToggle.checked) {
        menuToggle.checked = false;
    }
});

// Виджет курсов валют
class CurrencyWidget {
    constructor() {
        // Проверяем, не мобильное ли устройство
        if (window.innerWidth <= 768) {
            return; // Не создаем виджет на мобильных устройствах
        }

        this.currencies = {
            'Steam': 'USD',
            'Epic Games': 'USD',
            'PS Store': 'EUR',
            'Xbox Store': 'USD'
        };
        this.widget = this.createWidget();
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        
        this.setupDragListeners();
        this.updateRates();
        setInterval(() => this.updateRates(), 300000);
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'currency-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <h3>Курсы валют</h3>
                <div class="close-widget">✕</div>
            </div>
            <div id="currency-list"></div>
        `;
        document.body.appendChild(widget);

        // Добавляем обработчик для кнопки закрытия
        const closeBtn = widget.querySelector('.close-widget');
        closeBtn.addEventListener('click', () => {
            widget.style.display = 'none';
        });

        return widget;
    }

    setupDragListeners() {
        this.widget.addEventListener('mousedown', (e) => this.dragStart(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.dragEnd());
    }

    dragStart(e) {
        if (e.target.closest('.widget-header')) {
            this.isDragging = true;
            this.widget.classList.add('dragging');
            this.initialX = e.clientX - this.xOffset;
            this.initialY = e.clientY - this.yOffset;
        }
    }

    drag(e) {
        if (this.isDragging) {
            e.preventDefault();
            requestAnimationFrame(() => {
                this.currentX = e.clientX - this.initialX;
                this.currentY = e.clientY - this.initialY;

                this.xOffset = this.currentX;
                this.yOffset = this.currentY;

                this.widget.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
            });
        }
    }

    dragEnd() {
        this.isDragging = false;
        this.widget.classList.remove('dragging');
    }

    async updateRates() {
        try {
            const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
            const data = await response.json();
            
            const currencyList = document.getElementById('currency-list');
            currencyList.innerHTML = '';

            for (const [store, currency] of Object.entries(this.currencies)) {
                const rate = data.Valute[currency];
                const change = rate.Value - rate.Previous;
                const changeClass = change >= 0 ? 'up' : 'down';
                const changeSymbol = change >= 0 ? '↑' : '↓';

                currencyList.innerHTML += `
                    <div class="currency-item">
                        <span class="currency-name">${store}</span>
                        <div>
                            <span class="currency-value">${rate.Value.toFixed(2)}₽</span>
                            <span class="currency-change ${changeClass}">${changeSymbol}${Math.abs(change).toFixed(2)}</span>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Ошибка при получении курсов валют:', error);
        }
    }
}

// Инициализация виджета
document.addEventListener('DOMContentLoaded', () => {
    new CurrencyWidget();
}); 