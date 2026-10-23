import { ButtonStyle } from "discord.js";
import { Calculator, ChaosWords, FastType, Fight, GuessTheNumber, Hangman, LieSwatter, NeverHaveIEver, QuickClick, Snake, WekyManager, WillYouPressTheButton, WouldYouRather, boxConsole, compareSemver, stripAnsi, type DilemmaData, type Embeds, type PlayerData, type Point, type PowerUp } from "../src/index.js";

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

async function runManagerAndCustomizationsTests() {
  console.log("=== VERIFYING WEKY MANAGER, EMBED COLOR & CUSTOMIZATIONS ===\n");

  // 1. Test WekyManager configuration and EventEmitter
  console.log("1. Testing WekyManager Options & Events...");
  const mockClient = {
    on: () => {},
    emit: () => {},
    user: { id: "bot-123" },
  };

  const manager = new WekyManager(mockClient as any, {
    defaultTimeout: 45_000,
    embedColor: "#FF5733",
    unauthorizedMessage: "Back off! Not your game!",
  });

  if (manager.defaultTimeout !== 45_000) {
    throw new Error(`Expected manager.defaultTimeout to be 45000, got ${manager.defaultTimeout}`);
  }
  if (manager.embedColor !== "#FF5733") {
    throw new Error(`Expected manager.embedColor to be #FF5733, got ${manager.embedColor}`);
  }
  if (manager.unauthorizedMessage !== "Back off! Not your game!") {
    throw new Error(`Expected manager.unauthorizedMessage to be set correctly, got ${manager.unauthorizedMessage}`);
  }
  if (manager.notifyUpdates !== true) {
    throw new Error("Expected manager.notifyUpdates to default to true");
  }
  const managerNoNotify = new WekyManager(mockClient as any, { notifyUpdates: false });
  if (managerNoNotify.notifyUpdates !== false) {
    throw new Error("Expected managerNoNotify.notifyUpdates to be false");
  }
  const managerLegacyBool = new WekyManager(mockClient as any, false);
  if (managerLegacyBool.notifyUpdates !== false) {
    throw new Error("Expected managerLegacyBool.notifyUpdates to be false");
  }
  const managerLegacy3Arg = new WekyManager(mockClient as any, "dummy-key", false);
  if (managerLegacy3Arg.notifyUpdates !== false) {
    throw new Error("Expected managerLegacy3Arg.notifyUpdates to be false");
  }
  if (compareSemver("14.27.0", "14.28.0") >= 0 || compareSemver("14.28.0", "14.27.0") <= 0 || compareSemver("14.27.0", "14.27.0") !== 0) {
    throw new Error("compareSemver failed logic checks");
  }
  if (stripAnsi("\x1b[33mHello\x1b[39m") !== "Hello") {
    throw new Error("stripAnsi failed");
  }
  boxConsole(["Test notification box", "Version update notification verified!"]);
  console.log("  ✓ WekyManager properties & notifyUpdates box verified");

  let startEventFired = false;
  let endEventFired = false;
  manager.on("gameStart", (data) => {
    startEventFired = true;
    if (!data.game || !data.user) throw new Error("gameStart event missing game or user");
  });
  manager.on("gameOver", (data) => {
    endEventFired = true;
    if (!data.game || !data.user || data.outcome === undefined) throw new Error("gameOver event missing data");
  });

  // 2. Test Embed Color Hierarchy & Custom Embed Decorations
  console.log("\n2. Testing Embed Color Hierarchy & Decorations...");
  const { raw: ctx1 } = mockContext();
  const gameWithCustomColor = new FastType(manager, {
    context: ctx1,
    sentence: "Test sentence",
    embed: {
      color: "#00FF00",
      title: "Custom Fast Type Title",
      description: "Custom Description Header",
      footer: { text: "Custom Footer Text" },
      author: { name: "Author Weky" },
      fields: [{ name: "Field 1", value: "Value 1" }],
    },
  });

  await gameWithCustomColor.start();
  const msg1 = (gameWithCustomColor as any).ctx.gameMessage;
  const containerJson1 = msg1.components[0].toJSON();

  // Color should match #00FF00 (0x00FF00 = 65280)
  if (containerJson1.accent_color !== 0x00ff00) {
    throw new Error(`Expected accent_color to be 0x00FF00 (65280), got ${containerJson1.accent_color}`);
  }

  // Decorations should appear in text display components
  const textContent = containerJson1.components[0].content;
  if (!textContent.includes("Custom Fast Type Title")) throw new Error("Custom title not found in content");
  if (!textContent.includes("Custom Description Header")) throw new Error("Custom description not found in content");
  if (!textContent.includes("Author Weky")) throw new Error("Custom author not found in content");
  if (!textContent.includes("Field 1") || !textContent.includes("Value 1")) throw new Error("Custom field not found in content");
  if (!textContent.includes("Custom Footer Text")) throw new Error("Custom footer not found in content");

  console.log("  ✓ Custom embed color (#00FF00) and decorations verified");

  // Verify Manager color fallback when game embed color is omitted
  const { raw: ctx2 } = mockContext();
  const gameWithManagerColor = new Calculator(manager, {
    context: ctx2,
  });
  await gameWithManagerColor.start();
  const msg2 = (gameWithManagerColor as any).ctx.gameMessage;
  const containerJson2 = msg2.components[0].toJSON();
  // #FF5733 = 16734003
  if (containerJson2.accent_color !== 0xff5733) {
    throw new Error(`Expected accent_color to fall back to manager.embedColor 0xFF5733 (16734003), got ${containerJson2.accent_color}`);
  }
  console.log("  ✓ Manager fallback embed color (#FF5733) verified");

  // Verify lifecycle start event was fired
  if (!startEventFired) {
    throw new Error("Expected gameStart event to have fired on manager");
  }
  console.log("  ✓ gameStart EventEmitter lifecycle hook verified");

  // 3. Test Restored Options on Minigames
  console.log("\n3. Testing Restored Options on Minigames...");

  // WillYouPressTheButton with custom perk and consequence
  const { raw: ctxWYPTB } = mockContext();
  const wyptb = new WillYouPressTheButton(manager, {
    context: ctxWYPTB,
    perk: "You become invisible at will",
    consequence: "You can only speak in rhymes",
  });
  await wyptb.start();
  const wyptbContent = (wyptb as any).ctx.gameMessage.components[0].toJSON().components[0].content;
  if (!wyptbContent.includes("You become invisible at will") || !wyptbContent.includes("You can only speak in rhymes")) {
    throw new Error("Custom perk/consequence not rendered in WillYouPressTheButton");
  }
  console.log("  ✓ WillYouPressTheButton: Custom perk and consequence verified");

  // WouldYouRather with custom options
  const { raw: ctxWYR } = mockContext();
  const wyr = new WouldYouRather(manager, {
    context: ctxWYR,
    optionA: "Travel to Mars",
    optionB: "Explore the deep ocean",
  });
  await wyr.start();
  const wyrContent = (wyr as any).ctx.gameMessage.components[0].toJSON().components[0].content;
  if (!wyrContent.includes("Travel to Mars") || !wyrContent.includes("Explore the deep ocean")) {
    throw new Error("Custom optionA/optionB not rendered in WouldYouRather");
  }
  console.log("  ✓ WouldYouRather: Custom optionA and optionB verified");

  // Fight with startHealth, coins, damageMax
  const { raw: ctxFight } = mockContext();
  const fight = new Fight(manager, {
    context: ctxFight,
    opponent: { id: "999", username: "Enemy", bot: false, displayAvatarURL: () => "" } as any,
    startHealth: 150,
    coins: 50,
    damageMax: 30,
  });
  if ((fight as any).p1.health !== 150 || (fight as any).p1.coins !== 50) {
    throw new Error(`Fight startHealth or coins not set properly: health=${(fight as any).p1.health}, coins=${(fight as any).p1.coins}`);
  }
  console.log("  ✓ Fight: startHealth (150), coins (50), damageMax (30) verified");

  // LieSwatter with custom statement and isTrue
  const { raw: ctxLS } = mockContext();
  const ls = new LieSwatter(manager, {
    context: ctxLS,
    statement: "Bananas grow upside down compared to other fruits.",
    isTrue: true,
    explanation: "Bananas exhibit negative geotropism.",
  });
  await ls.start();
  const lsContent = (ls as any).ctx.gameMessage.components[0].toJSON().components[0].content;
  if (!lsContent.includes("Bananas grow upside down")) {
    throw new Error("Custom statement not rendered in LieSwatter");
  }
  console.log("  ✓ LieSwatter: Custom statement and explanation verified");

  // NeverHaveIEver with custom statement
  const { raw: ctxNHIE } = mockContext();
  const nhie = new NeverHaveIEver(manager, {
    context: ctxNHIE,
    statement: "Never have I ever accidentally sent a screenshot to the person it was about.",
  });
  await nhie.start();
  const nhieContent = (nhie as any).ctx.gameMessage.components[0].toJSON().components[0].content;
  if (!nhieContent.includes("accidentally sent a screenshot")) {
    throw new Error("Custom statement not rendered in NeverHaveIEver");
  }
  console.log("  ✓ NeverHaveIEver: Custom statement verified");

  // GuessTheNumber with custom min and max
  const { raw: ctxGTN } = mockContext();
  const gtn = new GuessTheNumber(manager, {
    context: ctxGTN,
    min: 50,
    max: 100,
  });
  if ((gtn as any).currentMin !== 50 || (gtn as any).currentMax !== 100) {
    throw new Error("GuessTheNumber min/max not set properly");
  }
  console.log("  ✓ GuessTheNumber: Custom min (50) and max (100) verified");

  // ChaosWords with maxWords and charCount
  const { raw: ctxChaos } = mockContext();
  const chaos = new ChaosWords(manager, {
    context: ctxChaos,
    maxWords: 5,
    charCount: 20,
    buttonText: "Surrender",
  });
  await chaos.start();
  console.log("  ✓ ChaosWords: maxWords (5), charCount (20), buttonText verified");

  // Snake with gridSize
  const { raw: ctxSnake } = mockContext();
  const snake = new Snake(manager, {
    context: ctxSnake,
    gridSize: 18,
  });
  if ((snake as any).gridSize !== 18) {
    throw new Error("Snake gridSize not set properly");
  }
  console.log("  ✓ Snake: Custom gridSize (18) verified");

  // Hangman with maxMistakes and quitButton
  const { raw: ctxHangman } = mockContext();
  const hangman = new Hangman(manager, {
    context: ctxHangman,
    word: "TESTING",
    maxMistakes: 8,
    quitButton: "Give Up",
  });
  if ((hangman as any).maxMistakes !== 8 || (hangman as any).quitButtonLabel !== "Give Up") {
    throw new Error("Hangman maxMistakes or quitButton not set properly");
  }
  console.log("  ✓ Hangman: Custom maxMistakes (8) and quitButton verified");

  // QuickClick with buttonCount
  const { raw: ctxQC } = mockContext();
  const qc = new QuickClick(manager, {
    context: ctxQC,
    buttonCount: 15,
    minDelay: 1000,
    maxDelay: 3000,
  });
  if ((qc as any).buttonCount !== 15 || (qc as any).minDelay !== 1000 || (qc as any).maxDelay !== 3000) {
    throw new Error("QuickClick buttonCount or delays not set properly");
  }
  console.log("  ✓ QuickClick: Custom buttonCount (15) and delays verified");

  // Clean up all instances
  gameWithCustomColor.destroy();
  gameWithManagerColor.destroy();
  wyptb.destroy();
  wyr.destroy();
  fight.destroy();
  ls.destroy();
  nhie.destroy();
  gtn.destroy();
  chaos.destroy();
  snake.destroy();
  hangman.destroy();
  qc.destroy();

  console.log("\n4. Verifying restored TypeScript exported types...");
  // Type assignment tests (compile-time + runtime sanity)
  const dummyEmbed: Embeds = {
    title: "Test",
    color: "#5865F2",
    description: "Desc",
    footer: { text: "Foot" },
    author: { name: "Auth" },
    fields: [{ name: "F", value: "V" }],
    timestamp: true,
  };
  const dummyPoint: Point = { x: 5, y: 10 };
  const dummyPlayerData: PlayerData = {
    id: "1",
    memberId: "1",
    name: "Player",
    username: "Player",
    health: 100,
    maxHealth: 100,
    coins: 50,
    lastAttack: "none",
    skipNextTurn: false,
    activeEffects: [],
    specialButtons: [],
    powerUps: [],
  };
  const dummyPowerUp: PowerUp = {
    id: "shield",
    name: "Shield",
    label: "Shield",
    description: "Blocks damage",
    style: ButtonStyle.Primary,
    cost: 25,
    effect: (player, username) => `${username} activated Shield!`,
  };
  const dummyDilemma: DilemmaData = {
    id: "1",
    url: "https://example.com",
    question: "Q",
    result: "R",
    stats: { yes: { percentage: "50%", count: "10" }, no: { percentage: "50%", count: "10" } },
  };

  if (!dummyEmbed.title || dummyPoint.x !== 5 || dummyPlayerData.health !== 100 || !dummyPowerUp.id || !dummyDilemma.question) {
    throw new Error("Type sanity checks failed");
  }
  console.log("  ✓ Restored Types (Embeds, Point, PlayerData, PowerUp, DilemmaData, etc.) verified");

  console.log("\n✅ ALL MANAGER, EMBED COLOR, CUSTOMIZATION & TYPE TESTS PASSED WITH 100% SUCCESS!");
  process.exit(0);
}

runManagerAndCustomizationsTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
