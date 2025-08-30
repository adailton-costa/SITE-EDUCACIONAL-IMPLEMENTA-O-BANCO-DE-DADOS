// === CONFIGURAÇÕES DA API LLM (COHERE) ===
const COHERE_API_KEY = '83dC3LN5b8rnp5nFdVWm8z3osqJeuMg5r8qHfm6J';
const COHERE_API_URL = 'https://api.cohere.ai/v1/generate';

// === MATÉRIAS E TÓPICOS ===
const subjects = [
    { id: "matematica", name: "Matemática", icon: "fa-calculator", color: "#1565c0", lightColor: "#bbdefb", borderColor: "#90caf9" },
    { id: "historia", name: "História", icon: "fa-landmark", color: "#2e7d32", lightColor: "#c8e6c9", borderColor: "#a5d6a7" },
    { id: "geografia", name: "Geografia", icon: "fa-globe-americas", color: "#7b1fa2", lightColor: "#f0e6f5", borderColor: "#e1bee7" },
    { id: "Biologia", name: "Biologia", icon: "fa-dna", color: "#ff8f00", lightColor: "#ffecb3", borderColor: "#ffd54f" },
    { id: "Algebra", name: "Álgebra", icon: "fa-square-root-variable", color: "#c62828", lightColor: "#ffcdd2", borderColor: "#ef9a9a" },
    { id: "ingles", name: "Inglês", icon: "fa-language", color: "#4527a0", lightColor: "#d1c4e9", borderColor: "#b39ddb" },
    { id: "arte", name: "Arte", icon: "fa-palette", color: "#d84315", lightColor: "#ffccbc", borderColor: "#ffab91" }
];

const mathTopics = [
    "adição e subtração",
    "multiplicação e divisão", 
    "frações",
    "porcentagem",
    "álgebra básica",
    "geometria",
    "números decimais",
    "expressões matemáticas"
];

// === ELEMENTOS DOM ===
const subjectGrid = document.getElementById('subjectGrid');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const startScreen = document.getElementById('startScreen');
const loadingScreen = document.getElementById('loadingScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const scoreDisplay = document.getElementById('scoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const streakContainer = document.getElementById('streakContainer');
const streakDisplay = document.getElementById('streakDisplay');
const categoryDisplay = document.getElementById('categoryDisplay');
const difficultyDisplay = document.getElementById('difficultyDisplay');
const questionDisplay = document.getElementById('questionDisplay');
const optionsContainer = document.getElementById('optionsContainer');
const timerBar = document.getElementById('timerBar');
const finalScore = document.getElementById('finalScore');
const resultMessage = document.getElementById('resultMessage');
const mathTopicsElement = document.getElementById('mathTopics');
const errorMessage = document.getElementById('errorMessage');

// === VARIÁVEIS DO JOGO ===
let selectedSubject = null;
let selectedDifficulty = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let streak = 0;
let multiplier = 1;
let timer;
let timeLeft = 35;

// === FUNÇÕES AUXILIARES ===
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// === FUNÇÃO PARA GERAR PERGUNTAS VIA COHERE ===
async function generateQuestionWithLLM(topic, difficulty) {
    try {
        const prompt = `
Você é um professor especialista em matemática do Ensino Fundamental. Você domina os seguintes tópicos: adição e subtração, multiplicação e divisão, frações, porcentagem, álgebra básica, geometria, números decimais e expressões matemáticas.

Crie UMA pergunta curta de múltipla escolha sobre o tópico "${topic}" com dificuldade "${difficulty}". 
A pergunta deve ter contexto, ser clara e objetiva, com no máximo 2 linhas de texto.  

Retorne SOMENTE em JSON válido, sem explicações, no formato exato:
{
  "question": "Texto da pergunta",
  "correctAnswer": "Resposta correta",
  "wrongAnswers": ["Opção 1", "Opção 2", "Opção 3"]
}
`;

        const response = await fetch("https://api.cohere.ai/v1/generate", {
            method: "POST",
            headers: {
                "Authorization": "Bearer 83dC3LN5b8rnp5nFdVWm8z3osqJeuMg5r8qHfm6J",
                "Content-Type": "application/json",
                "Cohere-Version": "2022-12-06"
            },
            body: JSON.stringify({
                model: "command",
                prompt: prompt,
                max_tokens: 180,
                temperature: 0.7
            })
        });

        const data = await response.json();
        console.log("Resposta da Cohere:", data);

        // Verifica se há resposta válida
        if (!data.generations || data.generations.length === 0) {
            return generateFallbackQuestion();
        }

        // Pegando o texto da geração
        let content = data.generations[0].text;

        // Limpeza de caracteres estranhos
        content = content.replace(/[\n\r]+/g, ' ').trim();

        // Tentando converter em JSON
        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch (err) {
            console.error("Erro ao parsear JSON:", content);
            return generateFallbackQuestion();
        }

        parsed.options = shuffle([parsed.correctAnswer, ...parsed.wrongAnswers]);
        return parsed;

    } catch (err) {
        console.error("Erro ao gerar pergunta via Cohere:", err);
        return generateFallbackQuestion();
    }
}

// === FALLBACK ===
function generateFallbackQuestion() {
    const fallbackQuestions = [
        { question: "Quanto é 2 + 2?", correctAnswer: "4", options: ["3", "4", "5", "6"] },
        { question: "Quanto é 8 × 7?", correctAnswer: "56", options: ["54", "56", "58", "60"] },
        { question: "Se 3x = 21, qual é o valor de x?", correctAnswer: "7", options: ["6", "7", "8", "9"] },
        { question: "Quanto é 25% de 80?", correctAnswer: "20", options: ["15", "20", "25", "30"] },
        { question: "Qual é a metade de 24?", correctAnswer: "12", options: ["10", "12", "14", "16"] }
    ];
    return fallbackQuestions[getRandomInt(0, fallbackQuestions.length - 1)];
}

// === INICIALIZAR BOTÕES DE MATÉRIAS ===
function initializeSubjects() {
    subjects.forEach(sub => {
        const btn = document.createElement('button');
        btn.textContent = sub.name;
        const icon = document.createElement('i');
        icon.className = `fas ${sub.icon}`;
        btn.prepend(icon);
        btn.prepend(document.createTextNode(' '));
        btn.style.padding = "10px 15px";
        btn.style.borderRadius = "10px";
        btn.style.border = `2px solid ${sub.borderColor}`;
        btn.style.cursor = "pointer";
        btn.style.background = sub.lightColor;
        btn.style.color = sub.color;
        btn.style.fontWeight = "bold";
        btn.style.transition = "all 0.3s";
        btn.style.display = "flex";
        btn.style.alignItems = "center";
        btn.style.gap = "8px";
        btn.addEventListener('click', () => {
            selectedSubject = sub;
            document.querySelectorAll('#subjectGrid button').forEach(b => {
                const subjectId = subjects.find(s => s.name === b.textContent.trim())?.id;
                if (subjectId) {
                    const subject = subjects.find(s => s.id === subjectId);
                    b.style.background = subject.lightColor;
                    b.style.color = subject.color;
                    b.style.border = `2px solid ${subject.borderColor}`;
                    b.style.boxShadow = "none";
                    b.style.transform = "scale(1)";
                }
            });
            btn.style.background = sub.color;
            btn.style.color = "white";
            btn.style.boxShadow = `0 0 12px ${sub.color}`;
            btn.style.transform = "scale(1.05)";
            if (sub.id === "matematica") mathTopicsElement.style.display = "flex";
            else mathTopicsElement.style.display = "none";
            checkStart();
        });
        subjectGrid.appendChild(btn);
    });
}

// === BOTÕES DE DIFICULDADE ===
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedDifficulty = btn.dataset.difficulty;
        checkStart();
    });
});

function checkStart() {
    startBtn.disabled = !(selectedSubject && selectedDifficulty);
}

// === INÍCIO DO JOGO ===
startBtn.addEventListener('click', startGame);

async function startGame() {
    startScreen.style.display = 'none';
    loadingScreen.style.display = 'block';
    score = 0; lives = 3; streak = 0; multiplier = 1; currentQuestionIndex = 0;
    updateLivesDisplay(); updateStreakDisplay();
    categoryDisplay.textContent = selectedSubject.name;
    difficultyDisplay.textContent = selectedDifficulty.toUpperCase() + " • 100 pts";

    questions = [];
    if (selectedSubject.id === "matematica") {
        for (let i = 0; i < 5; i++) {
            const randomTopic = mathTopics[Math.floor(Math.random() * mathTopics.length)];
            const q = await generateQuestionWithLLM(randomTopic, selectedDifficulty);
            if (q) questions.push(q);
        }
    } else {
        for (let i = 0; i < 5; i++) {
            const q = await generateQuestionWithLLM(selectedSubject.name, selectedDifficulty);
            if (q) questions.push(q);
        }
    }

    if (questions.length === 0) questions.push(generateFallbackQuestion());
    loadingScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    loadQuestion();
    startTimer();
}

// === LÓGICA DO JOGO ===
function loadQuestion() {
    if (currentQuestionIndex >= questions.length) return endGame();
    const q = questions[currentQuestionIndex];
    questionDisplay.textContent = q.question;
    optionsContainer.innerHTML = '';
    q.options.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'option';
        div.textContent = opt;
        div.addEventListener('click', () => selectOption(div, opt, q.correctAnswer));
        optionsContainer.appendChild(div);
    });
    scoreDisplay.textContent = score;
    nextBtn.style.display = 'none';
}

function selectOption(el, selected, correct) {
    clearInterval(timer);
    document.querySelectorAll('.option').forEach(o => {
        o.classList.add('disabled'); o.style.pointerEvents = 'none';
    });
    if (selected === correct) {
        el.classList.add('correct'); streak++;
        multiplier = streak >= 5 ? 3 : streak >= 3 ? 2 : 1;
        const pointsEarned = 100 * multiplier;
        score += pointsEarned;
        scoreDisplay.textContent = score;
        updateStreakDisplay();
        showPointsAnimation(el, pointsEarned);
        if (streak >= 3) showStreakAnimation();
    } else {
        el.classList.add('incorrect'); streak = 0; multiplier = 1;
        updateStreakDisplay(); lives--;
        document.querySelectorAll('.option').forEach(o => { if(o.textContent===correct)o.classList.add('correct'); });
        updateLivesDisplay();
        if(lives<=0){ setTimeout(endGame,1500); return;}
    }
    nextBtn.style.display = 'block';
}

function updateLivesDisplay(){
    const hearts = livesDisplay.querySelectorAll('.heart');
    hearts.forEach((heart,index)=>heart.style.display=index<lives?'inline':'none');
}

function updateStreakDisplay(){
    if(streak>1){
        streakContainer.style.display='flex'; streakDisplay.textContent=`x${multiplier}`;
        streakContainer.style.background=multiplier===3?'#ffecb3':multiplier===2?'#fff8e1':'#f5f5f5';
        streakContainer.style.color=multiplier===3?'#ff6f00':multiplier===2?'#ff8f00':'#757575';
    }else streakContainer.style.display='none';
}

function showPointsAnimation(element, points){
    const rect=element.getBoundingClientRect();
    const pointsPopup=document.createElement('div');
    pointsPopup.className='points-popup';
    pointsPopup.textContent=`+${points}`;
    pointsPopup.style.left=`${rect.left+rect.width/2}px`;
    pointsPopup.style.top=`${rect.top}px`;
    document.body.appendChild(pointsPopup);
    setTimeout(()=>pointsPopup.remove(),1000);
}

function showStreakAnimation(){
    const streakAnim=document.createElement('div');
    streakAnim.className='streak-animation';
    streakAnim.textContent=`STREAK x${multiplier}!`;
    gameScreen.appendChild(streakAnim);
    setTimeout(()=>streakAnim.remove(),500);
}

nextBtn.addEventListener('click',()=>{
    currentQuestionIndex++;
    if(currentQuestionIndex<questions.length){ loadQuestion(); startTimer(); }
    else endGame();
});

function startTimer(){
    timeLeft=35; timerBar.style.height='100%'; clearInterval(timer);
    timer=setInterval(()=>{
        timeLeft--; timerBar.style.height=`${(timeLeft/35)*100}%`;
        if(timeLeft<=0){
            clearInterval(timer); lives--; streak=0; multiplier=1;
            updateLivesDisplay(); updateStreakDisplay();
            const correctAnswer = questions[currentQuestionIndex].correctAnswer;
            document.querySelectorAll('.option').forEach(o=>{ o.classList.add('disabled'); o.style.pointerEvents='none'; if(o.textContent===correctAnswer)o.classList.add('correct'); });
            nextBtn.style.display='block';
            if(lives<=0) setTimeout(endGame,1500);
        }
    },1000);
}

function endGame(){
    gameScreen.style.display='none'; resultScreen.style.display='block'; finalScore.textContent=score;
    if(score>=1000) resultMessage.textContent=`Incrível! Você é um expert em ${selectedSubject.name}!`;
    else if(score>=500) resultMessage.textContent=`Bom trabalho! Você conhece bem ${selectedSubject.name}.`;
    else resultMessage.textContent=`Continue estudando! Você pode melhorar em ${selectedSubject.name}.`;
}

playAgainBtn.addEventListener('click',()=>{
    resultScreen.style.display='none'; startScreen.style.display='block';
    selectedSubject=null; selectedDifficulty=null;
    document.querySelectorAll('#subjectGrid button').forEach(b=>{b.style.background='#f0f0f0';b.style.color='#333';});
    difficultyButtons.forEach(b=>{ b.classList.remove('selected'); b.style.background='#f0f0f0'; b.style.color='#333'; });
    mathTopicsElement.style.display="none"; startBtn.disabled=true;
});

// INICIALIZAR
initializeSubjects();
