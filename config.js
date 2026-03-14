// config.js
// C'est ici que tu gères tes questions uniquement
const surveyConfig = [
    { 
        id: "email", 
        question: "Votre email", 
        type: "email", 
        required: true 
    },
    { 
        id: "usage", 
        question: "Utilisez-vous notre service ?", 
        type: "select", 
        options: ["Oui", "Non", "Parfois"], 
        required: true 
    },
    { 
        id: "note", 
        question: "Note sur 10", 
        type: "range", 
        min: 1, 
        max: 10, 
        required: false 
    },
    { 
        id: "comm", 
        question: "Commentaires", 
        type: "text", 
        required: false 
    }
];
