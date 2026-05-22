/**
 * ИС «Контроль исполнения договоров»
 * Модуль логики приложения
 *
 * Функциональность:
 * - отображение реестра договоров;
 * - фильтрация по статусу;
 * - автоматическая подсветка просроченных договоров;
 * - добавление нового договора через форму;
 * - обновление статистики.
 */

'use strict';

// ============================================
// Демонстрационные данные
// ============================================

const STATUS_LABELS = {
    'new':         'Новый',
    'in-progress': 'В работе',
    'approval':    'На согласовании',
    'completed':   'Исполнен',
    'overdue':     'Просрочен'
};

/**
 * Набор демонстрационных договоров.
 * Даты подобраны так, чтобы среди них были просроченные.
 */
let contracts = [
    {
        number: 'ДГ-2025/001',
        contractor: 'ООО «ТехноСтрой»',
        startDate: '2025-01-15',
        dueDate: '2025-06-30',
        responsible: 'Иванов А.П.',
        status: 'completed'
    },
    {
        number: 'ДГ-2025/002',
        contractor: 'АО «СнабКомплект»',
        startDate: '2025-03-01',
        dueDate: '2025-12-31',
        responsible: 'Петрова Е.В.',
        status: 'in-progress'
    },
    {
        number: 'ДГ-2025/003',
        contractor: 'ИП Сидоров К.М.',
        startDate: '2025-02-10',
        dueDate: '2025-05-01',
        responsible: 'Козлов Д.И.',
        status: 'overdue'
    },
    {
        number: 'ДГ-2025/004',
        contractor: 'ООО «ИнфоСервис»',
        startDate: '2025-04-20',
        dueDate: '2026-04-20',
        responsible: 'Морозова Н.С.',
        status: 'new'
    },
    {
        number: 'ДГ-2025/005',
        contractor: 'ПАО «РусЭнерго»',
        startDate: '2025-05-01',
        dueDate: '2025-11-30',
        responsible: 'Белов А.А.',
        status: 'approval'
    },
    {
        number: 'ДГ-2026/006',
        contractor: 'ООО «ЛогистикПро»',
        startDate: '2026-01-10',
        dueDate: '2026-07-10',
        responsible: 'Новикова О.Л.',
        status: 'in-progress'
    },
    {
        number: 'ДГ-2025/007',
        contractor: 'АО «ПромИнвест»',
        startDate: '2025-06-01',
        dueDate: '2025-09-15',
        responsible: 'Фёдоров И.К.',
        status: 'overdue'
    },
    {
        number: 'ДГ-2026/008',
        contractor: 'ООО «Альфа-Консалт»',
        startDate: '2026-02-15',
        dueDate: '2026-08-15',
        responsible: 'Кузнецова М.Р.',
        status: 'new'
    },
    {
        number: 'ДГ-2026/009',
        contractor: 'ЗАО «СтройМонтаж»',
        startDate: '2026-03-01',
        dueDate: '2026-12-01',
        responsible: 'Соколов В.Н.',
        status: 'in-progress'
    },
    {
        number: 'ДГ-2026/010',
        contractor: 'ООО «ДатаЦентр»',
        startDate: '2026-04-01',
        dueDate: '2026-10-01',
        responsible: 'Григорьева Т.А.',
        status: 'approval'
    }
];

// ============================================
// DOM-элементы
// ============================================
const tableBody      = document.getElementById('contracts-body');
const filterButtons  = document.querySelectorAll('.filter-btn');
const contractForm   = document.getElementById('contract-form');
const statsTotal     = document.getElementById('stats-total');
const statsActive    = document.getElementById('stats-active');
const statsOverdue   = document.getElementById('stats-overdue');
const statsCompleted = document.getElementById('stats-completed');

// ============================================
// Текущий фильтр
// ============================================
let currentFilter = 'all';

// ============================================
// Функции
// ============================================

/**
 * Форматирует дату из ISO (yyyy-mm-dd) в формат дд.мм.гггг.
 * @param {string} dateStr — дата в формате ISO.
 * @returns {string} — дата в формате дд.мм.гггг.
 */
function formatDate(dateStr) {
    const parts = dateStr.split('-');
    return parts[2] + '.' + parts[1] + '.' + parts[0];
}

/**
 * Проверяет, просрочен ли договор по дате исполнения.
 * Договор считается просроченным, если срок исполнения прошёл
 * и статус не «исполнен».
 * @param {Object} contract — объект договора.
 * @returns {boolean}
 */
function isOverdue(contract) {
    if (contract.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(contract.dueDate);
    return due < today;
}

/**
 * Автоматически обновляет статус договора на «просрочен»,
 * если срок исполнения прошёл.
 */
function updateOverdueStatuses() {
    contracts.forEach(function (contract) {
        if (isOverdue(contract) && contract.status !== 'overdue') {
            contract.status = 'overdue';
        }
    });
}

/**
 * Обновляет статистические карточки.
 */
function updateStats() {
    const total     = contracts.length;
    const active    = contracts.filter(function (c) { return c.status === 'in-progress'; }).length;
    const overdue   = contracts.filter(function (c) { return c.status === 'overdue'; }).length;
    const completed = contracts.filter(function (c) { return c.status === 'completed'; }).length;

    statsTotal.textContent     = total;
    statsActive.textContent    = active;
    statsOverdue.textContent   = overdue;
    statsCompleted.textContent = completed;
}

/**
 * Отрисовывает таблицу договоров с учётом текущего фильтра.
 */
function renderTable() {
    tableBody.innerHTML = '';

    const filtered = currentFilter === 'all'
        ? contracts
        : contracts.filter(function (c) { return c.status === currentFilter; });

    if (filtered.length === 0) {
        var emptyRow = document.createElement('tr');
        var emptyCell = document.createElement('td');
        emptyCell.colSpan = 6;
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '2rem';
        emptyCell.style.color = '#7f8c8d';
        emptyCell.textContent = 'Договоры не найдены';
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
        return;
    }

    filtered.forEach(function (contract) {
        var row = document.createElement('tr');

        // Подсветка просроченных строк
        if (contract.status === 'overdue') {
            row.classList.add('row--overdue');
        }

        row.innerHTML =
            '<td>' + contract.number + '</td>' +
            '<td>' + contract.contractor + '</td>' +
            '<td>' + formatDate(contract.startDate) + '</td>' +
            '<td>' + formatDate(contract.dueDate) + '</td>' +
            '<td>' + contract.responsible + '</td>' +
            '<td><span class="status-badge status-badge--' + contract.status + '">' +
                STATUS_LABELS[contract.status] +
            '</span></td>';

        tableBody.appendChild(row);
    });
}

/**
 * Обработчик нажатия кнопки фильтра.
 * @param {Event} event
 */
function handleFilterClick(event) {
    var btn = event.target;
    if (!btn.classList.contains('filter-btn')) return;

    // Снять активность со всех кнопок
    filterButtons.forEach(function (b) {
        b.classList.remove('filter-btn--active');
    });

    // Активировать выбранную
    btn.classList.add('filter-btn--active');
    currentFilter = btn.getAttribute('data-filter');
    renderTable();
}

/**
 * Обработчик отправки формы добавления договора.
 * @param {Event} event
 */
function handleFormSubmit(event) {
    event.preventDefault();

    var numberInput      = document.getElementById('contract-number');
    var contractorInput  = document.getElementById('contractor');
    var startDateInput   = document.getElementById('start-date');
    var dueDateInput     = document.getElementById('due-date');
    var responsibleInput = document.getElementById('responsible');
    var statusInput      = document.getElementById('status');

    var newContract = {
        number:      numberInput.value.trim(),
        contractor:  contractorInput.value.trim(),
        startDate:   startDateInput.value,
        dueDate:     dueDateInput.value,
        responsible: responsibleInput.value.trim(),
        status:      statusInput.value
    };

    contracts.push(newContract);

    // Сброс формы
    contractForm.reset();

    // Обновление отображения
    updateOverdueStatuses();
    updateStats();
    renderTable();
}

// ============================================
// Инициализация
// ============================================

// Привязка обработчиков фильтров
filterButtons.forEach(function (btn) {
    btn.addEventListener('click', handleFilterClick);
});

// Привязка обработчика формы
contractForm.addEventListener('submit', handleFormSubmit);

// Первичная отрисовка
updateOverdueStatuses();
updateStats();
renderTable();
