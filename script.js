// 1. CONFIGURATION

let currentStep = 0;
const container = document.getElementById('survey-container');

// 2. GÉNÉRATION
surveyConfig.forEach((item, index) => {
    const step = document.createElement('div');
    step.className = `question-step ${index === 0 ? 'active' : ''}`;
    
    const star = item.required ? '<span class="required-dot">*</span>' : '';
    let inputHtml = '';

    if (item.type === "select") {
        inputHtml = `<select name="${item.id}" ${item.required ? 'required' : ''}><option value="">Choisir...</option>${item.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
    } else if (item.type === "range") {
        inputHtml = `<input type="range" name="${item.id}" min="${item.min}" max="${item.max}" oninput="this.nextElementSibling.value = this.value"><output>${item.max/2}</output>`;
    } else {
        inputHtml = `<input type="${item.type}" name="${item.id}" ${item.required ? 'required' : ''}>`;
    }

    step.innerHTML = `<label><strong>${index + 1}. ${item.question}${star}</strong></label>${inputHtml}`;
    container.appendChild(step);
});

// Ajout étape résumé
const summaryStep = document.createElement('div');
summaryStep.className = "question-step";
summaryStep.id = "summary-step";
summaryStep.innerHTML = "<h3>Récapitulatif</h3><div id='summary-list'></div>";
container.appendChild(summaryStep);

// 3. NAVIGATION & LOGIQUE
function showStep(idx) {
    const steps = document.querySelectorAll('.question-step');
    steps.forEach((s, i) => s.classList.toggle('active', i === idx));
    
    document.getElementById('prev-btn').style.display = idx === 0 ? 'none' : 'inline-block';
    document.getElementById('next-btn').style.display = idx === steps.length - 1 ? 'none' : 'inline-block';
    document.getElementById('submit-btn').style.display = idx === steps.length - 1 ? 'inline-block' : 'none';
    
    if (idx === steps.length - 1) {
        const data = new FormData(document.getElementById('survey-form'));
        let res = "";
        surveyConfig.forEach(c => res += `<p><strong>${c.question}:</strong> ${data.get(c.id) || 'N/A'}</p>`);
        document.getElementById('summary-list').innerHTML = res;
    }
    document.getElementById('progress-bar').style.width = ((idx + 1) / steps.length * 100) + "%";
}

document.getElementById('next-btn').addEventListener('click', () => {
    const inputs = document.querySelectorAll('.question-step.active input, .question-step.active select');
    let valid = true;
    inputs.forEach(i => { if(!i.checkValidity()) { i.reportValidity(); valid = false; }});
    if (valid) { currentStep++; showStep(currentStep); save(); }
});

document.getElementById('prev-btn').addEventListener('click', () => { currentStep--; showStep(currentStep); });

document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm("Réinitialiser ?")) { localStorage.clear(); location.reload(); }
});

// 4. SAUVEGARDE & ENVOI
function save() {
    const data = Object.fromEntries(new FormData(document.getElementById('survey-form')));
    localStorage.setItem('survey_save', JSON.stringify(data));
}

document.getElementById('survey-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.textContent = "Envoi...";
    
    fetch("https://formsubmit.co/ajax/bsorez@MAIL.COM", {
        method: "POST",
        body: new FormData(e.target)
    }).then(() => {
        document.getElementById('survey-form').style.display = 'none';
        document.getElementById('thank-you-message').style.display = 'block';
        localStorage.clear();
    });
});

// Chargement initial
const saved = localStorage.getItem('survey_save');
if(saved) {
    const data = JSON.parse(saved);
    Object.keys(data).forEach(k => { if(document.getElementsByName(k)[0]) document.getElementsByName(k)[0].value = data[k]; });
}
