-- CreateTable
CREATE TABLE "Bot" (
    "botID" TEXT NOT NULL,
    "botName" TEXT NOT NULL,
    "inits" INTEGER NOT NULL DEFAULT 0,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "usage_mini2024" INTEGER NOT NULL DEFAULT 0,
    "usage_calculator" INTEGER NOT NULL DEFAULT 0,
    "usage_chaosWords" INTEGER NOT NULL DEFAULT 0,
    "usage_fastType" INTEGER NOT NULL DEFAULT 0,
    "usage_fight" INTEGER NOT NULL DEFAULT 0,
    "usage_guessTheNumber" INTEGER NOT NULL DEFAULT 0,
    "usage_guessThePokemon" INTEGER NOT NULL DEFAULT 0,
    "usage_hangman" INTEGER NOT NULL DEFAULT 0,
    "usage_lieSwatter" INTEGER NOT NULL DEFAULT 0,
    "usage_neverHaveIEver" INTEGER NOT NULL DEFAULT 0,
    "usage_quickClick" INTEGER NOT NULL DEFAULT 0,
    "usage_shuffleGuess" INTEGER NOT NULL DEFAULT 0,
    "usage_snake" INTEGER NOT NULL DEFAULT 0,
    "usage_willYouPressTheButton" INTEGER NOT NULL DEFAULT 0,
    "usage_wouldYouRather" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("botID")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "ownerID" TEXT NOT NULL,
    "botID" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiKeyName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FightGame" (
    "gameID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "turn" INTEGER NOT NULL DEFAULT 0,
    "players" JSONB NOT NULL,

    CONSTRAINT "FightGame_pkey" PRIMARY KEY ("gameID")
);

-- CreateTable
CREATE TABLE "Game2048" (
    "gameID" TEXT NOT NULL,
    "playerID" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "board" JSONB NOT NULL,
    "gameOver" BOOLEAN NOT NULL DEFAULT false,
    "won" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Game2048_pkey" PRIMARY KEY ("gameID")
);

-- CreateTable
CREATE TABLE "Hangman" (
    "gameID" TEXT NOT NULL,
    "playerID" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "displayWord" TEXT NOT NULL,
    "guessedLetters" TEXT[],
    "wrongGuesses" INTEGER NOT NULL DEFAULT 0,
    "gameOver" BOOLEAN NOT NULL DEFAULT false,
    "won" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Hangman_pkey" PRIMARY KEY ("gameID")
);

-- CreateTable
CREATE TABLE "Snake" (
    "gameID" TEXT NOT NULL,
    "playerID" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "direction" TEXT NOT NULL,
    "gridSize" INTEGER NOT NULL,
    "snake" JSONB NOT NULL,
    "food" JSONB NOT NULL,
    "gameOver" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Snake_pkey" PRIMARY KEY ("gameID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game2048_playerID_key" ON "Game2048"("playerID");

-- CreateIndex
CREATE UNIQUE INDEX "Hangman_playerID_key" ON "Hangman"("playerID");

-- CreateIndex
CREATE UNIQUE INDEX "Snake_playerID_key" ON "Snake"("playerID");
