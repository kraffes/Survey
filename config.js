// config.js
const surveyConfig = [
    { 
        id: "pseudo", 
        question: "Comment vous appelez-vous ?", 
        type: "text", 
        required: true 
    },
    { 
        id: "usage", 
        question: "Utilisez-vous nos services ?", 
        type: "select", 
        options: ["Oui", "Non"], 
        required: true 
    },
    // CONDITIONNELLE : S'affiche si usage === "Oui"
    { 
        id: "frequence", 
        question: "À quelle fréquence ?", 
        type: "radio", 
        options: ["Quotidien", "Hebdomadaire", "Mensuel"], 
        condition: { dependsOn: "usage", value: "Oui" },
        required: true 
    },
    // CONDITIONNELLE : S'affiche si usage === "Non"
    { 
        id: "raison", 
        question: "Pourquoi n'utilisez-vous pas nos services ?", 
        type: "text", 
        condition: { dependsOn: "usage", value: "Non" },
        required: true 
    },
    { 
        id: "satisfaction_grille", 
        question: "Évaluez les points suivants :", 
        type: "matrix", 
        rows: ["Interface", "Rapidité", "Support"],
        columns: ["Décevant", "Moyen", "Top"],
        required: true 
    },
    { 
        id: "pj", 
        question: "Un document à nous transmettre ? (Max 5Mo)", 
        type: "file",
        accept: ".jpg, .png, .pdf",
        required: false 
    }
];
