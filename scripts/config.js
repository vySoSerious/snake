// 06.06.2023 Version 4: Spiel ohne Tastatur, Pause und Game Over


export default class Config {
  static #boxSize = 42;
  static #startLength = 1;
  static #fallbackBackgroundColor = "#000000";
  static #fallbackSnakeColor = "#FFFFFF";
  static #fallbackFoodColor = "#FF0000";
  static #fallbackSnakeSpeed = 40;
  static #transitionDuration = 500;

  static #menuConfigurations = {
    afterReset: {
      showDesignMenu: true,
      showPreviewMenu: true,
      showGameOverMenu: false,
      buttons: ["Start Game"],
    },
    afterStart: {
      showDesignMenu: true,
      showPreviewMenu: true,
      showGameOverMenu: false,
      buttons: ["Resume", "New Game"],
    },
    afterOver: {
      showDesignMenu: false,
      showPreviewMenu: false,
      showGameOverMenu: true,
      buttons: ["New Game"],
    }
  };

  static #difficultyLevels = [
    {
      name: "Easy",
      speed: 40
    },
    {
      name: "Medium",
      speed: 60
    },
    {
      name: "Hard",
      speed: 80
    },
    {
      name: "Expert",
      speed: 110
    },
    {
      name: "Insane",
      speed: 150
    },
    {
      name: "Impossible",
      speed: 200
    }
  ];

  static #themes = [
    {
      name: "Classic",
      backgroundColor: "#000000",
      snakeColor: "#FFFFFF"
    },
    {
      name: "Twilight",
      backgroundColor: "#222831",
      snakeColor: "#FFD369"
    },
    {
      name: "Stormy Night",
      backgroundColor: "#363537",
      snakeColor: "#E94560"
    },
    {
      name: "Calm Sea",
      backgroundColor: "#28334A",
      snakeColor: "#C4ACB4"
    },
    {
      name: "Dusk",
      backgroundColor: "#353535",
      snakeColor: "#6EC1E4"
    },
    {
      name: "Enchanted Forest",
      backgroundColor: "#2B2D42",
      snakeColor: "#8D99AE"
    },
  ];

  static #snakePatterns = [
    {
      name: "None",
      path: ""
    },
    {
      name: "Stripes",
      path: "../patterns/stripes.svg"
    }
  ]

  static #normalFood = {
    type: "normal",
    iconName: "apple",
    iconColor: "#FF3A4C"
  }
  static #powerUpSpawnInterval = 7000;
  static #maxPowerUpCount = 3;
  static #powerUps = [
    {
      type: "speed",
      iconName: "speed-up",
      iconColor: "#FFD369",
      factor: 1.35,
      duration: 5000,
      lifeSpan: 14000
    },
    {
      type: "speed",
      iconName: "slow-down",
      iconColor: "#6EC1E4",
      factor: 0.65,
      duration: 5000,
      lifeSpan: 14000
    },
    {
      type: "length",
      iconName: "lengthen",
      iconColor: "#FF0000",
      amount: 3,
      lifeSpan: 14000
    },
    {
      type: "length",
      iconName: "shorten",
      iconColor: "#8D99AE",
      amount: -3,
      lifeSpan: 14000
    },
    // {
    //   type: "reverse",
    // },
    // {
    //   type: "invert",
    //   duration: 5000,
    // },     
    // {
    //   type: "teleportAbility",
    //   distance: 3,
    // },
    // {
    //   type: "teleportRandom",
    //   distance: 5,
    // },
    // {
    //   type: "shield",
    //   hitPoints: 1,
    // }
  ]

  static get boxSize() { return this.#boxSize; }
  static get startLength() { return this.#startLength; }
  static get fallbackBackgroundColor() { return this.#fallbackBackgroundColor; }
  static get fallbackSnakeColor() { return this.#fallbackSnakeColor; }
  static get fallbackFoodColor() { return this.#fallbackFoodColor; }
  static get fallbackSnakeSpeed() { return this.#fallbackSnakeSpeed; }
  static get transitionDuration() { return this.#transitionDuration; }
  static get menuConfigurations() { return this.#menuConfigurations; }
  static get difficultyLevels() { return this.#difficultyLevels; }
  static get themes() { return this.#themes; }
  static get snakePatterns() { return this.#snakePatterns; }
  static get normalFood() { return this.#normalFood; }
  static get powerUpSpawnInterval() { return this.#powerUpSpawnInterval; }
  static get maxPowerUpCount() { return this.#maxPowerUpCount; }
  static get powerUps() { return this.#powerUps; }
}
