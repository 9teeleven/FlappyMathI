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
    // 1. km -> m (x1000)
    { q: "2 km = ... m", o: [20, 200, 2000, 20000], a: 2000 },
    // 2. m -> cm (x100)
    { q: "5 m = ... cm", o: [50, 500, 550, 5000], a: 500 },
    // 3. cm -> mm (x10)
    { q: "10 cm = ... mm", o: [100, 1000, 10, 1], a: 100 },
    // 4. hm -> m (x100)
    { q: "3 hm = ... m", o: [30, 300, 3000, 350], a: 300 },
    // 5. dam -> m (x10)
    { q: "8 dam = ... m", o: [80, 800, 8, 8000], a: 80 },
    // 6. km -> hm (x10)
    { q: "15 km = ... hm", o: [15, 150, 1500, 15000], a: 150 },
    // 7. m -> mm (x1000)
    { q: "1 m = ... mm", o: [10, 100, 1000, 10000], a: 1000 },
    // 8. dm -> cm (x10)
    { q: "25 dm = ... cm", o: [25, 250, 2500, 205], a: 250 },
    // 9. km -> dam (x100)
    { q: "4 km = ... dam", o: [40, 400, 4000, 440], a: 400 },
    // 10. m -> dm (x10)
    { q: "9 m = ... dm", o: [90, 900, 9, 99], a: 90 },
    // 11. dam -> cm (x1000)
    { q: "2 dam = ... cm", o: [200, 2000, 20000, 20], a: 2000 },
    // 12. hm -> dm (x1000)
    { q: "6 hm = ... dm", o: [60, 600, 6000, 60000], a: 6000 },
    // 13. cm -> mm (x10)
    { q: "50 cm = ... mm", o: [5, 50, 500, 5000], a: 500 },
    // 14. m -> cm (x100)
    { q: "12 m = ... cm", o: [120, 1200, 12000, 1220], a: 1200 },
    // 15. km -> m (x1000)
    { q: "7 km = ... m", o: [70, 700, 7000, 70000], a: 7000 },
    // 16. dam -> dm (x100)
    { q: "5 dam = ... dm", o: [50, 500, 5000, 55], a: 500 },
    // 17. dm -> mm (x100)
    { q: "3 dm = ... mm", o: [30, 300, 3000, 330], a: 300 },
    // 18. hm -> dam (x10)
    { q: "20 hm = ... dam", o: [200, 2000, 20, 2], a: 200 },
    // 19. m -> mm (x1000)
    { q: "4 m = ... mm", o: [40, 400, 4000, 40000], a: 4000 },
    // 20. km -> hm (x10)
    { q: "80 km = ... hm", o: [8, 80, 800, 8000], a: 800 },
    // 21. cm -> mm (x10)
    { q: "100 cm = ... mm", o: [10, 100, 1000, 10000], a: 1000 },
    // 22. dam -> m (x10)
    { q: "45 dam = ... m", o: [45, 450, 4500, 455], a: 450 },
    // 23. m -> cm (x100)
    { q: "30 m = ... cm", o: [30, 300, 3000, 30000], a: 3000 },
    // 24. hm -> m (x100)
    { q: "11 hm = ... m", o: [110, 1100, 11000, 111], a: 1100 },
    // 25. km -> m (x1000)
    { q: "10 km = ... m", o: [100, 1000, 10000, 100000], a: 10000 },
    // 26. dm -> cm (x10)
    { q: "75 dm = ... cm", o: [75, 750, 7500, 755], a: 750 },
    // 27. m -> dm (x10)
    { q: "6 m = ... dm", o: [6, 60, 600, 66], a: 60 },
    // 28. dam -> cm (x1000)
    { q: "1 dam = ... cm", o: [10, 100, 1000, 10000], a: 1000 },
    // 29. hm -> dam (x10)
    { q: "9 hm = ... dam", o: [90, 900, 9, 99], a: 90 },
    // 30. cm -> mm (x10)
    { q: "22 cm = ... mm", o: [22, 220, 2200, 202], a: 220 }
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





