let localConfig = [...surveyConfig];
let tempOptions = [];

// Éléments
const inputId = document.getElementById('new-id');
const inputQuestion = document.getElementById('new-question');
const inputType = document.getElementById('new-type');
const inputReq = document.getElementById('new-req');
const previewContainer = document.getElementById('live-preview-container');

function init() {
    renderList();
    updateLogicSelectors();
    // Listeners pour l'aperçu
    [inputId, inputQuestion, inputType, inputReq].forEach(el => {
        el.addEventListener('input', () => {
            document.getElementById('options-section').style.display = ['select', 'radio'].includes(inputType.value) ? 'block' : 'none';
            updatePreview();
        });
    });
}

// Gestion des options de réponses
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
    document.getElementById('temp-options-list').innerHTML = tempOptions.map((opt, i) => `
        <div class="option-badge">${opt} <span onclick="removeTempOption(${i})">×</span></div>
    `).join('');
}

function removeTempOption(i) {
    tempOptions.splice(i, 1);
    renderTempOptions();
    updatePreview();
}

// Gestion des branchements conditionnels
function updateLogicSelectors() {
    const select = document.getElementById('logic-parent');
    select.innerHTML = '<option value="">-- Toujours afficher --</option>';
    localConfig.forEach(q => {
        if(['select', 'radio'].includes(q.type)) select.innerHTML += `<option value="${q.id}">${q.id}</option>`;
    });
}

function updateLogicValues() {
    const parentId = document.getElementById('logic-parent').value;
    const container = document.getElementById('logic-value-container');
    const listDiv = document.getElementById('logic-values-list');
    
    if(!parentId) { container.style.display = 'none'; return; }
    
    const parent = localConfig.find(q => q.id === parentId);
    if(parent && parent.options) {
        listDiv.innerHTML = parent.options.map(o => `<label><input type="checkbox" class="logic-check" value="${o}"> ${o}</label>`).join('');
        container.style.display = 'block';
    }
}

// Ajout définitif
function addQuestion() {
    const q = {
        id: inputId.value,
        question: inputQuestion.value,
        type: inputType.value,
        required: inputReq.checked
    };
    if(tempOptions.length) q.options = [...tempOptions];
    
    const parentId = document.getElementById('logic-parent').value;
    const selectedChecks = Array.from(document.querySelectorAll('.logic-check:checked')).map(cb => cb.value);

    if (parentId && selectedChecks.length > 0) {
        q.condition = { 
            dependsOn: parentId, 
            operator: document.getElementById('logic-operator').value, 
            value: selectedChecks 
        };
    }

    localConfig.push(q);
    renderList();
    updateLogicSelectors();
    // Reset
    inputId.value = ""; inputQuestion.value = ""; tempOptions = [];
    renderTempOptions();
}

function renderList() {
    document.getElementById('questions-list').innerHTML = localConfig.map((q, i) => `
        <div class="q-item"><span>${i+1}. <strong>${q.id}</strong></span> <button class="btn-delete" onclick="localConfig.splice(${i},1);renderList();">🗑️</button></div>
    `).join('');
    document.getElementById('output-code').textContent = `const surveyConfig = ${JSON.stringify(localConfig, null, 4)};`;
}

function copyCode() {
    navigator.clipboard.writeText(document.getElementById('output-code').textContent);
    alert("Code copié !");
}

function updatePreview() {
    previewContainer.innerHTML = `<label><strong>${inputQuestion.value || '...'}</strong></label><br><input type="${inputType.value}" disabled>`;
}

init();
