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
      card1.removeEventListener('click', flipCard);
      card2.removeEventListener('click', flipCard);
      animateMatch(card1, card2);
  } else {
      card1.classList.remove('flipped', 'bg-white');
      card2.classList.remove('flipped', 'bg-white');
      (card1.querySelector('span') as HTMLSpanElement).style.visibility = 'hidden';
      (card2.querySelector('span') as HTMLSpanElement).style.visibility = 'hidden';
  }
  flippedCards = [];
  checkGameEnd();
}

function animateMatch(card1: HTMLElement, card2: HTMLElement): void {
  [card1, card2].forEach(card => {
      card.style.transition = 'transform 0.3s ease-in-out';
      card.style.transform = 'scale(1.1)';
      setTimeout(() => {
          card.style.transform = 'scale(1)';
      }, 300);
  });
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
  if (celebrationElement) {
      celebrationElement.classList.remove('hidden');
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
  confettiContainer.style.overflow = 'hidden';
  document.body.appendChild(confettiContainer);

  for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');

    // 開始位置を画面上部の外に設定
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = '-5vh';
    
    // アニメーションの時間と遅延をランダム化
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 5;
    confetti.style.animationDuration = `${duration}s`;
    confetti.style.animationDelay = `${delay}s`;
    
    // サイズと回転をランダム化
    const size = Math.random() * 10 + 5;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confettiContainer.appendChild(confetti);
  }

  setTimeout(() => {
      if (confettiContainer && confettiContainer.parentNode) {
          confettiContainer.parentNode.removeChild(confettiContainer);
      }
  }, 8000);
}

function startGame(difficulty: string): void {
  currentDifficulty = difficulty;
  const { grid, time } = difficulties[difficulty];
  timer = time;
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

  startGame('normal');
}

document.addEventListener('DOMContentLoaded', initGame);
