// Configurações do jogo
const syllableSets = {
  vogais: ["A", "E", "I", "O", "U"],
  simples: [
    "BA",
    "BE",
    "BI",
    "BO",
    "BU",
    "CA",
    "CO",
    "CU",
    "DA",
    "DE",
    "DI",
    "DO",
    "DU",
    "FA",
    "FE",
    "FI",
    "FO",
    "FU",
    "GA",
    "GO",
    "GU",
    "LA",
    "LE",
    "LI",
    "LO",
    "LU",
    "MA",
    "ME",
    "MI",
    "MO",
    "MU",
    "NA",
    "NE",
    "NI",
    "NO",
    "NU",
    "PA",
    "PE",
    "PI",
    "PO",
    "PU",
    "RA",
    "RE",
    "RI",
    "RO",
    "RU",
    "SA",
    "SE",
    "SI",
    "SO",
    "SU",
    "TA",
    "TE",
    "TI",
    "TO",
    "TU",
    "VA",
    "VE",
    "VI",
    "VO",
    "VU",
  ],
  complexas: [
    "CHA",
    "CHE",
    "CHI",
    "CHO",
    "CHU",
    "LHA",
    "LHE",
    "LHI",
    "LHO",
    "LHU",
    "NHA",
    "NHE",
    "NHI",
    "NHO",
    "NHU",
    "QUA",
    "QUE",
    "QUI",
    "QUO",
    "GUA",
    "GUE",
    "GUI",
    "GUO",
    "CRA",
    "CRE",
    "CRI",
    "CRO",
    "CRU",
    "BRA",
    "BRE",
    "BRI",
    "BRO",
    "BRU",
    "FRA",
    "FRE",
    "FRI",
    "FRO",
    "FRU",
    "GRA",
    "GRE",
    "GRI",
    "GRO",
    "GRU",
    "PRA",
    "PRE",
    "PRI",
    "PRO",
    "PRU",
    "TRA",
    "TRE",
    "TRI",
    "TRO",
    "TRU",
  ],
};

// Mapeamento completo de pronúncias corrigidas
const pronunciationMap = {
  // Vogais
  A: "á",
  E: "eh",
  I: "ih",
  O: "ó",
  U: "uhh",

  // Sílabas que são confundidas com números
  LI: "lee",
  MI: "mee",
  DI: "dee",
  CI: "cee",

  // Sílabas com E
  BE: "bê",
  CE: "cê",
  DE: "dê",
  FE: "fê",
  GE: "gê",
  LE: "lê",
  ME: "mê",
  NE: "nê",
  PE: "pê",
  RE: "rê",
  SE: "sê",
  TE: "tê",
  VE: "vê",
  ZE: "zê",

  // Sílabas com O
  BO: "bô",
  CO: "cô",
  DO: "dô",
  FO: "fô",
  GO: "gô",
  LO: "lô",
  MO: "mô",
  NO: "nô",
  PO: "pô",
  RO: "rô",
  SO: "sô",
  TO: "tô",
  VO: "vô",
};

// Elementos DOM
const hexContainer = document.getElementById("hexContainer");
const messageEl = document.getElementById("message");
const voiceInfoEl = document.getElementById("voiceInfo");
const btnVogais = document.getElementById("btnVogais");
const btnSilabasSimples = document.getElementById("btnSilabasSimples");
const btnSilabasComplexas = document.getElementById("btnSilabasComplexas");
const btnLento = document.getElementById("btnLento");
const btnVoice = document.getElementById("btnVoice");

// Configurações de voz
let slowMode = false;
let currentVoiceIndex = 0;
let voices = [];
let googleVoice = null;

// Inicializa o sintetizador de voz
const synth = window.speechSynthesis;

// Carrega as vozes disponíveis
function loadVoices() {
  return new Promise((resolve) => {
    voices = synth.getVoices();

    // Tenta encontrar a voz do Google em PT-BR
    googleVoice = voices.find(
      (v) =>
        v.name.includes("Google") && (v.lang === "pt-BR" || v.lang === "pt-PT")
    );

    // Ordena vozes (Google primeiro, depois PT-BR, depois outras)
    voices.sort((a, b) => {
      const aIsGoogle = a.name.includes("Google") ? -2 : 0;
      const bIsGoogle = b.name.includes("Google") ? -2 : 0;
      const aIsPT = a.lang.startsWith("pt") ? -1 : 0;
      const bIsPT = b.lang.startsWith("pt") ? -1 : 0;
      return aIsGoogle + aIsPT - (bIsGoogle + bIsPT);
    });

    if (voices.length > 0) {
      currentVoiceIndex = 0;
      updateVoiceInfo();
      resolve();
    } else {
      synth.onvoiceschanged = () => {
        voices = synth.getVoices();
        resolve();
      };
    }
  });
}

// Atualiza a informação da voz na tela
function updateVoiceInfo() {
  if (voices.length === 0) return;

  const voice = voices[currentVoiceIndex];
  voiceInfoEl.textContent = `Voz: ${voice.name} (${voice.lang}) ${
    voice.name.includes("Google") ? "✔" : ""
  }`;
}

// Função para falar uma sílaba
function speakSyllable(syllable) {
  if (!synth || voices.length === 0) {
    messageEl.textContent = "Síntese de voz não disponível";
    return;
  }

  const utterance = new SpeechSynthesisUtterance();
  utterance.voice = voices[currentVoiceIndex];
  utterance.lang = "pt-BR";
  utterance.rate = slowMode ? 0.7 : 0.9;
  utterance.pitch = 1.5; // Tom mais agudo para som infantil

  // Verifica se a sílaba tem pronúncia especial
  if (pronunciationMap[syllable]) {
    utterance.text = pronunciationMap[syllable];
  }
  // Sílabas complexas (3 letras)
  else if (syllable.length === 3) {
    utterance.text = syllable.toLowerCase();
  }
  // Pronúncia padrão para outras sílabas
  else {
    utterance.text = syllable;
  }

  utterance.onstart = () => {
    messageEl.textContent = `Sílaba: ${syllable}`;
  };

  utterance.onerror = (e) => {
    console.error("Erro na fala:", e);
    messageEl.textContent = "Erro ao reproduzir a sílaba";
  };

  synth.speak(utterance);
}

// Função para criar botões hexagonais
function createHexButtons(syllables) {
  hexContainer.innerHTML = "";

  syllables.forEach((syllable) => {
    const hex = document.createElement("div");
    hex.className = "hexagon";
    hex.textContent = syllable;
    hex.addEventListener("click", () => {
      speakSyllable(syllable);
      // Efeito visual ao clicar
      hex.style.backgroundColor = "#ff6b6b";
      hex.style.transform = "scale(0.95)";
      setTimeout(() => {
        hex.style.backgroundColor = "#64b5f6";
        hex.style.transform = "scale(1.1)";
      }, 200);
    });
    hexContainer.appendChild(hex);
  });
}

// Event listeners
btnVogais.addEventListener("click", () => {
  createHexButtons(syllableSets.vogais);
  messageEl.textContent = "Clique em uma vogal para ouvir o som!";
});

btnSilabasSimples.addEventListener("click", () => {
  createHexButtons(syllableSets.simples);
  messageEl.textContent = "Clique em uma sílaba simples para ouvir o som!";
});

btnSilabasComplexas.addEventListener("click", () => {
  createHexButtons(syllableSets.complexas);
  messageEl.textContent = "Clique em uma sílaba complexa para ouvir o som!";
});

btnLento.addEventListener("click", () => {
  slowMode = !slowMode;
  btnLento.style.backgroundColor = slowMode ? "#4caf50" : "#ff6b6b";
  btnLento.textContent = slowMode ? "Modo Lento (ON)" : "Modo Lento (OFF)";
  messageEl.textContent = slowMode
    ? "Modo lento ativado - sílabas mais devagar!"
    : "Modo normal - sílabas em velocidade natural";
});

btnVoice.addEventListener("click", () => {
  if (voices.length === 0) return;

  currentVoiceIndex = (currentVoiceIndex + 1) % voices.length;
  updateVoiceInfo();
  messageEl.textContent = `Voz alterada para: ${voices[currentVoiceIndex].name}`;

  // Fala um exemplo com a nova voz
  setTimeout(() => speakSyllable("BA"), 300);
});

// Inicialização do jogo
if (synth) {
  loadVoices().then(() => {
    // Inicia com as vogais
    createHexButtons(syllableSets.vogais);
    messageEl.textContent = "Clique em uma vogal para ouvir o som!";

    // Se encontrou a voz do Google, usa ela por padrão
    if (googleVoice) {
      currentVoiceIndex = voices.indexOf(googleVoice);
      updateVoiceInfo();
    }
  });
} else {
  messageEl.textContent =
    "Seu navegador não suporta síntese de voz. Tente usar Chrome.";
  messageEl.style.color = "red";
}
