let currentStep = 0;
const container = document.getElementById('survey-container');
const form = document.getElementById('survey-form');

// --- LOGIQUE CONDITIONNELLE ---
function shouldShow(idx) {
    const q = surveyConfig[idx];
    if (!q || !q.condition) return true;
    
    const data = new FormData(form);
    const actualValue = data.get(q.condition.dependsOn);
    
    const targetValues = Array.isArray(q.condition.value) ? q.condition.value : [q.condition.value];
    const isIncluded = targetValues.includes(actualValue);

    return q.condition.operator === '!=' ? !isIncluded : isIncluded;
}

// --- GÉNÉRATION DYNAMIQUE DU FORMULAIRE ---
function initForm() {
    container.innerHTML = ""; // On vide au cas où
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
            case "radio":
                html += `<div class="options-group">` + item.options.map(o => `<div><input type="radio" name="${item.id}" value="${o}" ${item.required?'required':''}> ${o}</div>`).join('') + `</div>`;
                break;
            case "file":
                html += `<input type="file" name="${item.id}" ${item.required?'required':''}>`;
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

// --- AFFICHAGE DU RÉSUMÉ ---
function renderSummary() {
    const data = new FormData(form);
    let html = "";
    surveyConfig.forEach((q, i) => {
        if (shouldShow(i)) {
            if (q.type === "matrix") {
                html += `<p><strong>${q.question} :</strong><br>`;
                q.rows.forEach((r, ri) => {
                    const val = data.get(`${q.id}_${ri}`) || "<em>Non renseigné</em>";
                    html += `<small style="margin-left:15px;">- ${r} : ${val}</small><br>`;
                });
                html += `</p>`;
            } else {
                let val = data.get(q.id) || "<em>Non renseigné</em>";
                html += `<p><strong>${q.question} :</strong> ${val}</p>`;
            }
        }
    });
    document.getElementById('summary-content').innerHTML = html;
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

document.getElementById('prev-btn').addEventListener('click', () => {
    currentStep--;
    while (currentStep > 0 && !shouldShow(currentStep)) currentStep--;
    updateUI();
});

// --- ENVOI FINAL ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Tentative d'envoi détectée..."); // LOG 1

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = "Envoi en cours...";

    const formData = new FormData(form);
    console.log("Données prêtes :", Object.fromEntries(formData)); // LOG 2

    try {
        const response = await fetch("https://formsubmit.co/ajax/TON_EMAIL@MAIL.COM", {
            method: "POST",
            body: formData
        });

        console.log("Réponse reçue du serveur :", response.status); // LOG 3

        if (response.ok) {
            console.log("Envoi réussi !");
            form.style.display = 'none';
            document.getElementById('thank-you-message').style.display = 'block';
            localStorage.clear();
        } else {
            const errorText = await response.text();
            throw new Error("Erreur serveur : " + errorText);
        }
    } catch (error) {
        console.error("ERREUR DÉTECTÉE :", error); // LOG D'ERREUR
        alert("L'envoi a échoué. Détail : " + error.message);
        btn.disabled = false;
        btn.textContent = "Envoyer l'enquête";
    }
});

initForm();
updateUI();
