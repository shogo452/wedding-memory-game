interface Difficulty {
  grid: [number, number];
  time: number;
}

interface Difficulties {
  [key: string]: Difficulty;
}

const icons: string[] = ['💍', '🎂', '🕊️', '🌹', '🥂', '🎁', '👰', '🤵', '💐', '🔔', '🎉', '💖'];
let cards: string[] = [];
let flippedCards: HTMLDivElement[] = [];
let score: number = 0;
let timer: number = 0;
let timerInterval: NodeJS.Timeout;
let currentDifficulty: string = 'normal';

const difficulties: Difficulties = {
  easy: { grid: [3, 4], time: 60 },
  normal: { grid: [4, 4], time: 90 },
  hard: { grid: [4, 5], time: 120 }
};

function shuffleArray(array: any[]): void {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

function createCard(icon: string, size: number): HTMLDivElement {
  const card = document.createElement('div');
  card.classList.add('aspect-square', 'bg-custom-blue-400', 'rounded-lg', 'flex', 'items-center', 'justify-center', 'cursor-pointer', 'transition-transform', 'duration-300', 'hover:bg-custom-blue-300');
  card.dataset.icon = icon;
  card.addEventListener('click', flipCard);
  
  const iconElement = document.createElement('span');
  iconElement.textContent = icon;
  iconElement.style.fontSize = `${size * 0.6}px`;
  iconElement.style.visibility = 'hidden';
  card.appendChild(iconElement);

  return card;
}

function flipCard(this: HTMLDivElement): void {
  if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
      this.classList.add('flipped', 'bg-white');
      (this.querySelector('span') as HTMLSpanElement).style.visibility = 'visible';
      flippedCards.push(this);

      if (flippedCards.length === 2) {
          setTimeout(checkMatch, 500);
      }
  }
}

function checkMatch(): void {
  const [card1, card2] = flippedCards;
  if (card1.dataset.icon === card2.dataset.icon) {
      score += 10;
      card1.removeEventListener('click', flipCard);
      card2.removeEventListener('click', flipCard);
  } else {
      card1.classList.remove('flipped', 'bg-white');
      card2.classList.remove('flipped', 'bg-white');
      (card1.querySelector('span') as HTMLSpanElement).style.visibility = 'hidden';
      (card2.querySelector('span') as HTMLSpanElement).style.visibility = 'hidden';
      score = Math.max(0, score - 1);
  }
  flippedCards = [];
  updateScore();
  checkGameEnd();
}

function updateScore(): void {
  const scoreElement = document.getElementById('score');
  if (scoreElement) {
      scoreElement.textContent = `スコア: ${score}`;
  }
}

function updateTimer(): void {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
      timerElement.textContent = `残り時間: ${timer}秒`;
      if (timer <= 0) {
          clearInterval(timerInterval);
          endGame();
      }
      timer--;
  }
}

function checkGameEnd(): void {
  if (document.querySelectorAll('.flipped').length === cards.length) {
      clearInterval(timerInterval);
      showCelebration();
  }
}

function showCelebration(): void {
  const celebrationElement = document.getElementById('celebration');
  const finalScoreElement = document.getElementById('final-score');
  if (celebrationElement && finalScoreElement) {
      celebrationElement.classList.remove('hidden');
      finalScoreElement.textContent = `最終スコア: ${score}`;
      createConfetti();
  }
}

function createConfetti(): void {
  const colors: string[] = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FBCAEF', '#FDFD96', '#B19CD9'];
  const confettiContainer = document.createElement('div');
  confettiContainer.id = 'confetti-container';
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.zIndex = '1000';
  document.body.appendChild(confettiContainer);

  for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confettiContainer.appendChild(confetti);
  }

  setTimeout(() => {
      if (confettiContainer && confettiContainer.parentNode) {
          confettiContainer.parentNode.removeChild(confettiContainer);
      }
  }, 5000);
}

function startGame(difficulty: string): void {
  currentDifficulty = difficulty;
  const { grid, time } = difficulties[difficulty];
  timer = time;
  score = 0;
  const gameBoard = document.getElementById('game-board');
  if (gameBoard) {
      gameBoard.innerHTML = '';
      cards = icons.slice(0, (grid[0] * grid[1]) / 2);
      cards = [...cards, ...cards];
      shuffleArray(cards);

      const boardWidth = gameBoard.offsetWidth;
      const cardSize = Math.floor((boardWidth - (grid[1] - 1) * 8) / grid[1]);
      gameBoard.style.gridTemplateColumns = `repeat(${grid[1]}, 1fr)`;
      gameBoard.style.gridTemplateRows = `repeat(${grid[0]}, 1fr)`;
      
      cards.forEach(icon => {
          const card = createCard(icon, cardSize);
          card.style.width = `${cardSize}px`;
          card.style.height = `${cardSize}px`;
          gameBoard.appendChild(card);
      });

      updateScore();
      clearInterval(timerInterval);
      timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
  }
}

function endGame(): void {
  clearInterval(timerInterval);
  showCelebration();
}

function initGame(): void {
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  difficultyButtons.forEach(button => {
      button.addEventListener('click', (e) => {
          const difficulty = (e.target as HTMLButtonElement).dataset.difficulty;
          if (difficulty) {
              startGame(difficulty);
          }
      });
  });

  const restartButton = document.getElementById('restart-button');
  if (restartButton) {
      restartButton.addEventListener('click', () => {
          const celebrationElement = document.getElementById('celebration');
          if (celebrationElement) {
              celebrationElement.classList.add('hidden');
          }
          startGame(currentDifficulty);
      });
  }

  window.addEventListener('resize', () => {
      if (currentDifficulty) {
          startGame(currentDifficulty);
      }
  });

  // 初期化
  startGame('normal');
}

// DOMが読み込まれた後にゲームを初期化
document.addEventListener('DOMContentLoaded', initGame);
