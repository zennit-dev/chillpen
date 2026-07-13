// Generated from chillpen zip data.js — avatar bases + item shop catalog.

import { publicAsset } from "@/lib/assets";

export type AvatarBase = {
  id: string;
  name: string;
  emoji: string;
  image: string;
  head: string;
  tier: string;
  price: number;
  color: string;
  meaning: string;
};

export type AvatarItem = {
  id: string;
  name: string;
  category: string;
  tier: string;
  price: number;
  requires: string | null;
  icon: string;
};

export const AVATAR_BASES = [
  { id: "bird", name: "Bird", emoji: "🐤", image: publicAsset("/avatars/bird.png"), head: publicAsset("/avatars/bird-head.png"), tier: "Starter", price: 0, color: "#e8b45a", meaning: "Curious and positive. Perfect for beginners." },
  { id: "fox", name: "Fox", emoji: "🦊", image: publicAsset("/avatars/fox.png"), head: publicAsset("/avatars/fox-head.png"), tier: "Tier 1", price: 1000, color: "#f97316", meaning: "Agile and clever. Always one step ahead." },
  { id: "octopus", name: "Octopus", emoji: "🐙", image: publicAsset("/avatars/octopus.png"), head: publicAsset("/avatars/octopus-head.png"), tier: "Tier 2", price: 2000, color: "#a855f7", meaning: "Creative and adaptable. Many ideas, many ways." },
  { id: "owl", name: "Owl", emoji: "🦉", image: publicAsset("/avatars/owl.png"), head: publicAsset("/avatars/owl-head.png"), tier: "Tier 3", price: 5000, color: "#d4a373", meaning: "Wise and observant. Knowledge is power." },
  { id: "alien", name: "Alien", emoji: "👽", image: publicAsset("/avatars/alien.png"), head: publicAsset("/avatars/alien-head.png"), tier: "Tier 4", price: 10000, color: "#34d399", meaning: "The smartest of all. Beyond imagination." },
] as const satisfies readonly AvatarBase[];

const ICON_RULES = [
  ["monocle","🧐"],["sunglass","🕶️"],["cosmic glasses","🕶️"],["glasses","👓"],["goggle","🥽"],
  ["pencil","✏️"],["feather","🪶"],["quill","🪶"],["fountain pen","✒️"],["ink","🖋️"],["typewriter","⌨️"],["pen","🖊️"],
  ["notebook","📓"],["book stack","📚"],["bookmark","🔖"],["scroll","📜"],["book","📖"],["library","🏛️"],
  ["mug","☕"],["coffee","☕"],["tea","🍵"],["candle","🕯️"],["lightbulb","💡"],["lamp","💡"],["bell","🔔"],["globe","🌍"],
  ["telescope","🔭"],["compass","🧭"],["magnifier","🔍"],["watch","⌚"],["camera","📷"],["eye mask","😴"],
  ["scarf","🧣"],["bow tie","🎀"],["bow","🎀"],["tie","👔"],["cape","🦸"],["cloak","🥷"],["suit","🤵"],
  ["crown","👑"],["laurel","🏵️"],["graduation","🎓"],["wizard hat","🧙"],["helmet","🪖"],["headband","🧢"],["cap","🧢"],["hat","🎩"],
  ["backpack","🎒"],["satchel","👜"],["bag","👜"],["suitcase","🧳"],
  ["badge","🏅"],["shield","🛡️"],["spark","✨"],["aura","🌟"],["halo","😇"],["bubble","💭"],["wings","🪽"],
  ["throne","🪑"],["frame","🖼️"],["necklace","📿"],["brain","🧠"],
] as const;

export const iconFor = (name: string) => {
  const lower = name.toLowerCase();
  for (const [key, icon] of ICON_RULES)
    if (lower.includes(key)) return icon;
  return "✨";
};

const ITEM_ROWS = [
  ["Basic Pencil","Writing","Starter",150,null],["Small Notebook","Writing","Starter",150,null],["Tiny Glasses","Glasses","Starter",150,null],["Thought Bubble","Effects","Starter",150,null],["Coffee Cup","Lifestyle","Starter",200,null],["Tea Cup","Lifestyle","Starter",200,null],["Blue Scarf","Clothes","Starter",200,null],["Red Scarf","Clothes","Starter",200,null],["Simple Bow Tie","Clothes","Starter",200,null],["Small Book","Knowledge","Starter",200,null],
  ["Reading Lamp","Knowledge","Starter",250,null],["Round Glasses","Glasses","Starter",250,null],["Simple Pen","Writing","Starter",250,null],["School Tie","Clothes","Starter",250,null],["Backpack","Bags","Starter",300,null],["Sleepy Eye Mask","Lifestyle","Starter",300,null],["Small Feather","Writing","Starter",300,null],["Writer Badge","Effects","Starter",300,null],["Mini Magnifier","Knowledge","Starter",300,null],["Creative Spark Icon","Effects","Starter",300,null],
  ["Big Reading Glasses","Glasses","Common",350,null],["Classic Black Glasses","Glasses","Common",350,null],["Golden Round Glasses","Glasses","Common",400,null],["Writer Tie","Clothes","Common",400,null],["Scholar Bow Tie","Clothes","Common",400,null],["Leather Notebook","Writing","Common",450,null],["Ink Bottle","Writing","Common",450,null],["Fountain Pen","Writing","Common",500,null],["Feather Pen","Writing","Common",500,null],["Chillpen Mug","Lifestyle","Common",500,null],
  ["Messenger Bag","Bags","Common",550,null],["Small Suitcase","Bags","Common",550,null],["Newsboy Hat","Head","Common",600,null],["Smart Cap","Head","Common",600,null],["Study Candle","Knowledge","Common",600,null],["Book Stack","Knowledge","Common",600,null],["Desk Bell","Lifestyle","Common",600,null],["Tiny Globe","Knowledge","Common",600,null],["Blue Writing Cape","Clothes","Common",600,null],["Grammar Shield","Effects","Common",600,null],
  ["Elegant Suitcase","Bags","Smart",700,null],["Leather Satchel","Bags","Smart",700,null],["Silver Pen","Writing","Smart",750,null],["Red Writer Tie","Clothes","Smart",750,null],["Black Writer Tie","Clothes","Smart",750,null],["Scholar Hat","Head","Smart",800,null],["Graduation Cap","Head","Smart",800,null],["Typewriter Keys Necklace","Neck","Smart",850,null],["Reading Monocle","Glasses","Smart",850,null],["Deep Thinker Headband","Head","Smart",900,null],
  ["Editor Glasses","Glasses","Smart",900,null],["Smart Watch","Hands","Smart",900,null],["Magic Pencil","Writing","Smart",950,null],["Research Compass","Knowledge","Smart",1000,null],["Creative Backpack","Bags","Smart",1000,null],["Vintage Camera","Lifestyle","Smart",1000,null],["Writer Cloak","Clothes","Smart",1100,"fox"],["Golden Notebook","Writing","Smart",1100,"fox"],["Moon Bookmark","Knowledge","Smart",1200,"fox"],["Story Scroll","Knowledge","Smart",1200,"fox"],
  ["Golden Feather Pen","Writing","Rare",1300,"fox"],["Crystal Ink Bottle","Writing","Rare",1300,"fox"],["Royal Glasses","Glasses","Rare",1400,"fox"],["Smart Suit Jacket","Clothes","Rare",1400,"fox"],["Professor Tie","Clothes","Rare",1500,"fox"],["Luxury Suitcase","Bags","Rare",1500,"fox"],["Ancient Book","Knowledge","Rare",1600,"fox"],["Floating Notebook","Effects","Rare",1700,"fox"],["Idea Lightbulb","Effects","Rare",1800,"octopus"],["Telescope","Knowledge","Rare",1800,"octopus"],
  ["Philosopher Scarf","Clothes","Rare",1900,"octopus"],["Story Compass","Knowledge","Rare",2000,"octopus"],["Bronze Crown","Head","Rare",2000,"octopus"],["Writer Aura","Effects","Rare",2100,"octopus"],["Knowledge Halo","Effects","Rare",2200,"octopus"],["Quill Backpack","Bags","Rare",2300,"octopus"],["Golden Mug","Lifestyle","Rare",2300,"octopus"],["Premium Typewriter","Writing","Rare",2400,"octopus"],["Royal Cape","Clothes","Rare",2500,"octopus"],["Silver Laurel","Head","Rare",2500,"octopus"],
  ["Gold Pen","Writing","Elite",3000,"octopus"],["Master Writer Glasses","Glasses","Elite",3000,"owl"],["Floating Book Aura","Effects","Elite",3200,"owl"],["Genius Tie","Clothes","Elite",3300,"owl"],["Black Scholar Suit","Clothes","Elite",3500,"owl"],["Royal Typewriter","Writing","Elite",3500,"owl"],["Diamond Ink Bottle","Writing","Elite",3800,"owl"],["Starry Wizard Hat","Head","Elite",4000,"owl"],["Golden Laurel","Head","Elite",4000,"owl"],["Timekeeper Watch","Hands","Elite",4200,"owl"],
  ["Galaxy Notebook","Writing","Elite",4500,"owl"],["Writer Throne Background","Background","Elite",4500,"owl"],["Infinite Scroll","Knowledge","Elite",4800,"owl"],["Masterpiece Frame","Background","Elite",5000,"owl"],["Hall of Fame Badge","Effects","Elite",5000,"owl"],["Golden Typewriter","Writing","Legendary",5500,"owl"],["Genius Brain Aura","Effects","Legendary",6000,"owl"],["Floating Library Background","Background","Legendary",6500,"owl"],["Legendary Quill","Writing","Legendary",7000,"owl"],["Cosmic Glasses","Glasses","Legendary",7500,"alien"],
  ["Royal Writer Crown","Head","Legendary",8000,"alien"],["Alien Scholar Helmet","Head","Legendary",8500,"alien"],["Golden Owl Wings","Back","Legendary",9000,"owl"],["Universe Ink Pen","Writing","Legendary",9500,"alien"],["Chillpen Legend Crown","Head","Legendary",10000,"alien"],
] as const;

export const AVATAR_ITEMS: AvatarItem[] = ITEM_ROWS.map((row, index) => ({
  id: `item-${String(index + 1).padStart(3, "0")}`,
  name: row[0],
  category: row[1],
  tier: row[2],
  price: row[3],
  requires: row[4],
  icon: iconFor(row[0]),
}));

export const ITEM_CATEGORIES = ["All", "Head", "Glasses", "Writing", "Knowledge", "Clothes", "Neck", "Hands", "Back", "Bags", "Lifestyle", "Effects", "Background"] as const;

export const SLOT_FOR_CATEGORY = {
  Head: "head", Glasses: "eyes", Clothes: "chest", Neck: "neck",
  Hands: "handR", Writing: "handR", Knowledge: "handL", Lifestyle: "handL",
  Bags: "back", Back: "back", Effects: "float", Background: "bg",
} as const;

export const slotFor = (item: Pick<AvatarItem, "category">) =>
  SLOT_FOR_CATEGORY[item.category as keyof typeof SLOT_FOR_CATEGORY] || "handR";

export const avatarRank = (id: string) =>
  AVATAR_BASES.findIndex((base) => base.id === id);

export const itemUnlocked = (
  item: Pick<AvatarItem, "requires">,
  ownedAvatars: readonly string[],
) => {
  if (!item.requires) return true;
  const required = avatarRank(item.requires);
  if (required < 0) return true;
  const rank = Math.max(...ownedAvatars.map((avatar) => avatarRank(avatar)));
  return rank >= required;
};

export const tierColor = (tier: string) => {
  switch (tier) {
    case "Starter":
      return "#8a8a93";
    case "Common":
      return "#cfccc6";
    case "Smart":
      return "#60a5fa";
    case "Rare":
      return "#a855f7";
    case "Elite":
      return "#f97316";
    case "Legendary":
      return "var(--color-primary)";
    default:
      return "#8a8a93";
  }
};

export const requiredAvatarName = (requires: string | null) => {
  if (!requires) return null;
  return AVATAR_BASES[avatarRank(requires)]?.name ?? requires;
};

export const equippedCatalog = (
  equipped: Record<string, string>,
): { slot: string; item: AvatarItem }[] =>
  Object.entries(equipped)
    .map(([slot, id]) => {
      const item = AVATAR_ITEMS.find((entry) => entry.id === id);
      return item ? { slot, item } : null;
    })
    .filter((entry): entry is { slot: string; item: AvatarItem } => !!entry);

export const SLOT_LABELS = {
  head: "head",
  eyes: "eyes",
  chest: "body",
  neck: "neck",
  handR: "right hand",
  handL: "left hand",
  back: "back",
  float: "floating",
  bg: "background",
} as const;
