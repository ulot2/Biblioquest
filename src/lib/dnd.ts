const BASE_URL = "https://www.dnd5eapi.co/api";

export type Monster = {
  index: string;
  name: string;
  hit_points: number;
  armor_class: { type: string; value: number }[];
  xp: number;
  challenge_rating: number;
  actions: { name: string; desc: string }[];
};

export async function getMonster(name: string): Promise<Monster | null> {
  try {
    // 1. Search for the monster to get its index
    const searchResponse = await fetch(`${BASE_URL}/monsters?name=${name}`);
    const searchData = await searchResponse.json();

    if (searchData.count === 0) return null;

    // 2. Fetch full details using the index of the first match
    const index = searchData.results[0].index;
    const monsterResponse = await fetch(`${BASE_URL}/monsters/${index}`);
    const monsterData = await monsterResponse.json();

    return monsterData;
  } catch (error) {
    console.error("D&D API Error:", error);
    return null;
  }
}
