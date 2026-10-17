export interface WYPTBDilemma {
  question: string;
  consequence: string;
  stats: {
    yes: string;
    no: string;
  };
}

export interface WYRDilemma {
  optionA: string;
  optionB: string;
  stats: {
    votesA: number;
    votesB: number;
  };
}

export const WYPTB_DILEMMAS: WYPTBDilemma[] = [
  {
    question: "You can teleport anywhere in the universe instantly.",
    consequence: "You arrive completely naked every time.",
    stats: { yes: "82%", no: "18%" },
  },
  {
    question: "You become a billionaire overnight.",
    consequence: "Every time you buy something, you must sing the receipt out loud.",
    stats: { yes: "74%", no: "26%" },
  },
  {
    question: "You can speak, read, and write every human language fluently.",
    consequence: "You can never speak in your native mother tongue again.",
    stats: { yes: "68%", no: "32%" },
  },
  {
    question: "You get photographic memory and never forget anything.",
    consequence: "You can never listen to music again.",
    stats: { yes: "45%", no: "55%" },
  },
  {
    question: "You can stop time whenever you want.",
    consequence: "Every second time is stopped, you age by two seconds.",
    stats: { yes: "59%", no: "41%" },
  },
  {
    question: "You can eat whatever you want without gaining weight or getting unhealthy.",
    consequence: "All drinks taste like lukewarm tap water.",
    stats: { yes: "63%", no: "37%" },
  },
  {
    question: "You become the greatest gamer in the world across all titles.",
    consequence: "You can only play with inverted controls forever.",
    stats: { yes: "51%", no: "49%" },
  },
  {
    question: "You can read people's minds whenever you make eye contact.",
    consequence: "You cannot turn it off, and they can hear your thoughts too.",
    stats: { yes: "38%", no: "62%" },
  },
  {
    question: "You have unlimited battery on all your electronic devices forever.",
    consequence: "Your Wi-Fi speed is capped at 10 Mbps.",
    stats: { yes: "42%", no: "58%" },
  },
  {
    question: "You can breathe underwater and swim like a fish.",
    consequence: "You can never eat seafood again.",
    stats: { yes: "79%", no: "21%" },
  },
  {
    question: "You never need to sleep again and never feel tired.",
    consequence: "You can never dream again.",
    stats: { yes: "71%", no: "29%" },
  },
  {
    question: "You can talk to animals and understand them perfectly.",
    consequence: "They all have incredibly sarcastic British accents.",
    stats: { yes: "88%", no: "12%" },
  },
  {
    question: "You always win every lottery or raffle you enter.",
    consequence: "Fifty percent of all your winnings must be donated to charity.",
    stats: { yes: "94%", no: "6%" },
  },
  {
    question: "You are immune to all physical pain and sickness.",
    consequence: "You stub your toe every single morning at 7:00 AM.",
    stats: { yes: "76%", no: "24%" },
  },
  {
    question: "You can travel back in time to fix any past mistake.",
    consequence: "A random stranger forgets you ever existed.",
    stats: { yes: "81%", no: "19%" },
  },
];

export const WYR_DILEMMAS: WYRDilemma[] = [
  {
    optionA: "Be able to see 10 minutes into the future",
    optionB: "Be able to see 100 years into the future",
    stats: { votesA: 58, votesB: 42 },
  },
  {
    optionA: "Never have to clean dishes again",
    optionB: "Never have to do laundry again",
    stats: { votesA: 52, votesB: 48 },
  },
  {
    optionA: "Live in a world without music",
    optionB: "Live in a world without movies and television",
    stats: { votesA: 28, votesB: 72 },
  },
  {
    optionA: "Always be 15 minutes late everywhere",
    optionB: "Always be 20 minutes early everywhere",
    stats: { votesA: 19, votesB: 81 },
  },
  {
    optionA: "Have unlimited free flights for life",
    optionB: "Never have to pay for food anywhere for life",
    stats: { votesA: 41, votesB: 59 },
  },
  {
    optionA: "Be fluent in every programming language",
    optionB: "Be fluent in every spoken human language",
    stats: { votesA: 33, votesB: 67 },
  },
  {
    optionA: "Have super strength like Superman",
    optionB: "Have super intelligence like Batman",
    stats: { votesA: 36, votesB: 64 },
  },
  {
    optionA: "Always have damp socks on your feet",
    optionB: "Always have an annoying eyelash stuck in your eye",
    stats: { votesA: 62, votesB: 38 },
  },
  {
    optionA: "Live in virtual reality with total control",
    optionB: "Live in the real world with normal limitations",
    stats: { votesA: 44, votesB: 56 },
  },
  {
    optionA: "Be able to rewind time by 5 seconds",
    optionB: "Be able to pause time for 10 seconds",
    stats: { votesA: 73, votesB: 27 },
  },
];

export function getRandomWYPTB(): WYPTBDilemma {
  return WYPTB_DILEMMAS[Math.floor(Math.random() * WYPTB_DILEMMAS.length)];
}

export function getRandomWYR(): WYRDilemma {
  return WYR_DILEMMAS[Math.floor(Math.random() * WYR_DILEMMAS.length)];
}
