let currentStep = 0;
const container = document.getElementById('survey-container');
const form = document.getElementById('survey-form');

// --- LOGIQUE CONDITIONNELLE (Le Cœur) ---
function shouldShow(idx) {
    const q = surveyConfig[idx];
    if (!q || !q.condition) return true;
    
    const data = new FormData(form);
    const actualValue = data.get(q.condition.dependsOn);
    
    // On normalise en tableau pour gérer le choix unique ou multiple
    const targetValues = Array.isArray(q.condition.value) ? q.condition.value : [q.condition.value];
    const isIncluded = targetValues.includes(actualValue);

    // Application de l'opérateur (Égal ou Différent)
    return q.condition.operator === '!=' ? !isIncluded : isIncluded;
}

// --- GÉNÉRATION DYNAMIQUE ---
function initForm() {
    surveyConfig.forEach((item, index) => {
        const step = document.createElement('div');
        step.className = `question-step ${index === 0 ? 'active' : ''}`;
        
        let html = `<label><strong>${index + 1}. ${item.question}</strong>${item.required ? ' <span style="color:red">*</span>':''}</label>`;

        switch(item.type) {
            case "select":
                html += `<select name="${item.id}" ${item.required?'required':''}><option value="">Choisir...</option>${item.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
                break;
            case "radio":
                html += `<div class="options-group">` + item.options.map(o => `<div><input type="radio" name="${item.id}" value="${o}" ${item.required?'required':''}> ${o}</div>`).join('') + `</div>`;
                break;
            default:
                html += `<input type="${item.type}" name="${item.id}" ${item.required?'required':''}>`;
        }
        step.innerHTML = html;
        container.appendChild(step);
    });

    // Étape Résumé
    const summary = document.createElement('div');
    summary.className = "question-step";
    summary.id = "summary-step";
    summary.innerHTML = `<h3>Vérification finale</h3><div id="summary-content"></div>`;
    container.appendChild(summary);
}

// --- NAVIGATION ---
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
            let val = data.get(q.id) || "<em>Non renseigné</em>";
            html += `<p style="border-bottom:1px solid #eee; padding-bottom:5px;"><strong>${q.question} :</strong> ${val}</p>`;
        }
    });
    document.getElementById('summary-content').innerHTML = html;
}

document.getElementById('next-btn').addEventListener('click', () => {
    const activeStep = document.querySelector('.question-step.active');
    const inputs = activeStep.querySelectorAll('input, select, textarea');
    let valid = true;
    inputs.forEach(i => { if(!i.checkValidity()) { i.reportValidity(); valid = false; }});

    if (valid) {
        currentStep++;
        while (currentStep < surveyConfig.length && !shouldShow(currentStep)) currentStep++;
        updateUI();
    }
});

// --- GESTION DE L'ENVOI FINAL ---
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = "Envoi en cours...";

    try {
        const response = await fetch("https://formsubmit.co/ajax/TON_EMAIL@MAIL.COM", {
            method: "POST",
            body: new FormData(form)
        });

        if (response.ok) {
            // Cacher le formulaire et afficher le message de succès
            form.style.display = 'none';
            document.getElementById('thank-you-message').style.display = 'block';
            
            // Nettoyer la barre de progression et le stockage local
            document.getElementById('progress-bar').style.width = "100%";
            localStorage.clear();
        } else {
            throw new Error("Erreur serveur");
        }
    } catch (error) {
        console.error("Erreur :", error);
        alert("Désolé, une erreur est survenue lors de l'envoi. Veuillez réessayer.");
        btn.disabled = false;
        btn.textContent = "Envoyer l'enquête";
    }
});

document.getElementById('prev-btn').addEventListener('click', () => {
    currentStep--;
    while (currentStep > 0 && !shouldShow(currentStep)) currentStep--;
    updateUI();
});

// --- LANCEMENT ---
initForm();
updateUI();
