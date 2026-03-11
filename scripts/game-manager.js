// 06.06.2023 Version 4: Spiel ohne Tastatur, Pause und Game Over

'use strict';

import Config from './config.js';

export default class gameManager {
  #onGameOver;
  set onGameOver(callback) { this.#onGameOver = callback; }
  set onSnakeChanged(callback) { this.#listenableVariables['snake'].callback = callback; }
  set onFoodsChanged(callback) { this.#listenableVariables['foods'].callback = callback; }
  set onScoreChanged(callback) { this.#listenableVariables['score'].callback = callback; }
  set onHighScoreChanged(callback) { this.#listenableVariables['highScore'].callback = callback; }

  #listenableVariables = {
    snake: {},
    snakeStatusEffects: {},
    foods: {},
    score: {},
    highScore: {}
  };

  #setListenableVariable(variableName, value) {
    this.#listenableVariables[variableName].value = value;
    this.#executeIfExists(this.#listenableVariables[variableName].callback, value);
  }

  #executeIfExists(eventHandler, ...args) {
    if (eventHandler) {
      eventHandler(...args);
    }
  }

  get snakeStatusEffects() {
    throw new Error('Not implemented yet');
  }

  get snake() {
    let snake = this.#listenableVariables.snake.value;
    const timeDifference = Date.now() - this.#lastIntervalUpdateTime;
    const fraction = timeDifference / this.#frameTime;
    const fractionCapped = Math.min(fraction, 1);
    snake[0].fraction = fractionCapped;

    for (let i = 1; i < snake.length; i++) {
      snake[i].fraction = 1;
    }

    return snake;
  }
  get #snake() { return this.#listenableVariables.snake.value; }
  set #snake(value) { this.#setListenableVariable('snake', value); }
  get #snakeStatusEffects() { return this.#listenableVariables.snakeStatusEffects.value; }
  set #snakeStatusEffects(value) { this.#setListenableVariable('snakeStatusEffects', value); }
  get #foods() { return this.#listenableVariables.foods.value; }
  set #foods(value) { this.#setListenableVariable('foods', value); }
  get #score() { return this.#listenableVariables.score.value; }
  set #score(value) { this.#setListenableVariable('score', value); }
  get #highScore() { return this.#listenableVariables.highScore.value; }
  set #highScore(value) { this.#setListenableVariable('highScore', value); }

  #fieldWidth;
  #fieldHeight;

  #snakeSpeed;
  #frameTime;

  #lastIntervalUpdateTime;
  #lastPowerUpSpawnedTime;

  #powerUpSpawnInterval;
  #maxPowerUpCount;

  #direction = -1;
  #newDirection = -1;
  #bufferedDirection = -1;

  #game;
  #gamePaused;
  #gameOver;

  constructor() {
    // Keep this as small as possible to reduce visual load time
    this.updateSnakeSpeed(Config.fallbackSnakeSpeed);
  }

  updatePlayingField(fieldWidth, fieldHeight) {
    this.#fieldWidth = fieldWidth;
    this.#fieldHeight = fieldHeight;
    this.resetGame();
  }

  pauseGame() {
    this.#gamePaused = true;
    this.#direction = -1;
  }

  resumeGame() {
    this.#gamePaused = true;
  }

  resetGame() {
    this.#resetSnake();
    this.#resetFoods();
    this.#gameOver = false;
    this.#gamePaused = true;

    this.#direction = -1;
    this.#newDirection = -1;
    this.#bufferedDirection = -1;

    this.#lastIntervalUpdateTime = Date.now();
    this.#lastPowerUpSpawnedTime = Date.now();

    this.#score = 0;
    this.#highScore = Number(localStorage.getItem('highScore')) || 0;

    this.#powerUpSpawnInterval = Config.powerUpSpawnInterval;
    this.#maxPowerUpCount = Config.maxPowerUpCount;
    this.#snakeStatusEffects = [];
  }

  #resetSnake() {
    let snakeHead = this.#getRandomCoordinatesObject();
    const randomDirection = Math.random() * 3;
    const randomDirectionRounded = Math.floor(randomDirection);
    snakeHead.direction = randomDirectionRounded;
    snakeHead.fraction = 1;
    this.#snake = [snakeHead];
  }

  #resetFoods() {
    let food;
    do {
      const { x, y } = this.#getRandomCoordinatesObject();
      const normalFood = Config.normalFood;
      food = { x, y, ...normalFood };
    } while (this.#overlapsWithSnake(food));
    this.#foods = [food];
  }

  #getRandomCoordinatesObject() {
    const x = Math.random() * this.#fieldWidth;
    const y = Math.random() * this.#fieldHeight;
    const roundedX = Math.floor(x);
    const roundedY = Math.floor(y);
    return { x: roundedX, y: roundedY };
  }

  updateSnakeSpeed(snakeSpeed) {
    this.#snakeSpeed = snakeSpeed;
    this.#frameTime = 1000 / (snakeSpeed / 10);

    const timeSinceLastFrame = this.#getTimeSinceLastFrame();
    const timeToNextFrame = Math.max(this.#frameTime - timeSinceLastFrame, 0);
    this.#updateGameLoopInterval(timeToNextFrame);
  }

  #updateDirection() {
    if (this.#gamePaused) return;
    if (this.#newDirection != -1) {
      this.#direction = this.#newDirection;
    }
    this.#newDirection = this.#bufferedDirection;
    this.#bufferedDirection = -1;
  }

  handleDirectionInput(directionPressed) {
    if (directionPressed == -1) return;
    if (this.#gamePaused) return;

    let direction = this.#direction;
    if (direction == -1) {
      direction = this.#snake[0].direction;
    }

    const isLinus = this.#snake.length == 1;

    if (isLinus) {
      this.#handleDirectionInputWhenLinus(directionPressed);
    } else {
      this.#handleDirectionInputWhenLong(direction, directionPressed);
    }
  }

  #handleDirectionInputWhenLinus(directionPressed) {
    if (this.#newDirection == -1) {
      this.#newDirection = directionPressed;
    } else if (this.#bufferedDirection == -1 && directionPressed != this.#newDirection) {
      this.#bufferedDirection = directionPressed;
    }
  }

  #handleDirectionInputWhenLong(direction, directionPressed) {
    const isParallel = directionPressed % 2 == direction % 2;
    const isOpposite = directionPressed == (direction + 2) % 4;

    if (this.#newDirection == -1) {
      if (!isOpposite) {
        this.#newDirection = directionPressed;
      }
      return;
    }
    
    const isOppositeOfNew = directionPressed == (this.#newDirection + 2) % 4;
    const canSetBufferedDirection = !isOppositeOfNew && this.#bufferedDirection == -1 && directionPressed != this.#newDirection;
    
    if (canSetBufferedDirection) {
      this.#bufferedDirection = directionPressed;
    }
  }

  #getTimeSinceLastFrame() {
    const now = Date.now();
    return now - this.#lastIntervalUpdateTime;
  }

  #updateGameLoopInterval(timeToNextFrame) {
    if (!this.#game) return;
    clearInterval(this.#game);
    setTimeout(() => {
      this.#game = setInterval(this.#gameLoop.bind(this), this.#frameTime);
    }, timeToNextFrame);
  }

  requestFrameProgress() {
    const timeSinceLastFrame = this.#getTimeSinceLastFrame();
    const progress = timeSinceLastFrame / this.#frameTime;
    return progress;
  }

  startGame() {
    if (this.#gameOver) this.resetGame();
    this.#gamePaused = false;
    if (this.#game) return;
    if (!this.#snake || !this.#foods || this.#snake.length == 0 || this.#foods.length == 0) {
      throw new Error('Game cannot be started without snake or foods'
        , `snake: ${this.#snake}`
        , `foods: ${this.#foods}`
      );
    }
    this.#game = setInterval(this.#gameLoop.bind(this), this.#frameTime);
  }

  #gameLoop() {
    if (this.#gamePaused) return;
    this.#updateDirection();
    if (this.#direction == -1) return;
    this.#setIntervalTimestamp();
    this.#updateStatusEffects();
    this.#updatePowerUps();
    if (this.#snakeIsColliding()) {
      this.#gameOver = true;
      this.#executeIfExists(this.#onGameOver);
      this.resetGame();
      return;
    }
    this.#handleSnakeMovement();
    this.#score = this.#snake.length - 1;
    this.#highScore = Math.max(this.#highScore, this.#score);
    localStorage.setItem('highScore', this.#highScore);
  }

  #updateStatusEffects() {
    for (let i = 0; i < this.#snakeStatusEffects.length; i++) {
      const effect = this.#snakeStatusEffects[i];
      effect.timeLeft -= this.#frameTime;
      if (effect.timeLeft <= 0) {
        if (effect.onEnd) effect.onEnd();
        this.#snakeStatusEffects.splice(i, 1);
      }
    }
  }

  #updatePowerUps() {
    this.#handlePowerUpDespawn();

    const powerUpCount = this.#foods.filter(food => food && food.type != 'normal').length;
    if (powerUpCount >= this.#maxPowerUpCount) return;

    const now = Date.now();
    const timeSinceLastPowerUp = now - this.#lastPowerUpSpawnedTime;
    if (timeSinceLastPowerUp < this.#powerUpSpawnInterval) return;

    this.#spawnPowerUp();
  }

  #spawnPowerUp() {
    let powerUp;
    do {
      const { x, y } = this.#getRandomCoordinatesObject();
      const randomPowerUp = this.#getRandomPowerUp();
      powerUp = { x, y, ...randomPowerUp };
    } while (this.#overlapsWithSnake(powerUp.x, powerUp.y));

    this.#foods.push(powerUp);
    this.#lastPowerUpSpawnedTime = Date.now();
  }

  #handlePowerUpDespawn() {
    for (let i = this.#foods.length - 1; i >= 0; i--) {
      const food = this.#foods[i];
      if (!food.lifeSpan) continue;
      food.lifeSpan -= this.#frameTime;
      if (food.lifeSpan <= 0) {
        this.#foods.splice(i, 1);
      }
    }
  }




  #getRandomPowerUp() {
    const powerUps = Config.powerUps;
    const randomIndex = Math.floor(Math.random() * powerUps.length);
    return powerUps[randomIndex];
  }

  #setIntervalTimestamp() {
    const now = Date.now();
    this.#lastIntervalUpdateTime = now;
  }

  #snakeIsColliding() {
    const { x, y } = this.#getNewSnakeHead();
    if (this.#isOutOfBounds(x, y)) return true;
    if (this.#overlapsWithSnake(x, y)) return true;
    return false;
  }

  #isOutOfBounds(x, y) {
    if (x < 0 || y < 0) return true;
    if (x >= this.#fieldWidth || y >= this.#fieldHeight) return true;
    return false;
  }

  #overlapsWithSnake(x, y) {
    for (let i = this.#snake.length - 1; i >= 0; i--) {
      const snakePart = this.#snake[i];
      if (snakePart.x === x && snakePart.y === y) return true;
    }
    return false;
  }

  #handleSnakeMovement() {
    const newHead = this.#getNewSnakeHead();
    this.#snake.unshift(newHead);
    this.#handleFoodEaten();
    this.#snake.pop();
  }

  #handleFoodEaten() {
    const foodEaten = this.#getFoodEaten();
    if (foodEaten) {
      this.#handleFoodType(foodEaten);
      const foodIndex = this.#foods.indexOf(foodEaten);
      this.#foods.splice(foodIndex, 1);
    }
  }

  #handleFoodType(foodEaten) {
    const type = foodEaten.type;
    if (type == "normal") {
      this.#handleNormalFood();
      return;
    }
    if (type == "speed") {
      this.#handleSpeedFood(foodEaten);
      return;
    }
    if (type == "length") {
      this.#handleLengthFood(foodEaten);
      return;
    }
    throw new Error(`Unknown food type '${type}'`);
  }

  #handleNormalFood() {
    const tail = this.#snake[this.#snake.length - 1];
    this.#snake.push(tail);
    const { x, y } = this.#getRandomCoordinatesObject();
    const food = { x, y, ...Config.normalFood };
    this.#foods.push(food);
  }

  #handleSpeedFood(foodEaten) {
    const amount = this.#snakeSpeed - Math.round(this.#snakeSpeed * foodEaten.factor);
    const statusEffect = {
      type: 'speed',
      amount,
      timeLeft: foodEaten.duration,
      onEnd: () => this.updateSnakeSpeed(Number(this.#snakeSpeed) - Number(amount))
    };
    this.#snakeStatusEffects.push(statusEffect);
    this.updateSnakeSpeed(Number(this.#snakeSpeed) + Number(amount));
  }

  #handleLengthFood(foodEaten) {
    const amount = foodEaten.amount;
    const limiter = Math.abs(Math.min((this.#snake.length - 2) + amount, 0));
    const iterationCount = Math.abs(amount) - limiter;
    console.log('amount: ', amount);
    console.log('snake length: ', this.#snake.length);
    console.log(`Math.abs(Math.min((${this.#snake.length} - 1) + ${amount}, 0)))`);
    console.log('limiter: ', limiter);
    console.log('iterationCount: ', iterationCount);
    for (let i = 0; i < iterationCount; i++) {
      const tailIndex = this.#snake.length - 1;
      if (amount < 0) {
        this.#snake.splice(tailIndex, 1);
      } else if (amount > 0) {
        const tail = this.#snake[tailIndex];
        this.#snake.push(tail);
      }
    }
  }

  #getFoodEaten() {
    const snakeHead = this.#snake[0];
    for (const food of this.#foods) {
      if (!food) continue;
      if (snakeHead.x === food.x && snakeHead.y === food.y) {
        return food;
      }
    }
    return undefined;
  }

  #getNewSnakeHead() {
    const snakeHead = this.#snake[0];
    let newX = snakeHead.x;
    let newY = snakeHead.y;
    if (this.#direction === 0) newY--;
    if (this.#direction === 1) newX++;
    if (this.#direction === 2) newY++;
    if (this.#direction === 3) newX--;
    return { x: newX, y: newY, direction: this.#direction, fraction: 0 };
  }
}