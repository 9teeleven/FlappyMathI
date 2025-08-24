document.addEventListener('DOMContentLoaded', () => {
    // Elemen DOM
    const loadingScreen = document.getElementById('loadingScreen');
    const homeScreen = document.getElementById('homeScreen');
    const startButton = document.getElementById('startButton');
    const gameCanvas = document.getElementById('gameCanvas');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const mathModal = document.getElementById('mathModal');
    const questionEl = document.getElementById('question');
    const answerOptionsEl = document.getElementById('answerOptions');
    const startMessage = document.getElementById('startMessage');
    const endGameButton = document.getElementById('endGameButton');
    const scorePanel = document.getElementById('scorePanel');
    const finalScoreEl = document.getElementById('finalScore');
    const highScorePanelEl = document.getElementById('highScorePanel');
    const medalImageEl = document.getElementById('medalImage');
    const restartButton = document.getElementById('restartButton');
    // --- Elemen Baru untuk Tantangan ---
    const challengeIntro = document.getElementById('challengeIntro');
    const questionContainer = document.getElementById('questionContainer');
    const showQuestionButton = document.getElementById('showQuestionButton');
    const ctx = gameCanvas.getContext('2d');
    
    // Aset Gambar
    const assets = {
        bird: new Image(), background: new Image(),
        pipeTop: new Image(), pipeBottom: new Image(),
        ground: new Image(),
        medalPlain: new Image(),
        medalBronze: new Image(),
        medalSilver: new Image(),
        medalGold: new Image()
    };
    assets.bird.src = 'assets/bird1.png'; 
    assets.background.src = 'assets/background_day.png';
    assets.pipeTop.src = 'assets/pipe-top.png';
    assets.pipeBottom.src = 'assets/pipe-bottom.png';
    assets.ground.src = 'assets/tiles.png';
    assets.medalPlain.src = 'assets/medal_plain.png';
    assets.medalBronze.src = 'assets/medal_bronze.png';
    assets.medalSilver.src = 'assets/medal_silver.png'; 
    assets.medalGold.src = 'assets/medal_gold.png';

    // Logika Pemuatan Aset
    let assetsLoaded = 0;
    const totalAssets = Object.keys(assets).length;

    function assetLoadedCallback(assetName, status) {
        if (status === 'error') {
            console.error(`Gagal memuat aset: ${assetName} dari URL ${assets[assetName].src}. Pastikan file ada di folder yang sama dan nama file sudah benar.`);
        }
        assetsLoaded++;
        if (assetsLoaded === totalAssets) {
            loadingScreen.style.display = 'none';
            homeScreen.style.display = 'flex';
        }
    }

    for (const key in assets) {
        assets[key].onload = () => assetLoadedCallback(key, 'success');
        assets[key].onerror = () => assetLoadedCallback(key, 'error');
    }

    // Pengaturan Game
    let bird, pipes, score = 0, gameOver, gameLoopId, currentCorrectAnswer;
    let waitingForFirstFlap = true;
    const gravity = 0.5;
    const flapStrength = -8;
    let pipeWidth; 
    const pipeGap = 150;
    const pipeSpeed = 2;
    const pipeInterval = 120;
    let frameCount = 0;
    
    // Pengaturan Tanah
    let groundX = 0;
    const groundHeight = 112;

    // Logika High Score
    let highScore = 0;

    function loadHighScore() {
        const hs = localStorage.getItem('flappyPonHighScore');
        highScore = hs ? parseInt(hs, 10) : 0;
    }

    function saveHighScore() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyPonHighScore', highScore);
        }
    }

    // BANK SOAL
     let questionBank = [
    { q: "2 × 3", o: [5, 6, 7, 8], a: 6 },
    { q: "8 ÷ 4", o: [1, 2, 3, 4], a: 2 },
    { q: "7 × 5", o: [30, 35, 40, 25], a: 35 },
    { q: "9 ÷ 3", o: [1, 2, 3, 4], a: 3 },
    { q: "4 × 6", o: [20, 22, 24, 26], a: 24 },
    { q: "10 ÷ 2", o: [2, 4, 5, 6], a: 5 },
    { q: "3 × 8", o: [22, 23, 24, 25], a: 24 },
    { q: "12 ÷ 6", o: [1, 2, 3, 4], a: 2 },
    { q: "5 × 9", o: [40, 45, 50, 55], a: 45 },
    { q: "16 ÷ 8", o: [1, 2, 3, 4], a: 2 },
    { q: "7 × 4", o: [26, 27, 28, 29], a: 28 },
    { q: "18 ÷ 3", o: [5, 6, 7, 8], a: 6 },
    { q: "6 × 6", o: [32, 34, 35, 36], a: 36 },
    { q: "20 ÷ 5", o: [2, 3, 4, 5], a: 4 },
    { q: "8 × 8", o: [62, 63, 64, 65], a: 64 },
    { q: "24 ÷ 4", o: [4, 5, 6, 7], a: 6 },
    { q: "9 × 3", o: [26, 27, 28, 29], a: 27 },
    { q: "21 ÷ 7", o: [2, 3, 4, 5], a: 3 },
    { q: "10 × 2", o: [18, 19, 20, 21], a: 20 },
    { q: "15 ÷ 3", o: [3, 4, 5, 6], a: 5 },
    { q: "2 × 9", o: [16, 17, 18, 19], a: 18 },
    { q: "14 ÷ 2", o: [6, 7, 8, 9], a: 7 },
    { q: "3 × 7", o: [20, 21, 22, 23], a: 21 },
    { q: "27 ÷ 9", o: [2, 3, 4, 5], a: 3 },
    { q: "4 × 9", o: [35, 36, 37, 38], a: 36 },
    { q: "30 ÷ 6", o: [4, 5, 6, 7], a: 5 },
    { q: "2 × 10", o: [18, 19, 20, 21], a: 20 },
    { q: "25 ÷ 5", o: [4, 5, 6, 7], a: 5 },
    { q: "7 × 6", o: [40, 41, 42, 43], a: 42 },
    { q: "28 ÷ 7", o: [3, 4, 5, 6], a: 4 }
];
    let shuffledQuestions = [];
    let currentQuestionIndex = 0;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function startGame(keepScore = false) {
        homeScreen.style.display = 'none';
        scorePanel.style.display = 'none';
        gameCanvas.style.display = 'block';
        scoreDisplay.style.display = 'block';
        endGameButton.style.display = 'block';
        startMessage.style.display = 'block';
        
        gameCanvas.width = 360;
        gameCanvas.height = 640;
        
        pipeWidth = assets.pipeTop.width;

        if (!keepScore) {
            score = 0;
            shuffleArray(questionBank);
            shuffledQuestions = [...questionBank];
            currentQuestionIndex = 0;
        }
        scoreDisplay.textContent = score;

        bird = {
            x: 60, y: 250,
            width: 40, height: 40,      
            velocityY: 0,
            sprite: assets.bird,
            frameWidth: 250,             
            frameHeight: 250,            
            frameCount: 3,
            currentFrame: 0,
            animationCounter: 0,
            frameSpeed: 6               
        };

        pipes = [];
        gameOver = false;
        waitingForFirstFlap = true;
        frameCount = 0;
        groundX = 0;

        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoop();

        document.addEventListener('keydown', handleFlap);
        gameCanvas.addEventListener('mousedown', handleFlap);
        gameCanvas.addEventListener('touchstart', handleFlap);
    }

    function handleFlap(e) {
        if (e.type === 'touchstart') {
            e.preventDefault();
        }
        if (e.type === 'touchstart' || e.type === 'mousedown' || e.code === 'Space') {
            if (gameOver) return;
            if (waitingForFirstFlap) {
                waitingForFirstFlap = false;
                startMessage.style.display = 'none';
                addPipe();
            }
            bird.velocityY = flapStrength;
        }
    }
    
    function addPipe() {
        const minHeight = 80;
        const maxHeight = gameCanvas.height - pipeGap - groundHeight - minHeight;
        const topPipeHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        pipes.push({ x: gameCanvas.width, topHeight: topPipeHeight, passed: false });
    }

    function gameLoop() {
        if (gameOver) return;
        update();
        draw();
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function update() {
        bird.animationCounter++;
        if (bird.animationCounter >= bird.frameSpeed) {
            bird.animationCounter = 0;
            bird.currentFrame = (bird.currentFrame + 1) % bird.frameCount;
        }

        if (waitingForFirstFlap) return;

        bird.velocityY += gravity;
        bird.y += bird.velocityY;
        
        groundX -= pipeSpeed;
        if (groundX <= -gameCanvas.width) {
            groundX = 0;
        }

        if (bird.y < 0 || bird.y + bird.height > gameCanvas.height - groundHeight) {
            return endGame();
        }

        frameCount++;
        if (frameCount % pipeInterval === 0) {
            addPipe();
        }

        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;
            const topPipeBottomY = pipe.topHeight;
            const bottomPipeTopY = pipe.topHeight + pipeGap;

            if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x &&
                (bird.y < topPipeBottomY || bird.y + bird.height > bottomPipeTopY)) {
                return endGame();
            }

            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                score++;
                scoreDisplay.textContent = score;
            }
        });
        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
    }

    function draw() {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        ctx.drawImage(assets.background, 0, 0, gameCanvas.width, gameCanvas.height);

        pipes.forEach(pipe => {
            const topPipeSourceY = assets.pipeTop.height - pipe.topHeight;
            const bottomPipeHeight = gameCanvas.height - pipe.topHeight - pipeGap - groundHeight;
            ctx.drawImage(assets.pipeTop, 0, topPipeSourceY, pipeWidth, pipe.topHeight, pipe.x, 0, pipeWidth, pipe.topHeight);
            ctx.drawImage(assets.pipeBottom, 0, 0, pipeWidth, bottomPipeHeight, pipe.x, pipe.topHeight + pipeGap, pipeWidth, bottomPipeHeight);
        });
        
        ctx.drawImage(assets.ground, groundX, gameCanvas.height - groundHeight, gameCanvas.width, groundHeight);
        ctx.drawImage(assets.ground, groundX + gameCanvas.width, gameCanvas.height - groundHeight, gameCanvas.width, groundHeight);

        ctx.save();
        ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
        if (!waitingForFirstFlap) {
            ctx.rotate(Math.min(bird.velocityY / 20, Math.PI / 6));
        }
        const sourceX = bird.currentFrame * bird.frameWidth;
        ctx.drawImage(
            bird.sprite,
            sourceX, 0,
            bird.frameWidth, bird.frameHeight,
            -bird.width / 2, -bird.height / 2,
            bird.width, bird.height
        );
        ctx.restore();
    }
    
    function endGame(fromButton = false) {
        if (gameOver) return;
        gameOver = true;
        saveHighScore();
        cancelAnimationFrame(gameLoopId);
        document.removeEventListener('keydown', handleFlap);
        gameCanvas.removeEventListener('mousedown', handleFlap);
        gameCanvas.removeEventListener('touchstart', handleFlap);

        if (fromButton) {
            showEndPanel();
        } else {
            showMathQuiz();
        }
    }

    function showEndPanel() {
        finalScoreEl.textContent = score;
        highScorePanelEl.textContent = highScore;

        if (score >= 600) {
            medalImageEl.src = assets.medalGold.src;
        } else if (score >= 300) {
            medalImageEl.src = assets.medalSilver.src;
        } else if (score >= 150) {
            medalImageEl.src = assets.medalBronze.src;
        } else {
            medalImageEl.src = assets.medalPlain.src;
        }

        scoreDisplay.style.display = 'none';
        endGameButton.style.display = 'none';
        scorePanel.style.display = 'flex';
    }

    function getNextQuestion() {
        if (currentQuestionIndex >= shuffledQuestions.length) {
            shuffleArray(shuffledQuestions);
            currentQuestionIndex = 0;
        }
        const question = shuffledQuestions[currentQuestionIndex];
        currentQuestionIndex++;
        return question;
    }

    // --- PERUBAHAN: Logika baru untuk menampilkan tantangan ---
    function showMathQuiz() {
        // Siapkan soal di belakang layar
        const quiz = getNextQuestion();
        currentCorrectAnswer = quiz.a;
        questionEl.innerHTML = quiz.q;
        answerOptionsEl.innerHTML = '';
        const options = [...quiz.o];
        shuffleArray(options);
        options.forEach(option => {
            const button = document.createElement('button');
            button.innerHTML = option;
            button.classList.add('option-button');
            button.onclick = () => checkAnswer(option);
            answerOptionsEl.appendChild(button);
        });

        // Tampilkan intro tantangan, sembunyikan soalnya
        challengeIntro.style.display = 'block';
        questionContainer.style.display = 'none';
        mathModal.style.display = 'flex';
    }

    function checkAnswer(selectedAnswer) {
        mathModal.style.display = 'none';
        if (selectedAnswer == currentCorrectAnswer) {
            startGame(true);
        } else {
            alert(`Jawaban salah! Jawaban yang benar adalah ${currentCorrectAnswer}. Skor direset.`);
            showEndPanel();
        }
    }

    // Panggil loadHighScore saat game pertama kali dimuat
    loadHighScore();
    startButton.addEventListener('click', () => startGame(false));
    endGameButton.addEventListener('click', () => endGame(true));
    restartButton.addEventListener('click', () => startGame(false));

    // --- Event Listener Baru untuk Tombol "Lihat Soal" ---
    showQuestionButton.addEventListener('click', () => {
        challengeIntro.style.display = 'none';
        questionContainer.style.display = 'block';
    });
});




