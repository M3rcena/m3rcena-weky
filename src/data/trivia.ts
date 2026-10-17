export interface TriviaFact {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export const TRIVIA_FACTS: TriviaFact[] = [
  {
    statement: "Bananas are berries, but strawberries are not.",
    isTrue: true,
    explanation: "Botanically, a berry has seeds inside a fleshy pericarp. Bananas qualify, but strawberry seeds are achenes on the exterior.",
  },
  {
    statement: "Goldfish only have a memory span of three seconds.",
    isTrue: false,
    explanation: "Scientific research has proven goldfish have a memory span of at least several months and can be trained.",
  },
  {
    statement: "Lightning never strikes the same place twice.",
    isTrue: false,
    explanation: "Lightning frequently strikes the exact same place repeatedly; the Empire State Building is struck dozens of times annually.",
  },
  {
    statement: "Humans share approximately 50% of their DNA with bananas.",
    isTrue: true,
    explanation: "Many fundamental cellular processes and housekeeping genes are conserved across living organisms.",
  },
  {
    statement: "The Great Wall of China is visible from the Moon with the naked human eye.",
    isTrue: false,
    explanation: "Astronauts have confirmed that no human structure is visible from the Moon without optical magnification.",
  },
  {
    statement: "Water drains in different directions in the Northern and Southern Hemispheres due to the Coriolis effect.",
    isTrue: false,
    explanation: "The Coriolis effect operates on large atmospheric scales. Household sink drainage is dictated by basin shape and plumbing.",
  },
  {
    statement: "An octopus has three hearts and blue blood.",
    isTrue: true,
    explanation: "Two branchial hearts pump blood through the gills, one systemic heart pumps to the body, and copper-based hemocyanin turns blood blue.",
  },
  {
    statement: "Wombat feces are cube-shaped.",
    isTrue: true,
    explanation: "The unique elasticity of a wombat's intestinal walls shapes feces into cubes, preventing them from rolling away.",
  },
  {
    statement: "Sharks are immune to all forms of cancer.",
    isTrue: false,
    explanation: "This is a widespread medical myth. Sharks do contract cancer, including tumors in their cartilage.",
  },
  {
    statement: "Honey never spoils, even after thousands of years.",
    isTrue: true,
    explanation: "Low moisture content and high acidity prevent bacteria and microorganisms from surviving in raw honey.",
  },
  {
    statement: "Hot water always freezes faster than cold water in all conditions.",
    isTrue: false,
    explanation: "The Mpemba effect only occurs under very specific, controlled thermodynamic conditions and is not universal.",
  },
  {
    statement: "There are more trees on planet Earth than stars in the Milky Way galaxy.",
    isTrue: true,
    explanation: "Earth has roughly 3 trillion trees, while the Milky Way is estimated to contain 100 to 400 billion stars.",
  },
  {
    statement: "Oxford University is older than the Aztec Empire.",
    isTrue: true,
    explanation: "Teaching at Oxford began around 1096, whereas the Aztec civilization was founded in 1325 with Tenochtitlan.",
  },
  {
    statement: "Mount Everest is the closest point on Earth to outer space.",
    isTrue: false,
    explanation: "Because Earth bulges at the equator, Mount Chimborazo in Ecuador is the farthest point from Earth's center.",
  },
  {
    statement: "A day on Venus is longer than a year on Venus.",
    isTrue: true,
    explanation: "Venus takes 243 Earth days to rotate once on its axis, but only 225 Earth days to complete an orbit around the Sun.",
  },
];

export const NEVER_HAVE_I_EVER_PROMPTS: string[] = [
  "Never have I ever pretended to be sick to avoid attending an event.",
  "Never have I ever sent a message to the wrong Discord server or person.",
  "Never have I ever stayed up past 4:00 AM playing a video game.",
  "Never have I ever re-gifted a present that someone gave to me.",
  "Never have I ever eaten food that fell on the floor after the 5-second rule.",
  "Never have I ever sang loudly in the shower thinking nobody could hear me.",
  "Never have I ever accidentally liked a years-old post while stalking someone on social media.",
  "Never have I ever forgotten someone's name immediately after they introduced themselves.",
  "Never have I ever spent money on an in-game cosmetic item and immediately regretted it.",
  "Never have I ever laughed so hard that drinks came out of my nose.",
  "Never have I ever walked into a glass door or window thinking it was open.",
  "Never have I ever blamed a pet for something that I actually broke or did.",
  "Never have I ever binge-watched an entire season of a television show in a single day.",
  "Never have I ever tried to plug in a USB drive upside down three times in a row.",
  "Never have I ever rage-quit a multiplayer match and closed Discord in defeat.",
];

export function getRandomTriviaFact(): TriviaFact {
  return TRIVIA_FACTS[Math.floor(Math.random() * TRIVIA_FACTS.length)];
}

export function getRandomNHIE(): string {
  return NEVER_HAVE_I_EVER_PROMPTS[Math.floor(Math.random() * NEVER_HAVE_I_EVER_PROMPTS.length)];
}
