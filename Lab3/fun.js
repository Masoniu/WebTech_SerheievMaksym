let items = [
    { id: 1, name: 'Помідори', quantity: 2, bought: false, unavailable: true, editing: false },
    { id: 2, name: 'Печиво', quantity: 2, bought: false, unavailable: false, editing: false },
    { id: 3, name: 'Сир', quantity: 1, bought: false, unavailable: false, editing: false }
];

let nextId = 4;

const newItemInput = document.getElementById('newItemInput');
const addBtn = document.querySelector('.add-btn');
const itemsList = document.getElementById('itemsList');
const sidebar = document.querySelector('.sidebar');

function loadState() {
    const savedState = localStorage.getItem('buyListState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        items = parsedState.items || [];
        nextId = parsedState.nextId || 1;
    }
}

function saveState() {
    const state = {
        items: items,
        nextId: nextId
    };
    localStorage.setItem('buyListState', JSON.stringify(state));
}

function addItem() {
    const itemName = newItemInput.value.trim();
    if (itemName === '') return;
    const newItem = {
        id: nextId++,
        name: itemName,
        quantity: 1,
        bought: false,
        unavailable: false,
        editing: false
    };
    items.push(newItem);
    newItemInput.value = '';
    renderItems();
    renderSidebar();
    saveState();
}

function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    renderItems();
    renderSidebar();
    saveState();
}

function changeQuantity(id, delta) {
    const item = items.find(item => item.id === id);
    if (item && !item.bought) {
        item.quantity = Math.max(1, item.quantity + delta);
        renderItems();
        renderSidebar();
        saveState();
    }
}

function toggleBought(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        if (!item.bought) {
            item.originalQuantity = item.quantity;
            item.quantity = 0;
        } else {
            item.quantity = item.originalQuantity || 1;
            delete item.originalQuantity;
        }
        item.bought = !item.bought;
        renderItems();
        renderSidebar();
        saveState();
    }
}

function startEditing(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        item.editing = true;
        renderItems();
        saveState();
    }
}

function finishEditing(id, newName) {
    const item = items.find(item => item.id === id);
    if (item) {
        if (newName.trim() !== '') {
            item.name = newName.trim();
        }
        item.editing = false;
        renderItems();
        renderSidebar();
        saveState();
    }
}

function renderItems() {
    itemsList.innerHTML = '';
    
    items.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        
        let nameElement;
        if (item.editing) {
            nameElement = `<input type="text" class="edit-input" value="${item.name}" 
                            onblur="finishEditing(${item.id}, this.value)" 
                            onkeypress="if(event.key==='Enter') finishEditing(${item.id}, this.value)">`;
        } else {
            const nameClass = item.bought ? 'item-name unavailable' : 'item-name';
            nameElement = `<span class="${nameClass}" ondblclick="startEditing(${item.id})">${item.name}</span>`;
        }

        const quantityControls = `<div class="quantity-controls">
                ${!item.bought ? `<button class="quantity-btn minus ${item.quantity <= 1 || item.editing ? 'inactive' : ''}" 
                                data-tooltip="Зменшити кількість" 
                                onclick="changeQuantity(${item.id}, -1)" 
                                ${item.quantity <= 1 || item.editing ? 'disabled' : ''}>−</button>` : ''}
                <span class="quantity-display">${item.quantity}</span>
                ${!item.bought ? `<button class="quantity-btn plus ${item.editing ? 'inactive' : ''}" 
                                data-tooltip="Збільшити кількість" 
                                onclick="changeQuantity(${item.id}, 1)">+</button>` : ''} 
            </div>`;

        const statusBtn = `<button class="status-btn ${item.bought ? 'bought' : ''}" 
                    data-tooltip="${item.bought ? 'Позначити як не куплено' : 'Позначити як куплено'}"
                    onclick="toggleBought(${item.id})">
                    ${item.bought ? 'Куплено' : 'Не куплено'}
            </button>`;

        const deleteBtn = `<button class="delete-btn" data-tooltip="Видалити товар" onclick="deleteItem(${item.id})">×</button>`;

        itemRow.innerHTML = nameElement + quantityControls + '<div class="remo">' + statusBtn + deleteBtn + '</div>';
        itemsList.appendChild(itemRow);
    });
}

function renderSidebar() {
    const notBoughtItems = items.filter(item => !item.bought);
    const boughtItems = items.filter(item => item.bought);

    const remainingSection = sidebar.querySelector('.sidebar-section:first-of-type');
    remainingSection.innerHTML = '';
    
    notBoughtItems.forEach(item => {
        const sidebarItem = document.createElement('div');
        sidebarItem.className = 'sidebar-item';
        
        sidebarItem.innerHTML = `<span class="sidebar-item-name">${item.name}</span>
            <span class="sidebar-count">${item.quantity}</span>`;
        remainingSection.appendChild(sidebarItem);
    });


    const boughtSection = sidebar.querySelector('.sidebar-section:last-of-type');
    boughtSection.innerHTML = '';
    
    boughtItems.forEach(item => {
        const sidebarItem = document.createElement('div');
        sidebarItem.className = 'sidebar-item';
        
        const nameClass = item.bought ? 'sidebar-item-name unavailable' : 'sidebar-item-name';
        const countClass = item.bought ? 'sidebar-count unavailable' : 'sidebar-count';
        
        sidebarItem.innerHTML = `<span class="${nameClass}">${item.name}</span>
            <span class="${countClass}">${item.quantity}</span>`;
        boughtSection.appendChild(sidebarItem);
    });
}

addBtn.addEventListener('click', addItem);

newItemInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addItem();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    loadState();
    renderItems();
    renderSidebar();
});