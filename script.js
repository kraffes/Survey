let currentStep = 0;
const container = document.getElementById('survey-container');
const form = document.getElementById('survey-form');

// --- GÉNÉRATION ---
function initForm() {
    surveyConfig.forEach((item, index) => {
        const step = document.createElement('div');
        step.className = `question-step ${index === 0 ? 'active' : ''}`;
        
        let html = `<label><strong>${index + 1}. ${item.question}</strong>${item.required ? ' <span style="color:red">*</span>':''}</label>`;

        switch(item.type) {
            case "matrix":
                html += `<div class="matrix-scroll"><table class="matrix-table"><thead><tr><th></th>${item.columns.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>`;
                item.rows.forEach((r, ri) => {
                    html += `<tr><td class="row-label">${r}</td>${item.columns.map(c => `<td><input type="radio" name="${item.id}_${ri}" value="${c}" ${item.required?'required':''}></td>`).join('')}</tr>`;
                });
                html += `</tbody></table></div>`;
                break;
            case "select":
                html += `<select name="${item.id}" ${item.required?'required':''}><option value="">Choisir...</option>${item.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
                break;
            case "file":
                html += `<input type="file" name="${item.id}" accept="${item.accept||'*'}" ${item.required?'required':''}>`;
                break;
            default:
                html += `<input type="${item.type}" name="${item.id}" ${item.required?'required':''}>`;
        }
        step.innerHTML = html;
        container.appendChild(step);
    });

    // Ajout étape Résumé
    const summary = document.createElement('div');
    summary.className = "question-step";
    summary.id = "summary-step";
    summary.innerHTML = `<h3>Vérification finale</h3><div id="summary-content"></div>`;
    container.appendChild(summary);
}

// --- LOGIQUE DE NAVIGATION ---
function shouldShow(idx) {
    const q = surveyConfig[idx];
    if (!q || !q.condition) return true;
    const data = new FormData(form);
    return data.get(q.condition.dependsOn) === q.condition.value;
}

function updateUI() {
    const steps = document.querySelectorAll('.question-step');
    steps.forEach((s, i) => s.classList.toggle('active', i === currentStep));

    document.getElementById('prev-btn').style.display = currentStep === 0 ? 'none' : 'inline-block';
    const isLast = currentStep === steps.length - 1;
    document.getElementById('next-btn').style.display = isLast ? 'none' : 'inline-block';
    document.getElementById('submit-btn').style.display = isLast ? 'inline-block' : 'none';

    if (isLast) renderSummary();
    document.getElementById('progress-bar').style.width = ((currentStep + 1) / steps.length * 100) + "%";
}

function renderSummary() {
    const data = new FormData(form);
    let html = "";
    surveyConfig.forEach((q, i) => {
        if (shouldShow(i)) {
            let val = data.get(q.id) || "Non répondu";
            if (q.type === "matrix") val = "Rempli"; 
            html += `<p><strong>${q.question} :</strong> ${val}</p>`;
        }
    });
    document.getElementById('summary-content').innerHTML = html;
}

// --- ÉVÉNEMENTS ---
document.getElementById('next-btn').addEventListener('click', () => {
    const activeStep = document.querySelector('.question-step.active');
    const inputs = activeStep.querySelectorAll('input, select, textarea');
    let valid = true;
    inputs.forEach(i => { if(!i.checkValidity()) { i.reportValidity(); valid = false; }});

    if (valid) {
        currentStep++;
        while (currentStep < surveyConfig.length && !shouldShow(currentStep)) currentStep++;
        updateUI();
        save();
    }
});

document.getElementById('prev-btn').addEventListener('click', () => {
    currentStep--;
    while (currentStep > 0 && !shouldShow(currentStep)) currentStep--;
    updateUI();
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm("Tout effacer ?")) { localStorage.clear(); location.reload(); }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('submit-btn').textContent = "Envoi...";
    
    // Remplace par ton email réel
    await fetch("https://formsubmit.co/ajax/bsorez@gmail.com", {
        method: "POST",
        body: new FormData(form)
    });
    
    form.style.display = 'none';
    document.getElementById('thank-you-message').style.display = 'block';
    localStorage.clear();
});

function save() {
    const obj = Object.fromEntries(new FormData(form));
    localStorage.setItem('survey_data', JSON.stringify(obj));
}

// --- LANCEMENT ---
initForm();
const saved = localStorage.getItem('survey_data');
if (saved) {
    const data = JSON.parse(saved);
    Object.keys(data).forEach(key => {
        const input = document.getElementsByName(key)[0];
        if (input) input.value = data[key];
    });
}
updateUI();
