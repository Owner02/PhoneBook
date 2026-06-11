// Модель контакта
class Contact {
    constructor(id, fullName, position, department, workPhone, mobilePhone, email) {
        this.id = id;
        this.fullName = fullName;
        this.position = position;
        this.department = department;
        this.workPhone = workPhone;
        this.mobilePhone = mobilePhone;
        this.email = email;
    }
}

// Хранилище (localStorage)
let contacts = [];

// Текущий редактируемый контакт (null = добавление)
let editingId = null;

// DOM элементы
const contactsBody = document.getElementById('contactsBody');
const searchInput = document.getElementById('searchInput');
const addNewBtn = document.getElementById('addNewBtn');
const contactFormDiv = document.getElementById('contactForm');
const formTitle = document.getElementById('formTitle');
const fullNameInput = document.getElementById('fullName');
const positionInput = document.getElementById('position');
const departmentInput = document.getElementById('department');
const workPhoneInput = document.getElementById('workPhone');
const mobilePhoneInput = document.getElementById('mobilePhone');
const emailInput = document.getElementById('email');
const saveContactBtn = document.getElementById('saveContactBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const formError = document.getElementById('formError');

// Загрузка данных из localStorage
function loadData() {
    const stored = localStorage.getItem('orgPhonebook');
    if (stored) {
        contacts = JSON.parse(stored);
    } else {
        // Демо-данные
        contacts = [
            new Contact(1, 'Анна Смирнова', 'Руководитель отдела', 'Администрация', '+7 (495) 123-45-67', '+7 (916) 111-22-33', 'a.smirnova@company.ru'),
            new Contact(2, 'Дмитрий Петров', 'Старший разработчик', 'IT', '+7 (495) 234-56-78', '+7 (903) 444-55-66', 'd.petrov@company.ru'),
            new Contact(3, 'Елена Козлова', 'Менеджер по персоналу', 'HR', '+7 (495) 345-67-89', '+7 (985) 777-88-99', 'e.kozlova@company.ru')
        ];
        saveToLocalStorage();
    }
    renderTable();
}

// Сохранить в localStorage
function saveToLocalStorage() {
    localStorage.setItem('orgPhonebook', JSON.stringify(contacts));
}

// Рендер таблицы с учетом поиска
function renderTable() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    let filtered = contacts;
    if (searchTerm) {
        filtered = contacts.filter(contact => 
            contact.fullName.toLowerCase().includes(searchTerm) ||
            (contact.position && contact.position.toLowerCase().includes(searchTerm)) ||
            (contact.department && contact.department.toLowerCase().includes(searchTerm)) ||
            (contact.workPhone && contact.workPhone.includes(searchTerm)) ||
            (contact.mobilePhone && contact.mobilePhone.includes(searchTerm)) ||
            (contact.email && contact.email.toLowerCase().includes(searchTerm))
        );
    }

    if (filtered.length === 0) {
        contactsBody.innerHTML = `<tr><td colspan="7" style="text-align:center">Контакты не найдены</td></tr>`;
        return;
    }

    let html = '';
    filtered.forEach(contact => {
        html += `
            <tr>
                <td>${escapeHtml(contact.fullName)}</td>
                <td>${escapeHtml(contact.position) || '—'}</td>
                <td>${escapeHtml(contact.department) || '—'}</td>
                <td>${escapeHtml(contact.workPhone) || '—'}</td>
                <td>${escapeHtml(contact.mobilePhone) || '—'}</td>
                <td>${escapeHtml(contact.email) || '—'}</td>
                <td class="actions">
                    <button class="btn btn-warning btn-sm" onclick="editContact(${contact.id})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteContact(${contact.id})">🗑️</button>
                </td>
            </tr>
        `;
    });
    contactsBody.innerHTML = html;
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Добавление/редактирование: показать форму
function showForm(editMode = false, contact = null) {
    contactFormDiv.classList.remove('hidden');
    if (editMode && contact) {
        formTitle.innerText = '✏️ Редактировать контакт';
        fullNameInput.value = contact.fullName;
        positionInput.value = contact.position || '';
        departmentInput.value = contact.department || '';
        workPhoneInput.value = contact.workPhone || '';
        mobilePhoneInput.value = contact.mobilePhone || '';
        emailInput.value = contact.email || '';
        editingId = contact.id;
    } else {
        formTitle.innerText = '➕ Добавить контакт';
        clearFormFields();
        editingId = null;
    }
    formError.innerText = '';
}

function clearFormFields() {
    fullNameInput.value = '';
    positionInput.value = '';
    departmentInput.value = '';
    workPhoneInput.value = '';
    mobilePhoneInput.value = '';
    emailInput.value = '';
}

function hideForm() {
    contactFormDiv.classList.add('hidden');
    editingId = null;
    clearFormFields();
    formError.innerText = '';
}

// Валидация и сохранение
function saveContact() {
    const fullName = fullNameInput.value.trim();
    if (!fullName) {
        formError.innerText = 'Ошибка: ФИО обязательно для заполнения.';
        return;
    }
    const workPhone = workPhoneInput.value.trim();
    const mobilePhone = mobilePhoneInput.value.trim();
    if (!workPhone && !mobilePhone) {
        formError.innerText = 'Ошибка: укажите хотя бы один телефон (рабочий или мобильный).';
        return;
    }

    const newContactData = {
        fullName: fullName,
        position: positionInput.value.trim(),
        department: departmentInput.value.trim(),
        workPhone: workPhone,
        mobilePhone: mobilePhone,
        email: emailInput.value.trim()
    };

    if (editingId !== null) {
        // Редактирование
        const index = contacts.findIndex(c => c.id === editingId);
        if (index !== -1) {
            contacts[index] = { ...contacts[index], ...newContactData };
            saveToLocalStorage();
            renderTable();
            hideForm();
        } else {
            formError.innerText = 'Контакт не найден.';
        }
    } else {
        // Добавление нового — генерируем новый ID
        const maxId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) : 0;
        const newContact = new Contact(
            maxId + 1,
            newContactData.fullName,
            newContactData.position,
            newContactData.department,
            newContactData.workPhone,
            newContactData.mobilePhone,
            newContactData.email
        );
        contacts.push(newContact);
        saveToLocalStorage();
        renderTable();
        hideForm();
    }
}

// Редактирование (вызывается из таблицы)
window.editContact = function(id) {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
        showForm(true, contact);
    } else {
        alert('Контакт не найден');
    }
};

// Удаление
window.deleteContact = function(id) {
    if (confirm('Вы уверены, что хотите удалить этот контакт?')) {
        contacts = contacts.filter(c => c.id !== id);
        saveToLocalStorage();
        renderTable();
        if (editingId === id) {
            hideForm();
        }
    }
};

// Обработчики событий
addNewBtn.addEventListener('click', () => showForm(false));
saveContactBtn.addEventListener('click', saveContact);
cancelFormBtn.addEventListener('click', hideForm);
searchInput.addEventListener('input', () => renderTable());

// Инициализация
loadData();
