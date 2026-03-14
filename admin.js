let localConfig = [...surveyConfig];
let tempOptions = [];

const inputId = document.getElementById('new-id');
const inputQuestion = document.getElementById('new-question');
const inputType = document.getElementById('new-type');
const inputReq = document.getElementById('new-req');
const previewContainer = document.getElementById('live-preview-container');

// --- INITIALISATION ---
function init() {
    renderList();
    updateLogicSelectors();
    setupListeners();
}

function setupListeners() {
    [inputId, inputQuestion, inputType, inputReq].forEach(el => {
        el.addEventListener('input', () => {
            toggleOptionsSection();
            updatePreview();
        });
    });
}

function toggleOptionsSection() {
    const hasOptions = ['select', 'radio'].includes(inputType.value);
    document.getElementById('options-section').style.display = hasOptions ? 'block' : 'none';
}

// --- GESTION DES OPTIONS ---
function addOptionToTempList() {
    const val = document.getElementById('option-input').value.trim();
    if(val) {
        tempOptions.push(val);
        document.getElementById('option-input').value = "";
        renderTempOptions();
        updatePreview();
    }
}

function renderTempOptions() {
    const container = document.getElementById('temp-options-list');
    container.innerHTML = tempOptions.map((opt, i) => `
        <div class="option-badge">${opt} <span onclick="removeTempOption(${i})">×</span></div>
    `).join('');
}

function removeTempOption(i) {
    tempOptions.splice(i, 1);
    renderTempOptions();
    updatePreview();
}

// --- LOGIQUE CONDITIONNELLE ---
function updateLogicSelectors() {
    const parentSelect = document.getElementById('logic-parent');
    parentSelect.innerHTML = '<option value="">-- Toujours afficher --</option>';
    localConfig.forEach(q => {
        if(['select', 'radio'].includes(q.type)) {
            parentSelect.innerHTML += `<option value="${q.id}">${q.question} (${q.id})</option>`;
        }
    });
}

function updateLogicValues() {
    const parentId = document.getElementById('logic-parent').value;
    const container = document.getElementById('logic-value-container');
    const valSelect = document.getElementById('logic-value');
    
    if(!parentId) { container.style.display = 'none'; return; }
    
    const parent = localConfig.find(q => q.id === parentId);
    if(parent && parent.options) {
        valSelect.innerHTML = parent.options.map(o => `<option value="${o}">${o}</option>`).join('');
        container.style.display = 'block';
    }
}

// --- APERÇU ---
function updatePreview() {
    let html = `<label><strong>${inputQuestion.value || 'Ma question...'}</strong>${inputReq.checked ? ' *' : ''}</label>`;
    const type = inputType.value;

    if(type === 'select') {
        html += `<select disabled>${tempOptions.length ? tempOptions.map(o=>`<option>${o}</option>`).join('') : '<option>Options...</option>'}</select>`;
    } else if(type === 'radio') {
        html += tempOptions.map(o => `<div><input type="radio" disabled> ${o}</div>`).join('') || '<p>Ajoutez des options...</p>';
    } else {
        html += `<input type="${type}" disabled placeholder="Aperçu du champ">`;
    }
    previewContainer.innerHTML = html;
}

// --- ACTIONS ---
function addQuestion() {
    const q = {
        id: inputId.value,
        question: inputQuestion.value,
        type: inputType.value,
        required: inputReq.checked
    };
    if(tempOptions.length) q.options = [...tempOptions];
    
    const parentId = document.getElementById('logic-parent').value;
    if(parentId) {
        q.condition = { dependsOn: parentId, value: document.getElementById('logic-value').value };
    }

    localConfig.push(q);
    resetForm();
    renderList();
    updateLogicSelectors();
}

function removeQuestion(i) {
    localConfig.splice(i, 1);
    renderList();
    updateLogicSelectors();
}

function resetForm() {
    inputId.value = ""; inputQuestion.value = ""; tempOptions = [];
    renderTempOptions(); updatePreview();
}

function renderList() {
    const list = document.getElementById('questions-list');
    list.innerHTML = localConfig.map((q, i) => `
        <div class="q-item">
            <span>${i+1}. <strong>${q.id}</strong></span>
            <button class="btn-delete" onclick="removeQuestion(${i})">🗑️</button>
        </div>
    `).join('');
    document.getElementById('output-code').textContent = `const surveyConfig = ${JSON.stringify(localConfig, null, 4)};`;
}

function copyCode() {
    navigator.clipboard.writeText(document.getElementById('output-code').textContent);
    alert("Code copié ! Collez-le dans votre fichier config.js sur GitHub.");
}

init();
