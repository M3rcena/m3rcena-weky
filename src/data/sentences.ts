export const EASY_SENTENCES: string[] = [
  "A blue whale is the biggest animal in the world, both in water and on land.",
  "Our fingerprints are very unique, and zebra and tiger stripes are just as unique.",
  "Pound cake got its name from its recipe: one pound of butter, eggs, and sugar.",
  "The femur or thigh bone is the strongest and longest bone in the human body.",
  "Giving cats candies is not a good idea because they cannot taste sweetness.",
  "Mars is a red planet because its surface contains a large amount of iron oxide.",
  "Strawberries are the only known fruit that has seeds on the outside of its skin.",
  "In Switzerland, it is illegal to own just one guinea pig because they are social.",
  "Most birds are left-handed and use their left foot to grasp food and objects.",
  "Honey never spoils and archaeologists have found edible honey thousands of years old.",
  "A group of flamingos gathered together in a flock is called a flamboyance.",
  "Octopuses have three hearts and blue blood pumped through their bodies.",
  "Bananas are curved because they grow towards the sun against gravity.",
  "Cows have best friends and get stressed when they are separated from them.",
  "Butterflies taste their food with their feet to test if plants are edible.",
];

export const MEDIUM_SENTENCES: string[] = [
  "While sharks kill an average of five people a year, cows kill an average of thirty-three people.",
  "Bamboo is one of the fastest-growing plants on Earth, growing up to thirty-five inches each day.",
  "Dreamt is the only common English word in the dictionary that ends with the letters mt.",
  "American black bears can actually come in colors like blonde, cinnamon, brown, white, and silver-blue.",
  "Diet soda cans float in water because artificial sweeteners are less dense than regular sugar.",
  "The largest internal organ in the human body is the liver, but the largest organ overall is skin.",
  "Winds are completely silent until they blow against an object like trees, buildings, or wires.",
  "Light from the sun takes approximately eight minutes and twenty seconds to reach the surface of Earth.",
  "The shortest commercial flight in the world lasts less than two minutes between two Scottish islands.",
  "Sea otters hold hands while sleeping so they do not drift away with ocean currents.",
  "Venus is the hottest planet in our solar system even though Mercury is much closer to the sun.",
  "Sloths can hold their breath underwater for up to forty minutes by slowing down their heart rate.",
  "The Eiffel Tower can grow more than six inches taller during summer days due to thermal expansion.",
  "A cloud of average cumulus size weighs around five hundred thousand kilograms or one million pounds.",
  "Koalas have unique fingerprints that are almost indistinguishable from human fingerprints.",
];

export const HARD_SENTENCES: string[] = [
  "Although the tongue is made of eight different muscles that work together seamlessly, it is not the strongest muscle in the human body.",
  "A teaspoon of neutron star material would weigh approximately six billion tons on Earth due to extreme gravitational compression.",
  "Cleopatra lived chronologically closer to the completion of the Apollo Moon landing than to the initial construction of the Great Pyramids.",
  "The immortal jellyfish Turritopsis dohrnii can biologically revert its physical cells back to polyp form when subjected to extreme stress or starvation.",
  "Sound cannot travel through the vacuum of outer space because there are not enough gas molecules or particles to carry sound vibrations.",
  "Tardigrades can survive temperatures approaching absolute zero, cosmic radiation in space, and pressures six times deeper than the Marianas Trench.",
  "The speed of light in a true vacuum is exactly two hundred ninety-nine million seven hundred ninety-two thousand four hundred fifty-eight meters per second.",
  "Every hydrogen atom present in the water molecules of our bodies was forged in the primordial nucleosynthesis minutes after the Big Bang.",
  "The Voynich Manuscript is a mysterious fifteenth-century handwritten codex inscribed in an unknown writing system that has never been deciphered.",
  "Quantum entanglement occurs when pairs of particles interact in ways such that the quantum state of each particle cannot be described independently.",
];

export function getRandomSentence(difficulty: "easy" | "medium" | "hard" = "medium"): string {
  const list = difficulty === "easy" ? EASY_SENTENCES : difficulty === "hard" ? HARD_SENTENCES : MEDIUM_SENTENCES;
  return list[Math.floor(Math.random() * list.length)];
}
