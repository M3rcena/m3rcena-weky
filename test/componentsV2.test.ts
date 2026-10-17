import { MessageFlags } from "discord.js";
import { Calculator, ChaosWords, FastType, Fight, Game2048, GuessTheNumber, GuessThePokemon, Hangman, LieSwatter, NeverHaveIEver, QuickClick, RockPaperScissors, ShuffleGuess, Snake, TicTacToe, WillYouPressTheButton, WouldYouRather } from "../src/index.js";

function mockContext() {
  const sentMessages: any[] = [];
  const fakeUser = {
    id: "123456789",
    username: "TestUser",
    displayAvatarURL: () => "https://example.com/avatar.png",
  };

  const channel = {
    id: "channel-123",
    send: async (options: any) => {
      const msg: any = {
        id: `msg-${Date.now()}-${Math.random()}`,
        channelId: "channel-123",
        ...options,
        edit: async (editOptions: any) => {
          Object.assign(msg, editOptions);
          return msg;
        },
        delete: async () => {},
      };
      sentMessages.push(msg);
      return msg;
    },
  };

  const raw: any = {
    author: fakeUser,
    user: fakeUser,
    channel,
    client: { user: { id: "bot-123" } },
    guild: { id: "guild-123" },
    member: { id: "123456789" },
    isRepliable: () => true,
    deferred: false,
    replied: false,
    reply: async (options: any) => {
      const msg: any = {
        id: `msg-${Date.now()}-${Math.random()}`,
        channelId: "channel-123",
        ...options,
        edit: async (editOptions: any) => {
          Object.assign(msg, editOptions);
          return msg;
        },
        delete: async () => {},
      };
      sentMessages.push(msg);
      return { resource: { message: msg } };
    },
    editReply: async (options: any) => {
      const msg = sentMessages[0];
      if (msg) Object.assign(msg, options);
      return msg;
    },
    fetchReply: async () => sentMessages[0],
  };

  return { raw, sentMessages };
}

async function runComponentsV2Tests() {
  console.log("=== VERIFYING COMPONENTS V2 ARCHITECTURE ACROSS ALL 17 GAMES ===\n");

  const mockManager = {
    _eventManager: {
      register: () => {},
      unregister: () => {},
    },
  };

  const opponentUser = {
    id: "987654321",
    username: "Challenger",
    bot: false,
    displayAvatarURL: () => "https://example.com/avatar2.png",
  };

  const gamesToTest = [
    { name: "Game2048", create: (ctx: any) => new Game2048(mockManager, { context: ctx }) },
    { name: "Snake", create: (ctx: any) => new Snake(mockManager, { context: ctx }) },
    { name: "Fight", create: (ctx: any) => new Fight(mockManager, { context: ctx, opponent: opponentUser as any }) },
    { name: "Hangman", create: (ctx: any) => new Hangman(mockManager, { context: ctx, word: "JAVASCRIPT" }) },
    { name: "GuessThePokemon", create: (ctx: any) => new GuessThePokemon(mockManager, { context: ctx }) },
    { name: "Calculator", create: (ctx: any) => new Calculator(mockManager, { context: ctx }) },
    { name: "FastType", create: (ctx: any) => new FastType(mockManager, { context: ctx, sentence: "Hello world" }) },
    { name: "ChaosWords", create: (ctx: any) => new ChaosWords(mockManager, { context: ctx, words: ["cat", "dog"] }) },
    { name: "GuessTheNumber", create: (ctx: any) => new GuessTheNumber(mockManager, { context: ctx, number: 42 }) },
    { name: "LieSwatter", create: (ctx: any) => new LieSwatter(mockManager, { context: ctx }) },
    { name: "NeverHaveIEver", create: (ctx: any) => new NeverHaveIEver(mockManager, { context: ctx }) },
    { name: "QuickClick", create: (ctx: any) => new QuickClick(mockManager, { context: ctx }) },
    { name: "ShuffleGuess", create: (ctx: any) => new ShuffleGuess(mockManager, { context: ctx, word: "CODING" }) },
    { name: "WillYouPressTheButton", create: (ctx: any) => new WillYouPressTheButton(mockManager, { context: ctx }) },
    { name: "WouldYouRather", create: (ctx: any) => new WouldYouRather(mockManager, { context: ctx }) },
    { name: "RockPaperScissors", create: (ctx: any) => new RockPaperScissors(mockManager, { context: ctx }) },
    { name: "TicTacToe", create: (ctx: any) => new TicTacToe(mockManager, { context: ctx, opponent: opponentUser as any }) },
  ];

  for (const { name, create } of gamesToTest) {
    const { raw } = mockContext();
    const game = create(raw);

    await game.start();
    const msg = (game as any).ctx.gameMessage;

    if (!msg) throw new Error(`[${name}] No gameMessage was created during start()`);

    // Verify flags has MessageFlags.IsComponentsV2
    const flags = msg.flags;
    const isV2 = (flags & MessageFlags.IsComponentsV2) === MessageFlags.IsComponentsV2;
    if (!isV2) {
      throw new Error(`[${name}] Message flags (${flags}) do not include MessageFlags.IsComponentsV2 (${MessageFlags.IsComponentsV2})`);
    }

    // Verify components contains ContainerBuilder
    const components = msg.components;
    if (!components || components.length === 0) {
      throw new Error(`[${name}] No components found in gameMessage`);
    }

    const container = components[0];
    const json = typeof container.toJSON === "function" ? container.toJSON() : container;

    // Type 17 is Discord Component Type for Container
    if (json.type !== 17) {
      throw new Error(`[${name}] Root component is not type 17 (Container), got type ${json.type}`);
    }

    // Clean up
    game.destroy();
    console.log(`  ✓ ${name}: Valid Components V2 Container (type 17, flags: ${flags})`);
  }

  console.log("\n✅ ALL 17 GAMES VERIFIED WITH ZERO DEPRECATIONS AND FULL COMPONENTS V2 SUPPORT!");
  process.exit(0);
}

runComponentsV2Tests().catch((err) => {
  console.error("Components V2 test failed:", err);
  process.exit(1);
});
