import { RenderHangman } from "../canvas/RenderHangman.js";
import { WekyCanvas } from "../canvas/WekyCanvas.js";
import { GameControlRow } from "../core/ControlTypes.js";
import { getRandomWord } from "../data/words.js";

export interface HangmanEngineOptions {
  word?: string;
  maxMistakes?: number;
}

export interface HangmanState {
  word: string;
  maskedWord: string;
  guessedLetters: string[];
  mistakes: number;
  maxMistakes: number;
  isWon: boolean;
  isGameOver: boolean;
}

/**
 * Headless Hangman word puzzle engine for dashboards and web interfaces.
 */
export class HangmanEngine {
  private word: string = "";
  private guessedLetters: string[] = [];
  private mistakes: number = 0;
  private maxMistakes: number;
  private isWon: boolean = false;
  private isGameOver: boolean = false;

  constructor(options?: HangmanEngineOptions) {
    this.maxMistakes = options?.maxMistakes || 6;
    this.word = (options?.word || getRandomWord()).toUpperCase().trim();
  }

  /**
   * Resets the game with an optional new word.
   */
  public reset(newWord?: string): void {
    this.word = (newWord || getRandomWord()).toUpperCase().trim();
    this.guessedLetters = [];
    this.mistakes = 0;
    this.isWon = false;
    this.isGameOver = false;
  }

  /**
   * Makes a letter guess.
   */
  public guess(letter: string): { correct: boolean; isWon: boolean; isGameOver: boolean } {
    if (this.isGameOver) return { correct: false, isWon: this.isWon, isGameOver: true };

    const char = letter.toUpperCase().trim();
    if (!char || char.length !== 1 || this.guessedLetters.includes(char)) {
      return { correct: false, isWon: this.isWon, isGameOver: this.isGameOver };
    }

    this.guessedLetters.push(char);

    const isMatch = this.word.includes(char);
    if (!isMatch) {
      this.mistakes++;
      if (this.mistakes >= this.maxMistakes) {
        this.isGameOver = true;
      }
    } else {
      const allFound = this.word.split("").every((c) => c === " " || this.guessedLetters.includes(c));
      if (allFound) {
        this.isWon = true;
        this.isGameOver = true;
      }
    }

    return { correct: isMatch, isWon: this.isWon, isGameOver: this.isGameOver };
  }

  /**
   * Returns current game state.
   */
  public getState(): HangmanState {
    const masked = this.word
      .split("")
      .map((c) => (c === " " ? " " : this.guessedLetters.includes(c) ? c : "_"))
      .join(" ");

    return {
      word: this.word,
      maskedWord: masked,
      guessedLetters: [...this.guessedLetters],
      mistakes: this.mistakes,
      maxMistakes: this.maxMistakes,
      isWon: this.isWon,
      isGameOver: this.isGameOver,
    };
  }

  /**
   * Returns keyboard layout controls schema for web dashboards.
   */
  public getControls(): GameControlRow[] {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const rows: GameControlRow[] = [];
    // 4 rows of letters
    const rowSizes = [7, 7, 6, 6];
    let offset = 0;

    for (const size of rowSizes) {
      const chunk = letters.slice(offset, offset + size);
      offset += size;

      const components = chunk.map((letter) => {
        const isGuessed = this.guessedLetters.includes(letter);
        const inWord = isGuessed && this.word.includes(letter);
        const style: "primary" | "secondary" | "success" | "danger" = inWord ? "success" : isGuessed ? "danger" : "secondary";

        return {
          id: letter,
          label: letter,
          style,
          disabled: this.isGameOver || isGuessed,
        };
      });

      rows.push({ components });
    }

    return rows;
  }

  /**
   * Renders the Hangman canvas board as a PNG buffer.
   */
  public async renderCard(username: string = "Player", avatarUrl: string = ""): Promise<Buffer> {
    const masked = this.getState().maskedWord;
    return RenderHangman.renderCard(this.mistakes, masked, this.guessedLetters, username, avatarUrl, this.isGameOver, this.isWon, this.word);
  }

  /**
   * Renders the Hangman board as a Data URL string.
   */
  public async renderDataURL(username: string = "Player", avatarUrl: string = ""): Promise<string> {
    const buffer = await this.renderCard(username, avatarUrl);
    return WekyCanvas.toDataURL(buffer);
  }
}
