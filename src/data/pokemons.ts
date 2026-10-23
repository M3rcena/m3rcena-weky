export interface PokemonData {
  id: number;
  name: string;
  types: string[];
  abilities: string[];
  imageUrl: string;
}

export type PokemonEntry = PokemonData;

export const POPULAR_POKEMONS: PokemonData[] = [
  {
    id: 25,
    name: "Pikachu",
    types: ["Electric"],
    abilities: ["Static", "Lightning Rod"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
  },
  {
    id: 6,
    name: "Charizard",
    types: ["Fire", "Flying"],
    abilities: ["Blaze", "Solar Power"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
  },
  {
    id: 9,
    name: "Blastoise",
    types: ["Water"],
    abilities: ["Torrent", "Rain Dish"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
  },
  {
    id: 3,
    name: "Venusaur",
    types: ["Grass", "Poison"],
    abilities: ["Overgrow", "Chlorophyll"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
  },
  {
    id: 94,
    name: "Gengar",
    types: ["Ghost", "Poison"],
    abilities: ["Cursed Body"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
  },
  {
    id: 150,
    name: "Mewtwo",
    types: ["Psychic"],
    abilities: ["Pressure", "Unnerve"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
  },
  {
    id: 133,
    name: "Eevee",
    types: ["Normal"],
    abilities: ["Run Away", "Adaptability", "Anticipation"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
  },
  {
    id: 143,
    name: "Snorlax",
    types: ["Normal"],
    abilities: ["Immunity", "Thick Fat", "Gluttony"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
  },
  {
    id: 149,
    name: "Dragonite",
    types: ["Dragon", "Flying"],
    abilities: ["Inner Focus", "Multiscale"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png",
  },
  {
    id: 448,
    name: "Lucario",
    types: ["Fighting", "Steel"],
    abilities: ["Steadfast", "Inner Focus", "Justified"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png",
  },
  {
    id: 658,
    name: "Greninja",
    types: ["Water", "Dark"],
    abilities: ["Torrent", "Protean", "Battle Bond"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png",
  },
  {
    id: 384,
    name: "Rayquaza",
    types: ["Dragon", "Flying"],
    abilities: ["Air Lock"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png",
  },
  {
    id: 445,
    name: "Garchomp",
    types: ["Dragon", "Ground"],
    abilities: ["Sand Veil", "Rough Skin"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png",
  },
  {
    id: 282,
    name: "Gardevoir",
    types: ["Psychic", "Fairy"],
    abilities: ["Synchronize", "Trace", "Telepathy"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png",
  },
  {
    id: 197,
    name: "Umbreon",
    types: ["Dark"],
    abilities: ["Synchronize", "Inner Focus"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png",
  },
  {
    id: 249,
    name: "Lugia",
    types: ["Psychic", "Flying"],
    abilities: ["Pressure", "Multiscale"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png",
  },
  {
    id: 130,
    name: "Gyarados",
    types: ["Water", "Flying"],
    abilities: ["Intimidate", "Moxie"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png",
  },
  {
    id: 392,
    name: "Infernape",
    types: ["Fire", "Fighting"],
    abilities: ["Blaze", "Iron Fist"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/392.png",
  },
  {
    id: 778,
    name: "Mimikyu",
    types: ["Ghost", "Fairy"],
    abilities: ["Disguise"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/778.png",
  },
  {
    id: 257,
    name: "Blaziken",
    types: ["Fire", "Fighting"],
    abilities: ["Blaze", "Speed Boost"],
    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/257.png",
  },
];

export async function fetchRandomPokemon(): Promise<PokemonData> {
  const randomId = Math.floor(Math.random() * 898) + 1;
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    if (!res.ok) throw new Error("PokeAPI response was not ok");
    const data = (await res.json()) as any;

    const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    const types = data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));
    const abilities = data.abilities.map((a: any) => a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1));
    const imageUrl = data.sprites?.other?.["official-artwork"]?.front_default || data.sprites?.other?.home?.front_default || data.sprites?.front_default;

    if (!imageUrl) throw new Error("No image sprite found");

    return {
      id: data.id,
      name,
      types,
      abilities,
      imageUrl,
    };
  } catch {
    // Return a random pokemon from the curated offline list
    return POPULAR_POKEMONS[Math.floor(Math.random() * POPULAR_POKEMONS.length)];
  }
}
