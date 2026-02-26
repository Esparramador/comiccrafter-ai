import { storage } from "./storage";
import { manusGenerateImage } from "./manus-ai";
import { generateImageBuffer } from "./replit_integrations/image/client";

const COVER_PROMPTS = [
  {
    prompt: "Epic manga cover art, masterpiece quality, a cyberpunk samurai woman standing on a neon-lit rooftop overlooking a massive futuristic Tokyo skyline at night, rain pouring, katana glowing with blue energy, dramatic wind blowing her hair and cape, cinematic composition, ultra detailed, volumetric lighting, lens flare, 8K quality, professional comic book cover",
    category: "cover",
  },
  {
    prompt: "Professional comic book cover, stunning illustration of a young mage girl with flowing silver hair summoning a massive dragon made of golden light in an ancient floating temple above the clouds, epic fantasy scene, dramatic purple and gold color palette, magical particles, Studio Ghibli meets Marvel quality, masterpiece, ultra HD",
    category: "cover",
  },
  {
    prompt: "Cinematic manga cover art, dark fantasy style, a lone knight in obsidian armor standing before an enormous gate to the underworld, flames and souls swirling around, massive demon silhouette in the background, dramatic red and black color scheme, ultra detailed armor textures, professional print quality, 8K masterpiece",
    category: "cover",
  },
  {
    prompt: "Stunning comic book cover illustration, space opera style, diverse crew of heroes posing on the bridge of a massive starship, a supernova exploding through the viewport behind them, dramatic lighting from multiple sources, each character with unique detailed design, Marvel Cinematic quality, ultra detailed, professional composition, vivid colors",
    category: "cover",
  },
  {
    prompt: "Breathtaking manga volume cover, steampunk adventure style, a young inventor girl riding a massive mechanical dragon through golden clouds at sunset, gears and steam everywhere, her goggles reflecting the light, companion fairy hovering nearby, incredibly detailed machinery, warm amber and copper tones, Studio Trigger quality, masterpiece",
    category: "cover",
  },
  {
    prompt: "Professional anime movie poster style cover, underwater civilization, a warrior princess with bioluminescent armor commanding an army of deep sea creatures against a colossal kraken, coral palace in background, dramatic blue-green lighting with glowing accents, dynamic action pose, ultra detailed, cinematic composition, 8K",
    category: "cover",
  },
  {
    prompt: "Epic superhero comic cover art, dramatic low angle shot, a team of four heroes mid-battle against a city-destroying villain, explosions and energy blasts, destroyed buildings and dramatic clouds, each hero with unique power effects (fire, ice, lightning, shadow), professional Marvel/DC quality, ultra detailed, dynamic composition, vivid saturated colors",
    category: "cover",
  },
  {
    prompt: "Magnificent manga cover illustration, post-apocalyptic beauty, a girl with mechanical wings standing on the ruins of a skyscraper overlooking a world where nature has reclaimed the city, massive trees growing through buildings, birds flying, sunrise creating golden rays through the foliage, melancholic yet hopeful mood, ultra detailed, masterpiece quality",
    category: "cover",
  },
];

const ILLUSTRATION_PROMPTS = [
  {
    prompt: "Ultra detailed anime illustration, a mystical library floating in space, spiral staircases of light connecting floating bookshelves, a young scholar reading while surrounded by glowing constellation patterns, magical particles like fireflies, deep space nebula visible through crystal windows, warm amber lighting contrast with cool cosmic blues, masterpiece quality, 8K",
    category: "illustration",
  },
  {
    prompt: "Stunning digital painting, enchanted Japanese garden at twilight, a fox spirit (kitsune) with nine glowing tails sitting by a moonlit pond, cherry blossoms falling, torii gate reflected in the water, spirit lanterns floating, traditional yet magical atmosphere, ultra detailed, professional illustration quality, vivid yet ethereal colors",
    category: "illustration",
  },
  {
    prompt: "Professional concept art illustration, massive cyberpunk street market scene, hundreds of neon signs in multiple languages, food stalls with steam rising, diverse crowd of humans and androids, holographic advertisements, rain-slicked streets reflecting all the lights, ultra detailed wide shot, Blade Runner meets Ghost in the Shell quality, 8K masterpiece",
    category: "illustration",
  },
  {
    prompt: "Breathtaking fantasy illustration, a dragon rider soaring through a massive canyon at sunset, the dragon covered in iridescent scales reflecting rainbow light, ancient runes carved into the canyon walls glowing, other smaller dragons flying in formation below, dramatic volumetric god rays, epic scale, ultra detailed, professional quality, warm golden palette",
    category: "illustration",
  },
  {
    prompt: "Magnificent anime-style illustration, a celestial witch performing a ritual at the peak of a crystal mountain during a total eclipse, rings of magical symbols rotating around her, starfield visible in the darkened sky, aurora borealis flowing like rivers of light, dramatic scale contrast between tiny figure and cosmic phenomena, ultra detailed, masterpiece",
    category: "illustration",
  },
  {
    prompt: "Stunning sci-fi illustration, inside a massive generation ship, a biodome city with forests and rivers under an artificial sun, transparent dome showing deep space and a distant galaxy, people living normal lives in futuristic architecture, incredible sense of scale, ultra detailed environment design, professional quality, warm natural tones contrasting with the cold of space",
    category: "illustration",
  },
  {
    prompt: "Epic battle illustration manga style, two legendary warriors clashing in mid-air above a destroyed battlefield, one wielding a sword of pure light, the other a scythe of shadow, their energies colliding creating a massive shockwave, debris and energy arcs everywhere, dynamic action lines, ultra detailed, professional manga volume quality, dramatic monochrome with selective color accents",
    category: "illustration",
  },
];

const CHARACTER_PROMPTS = [
  {
    prompt: "Professional anime character design sheet, full body portrait of a female cyber-ninja, sleek black and violet tactical suit with glowing circuit patterns, short asymmetric white hair, one cybernetic eye glowing red, dual plasma daggers, confident pose, clean white background, ultra detailed, masterpiece quality, character concept art",
    category: "character",
  },
  {
    prompt: "Professional manga character portrait, handsome young sorcerer king with long flowing black hair and golden eyes, ornate dark robes with celestial pattern embroidery, a floating crown of starlight above his head, magical aura of cosmic energy, regal yet dangerous expression, ultra detailed, masterpiece quality, clean background",
    category: "character",
  },
  {
    prompt: "Professional character concept art, adorable but powerful chibi-style robot companion, round body with expressive LED face, tiny mechanical arms with oversized hands, hovering with small jet boosters, antenna with a glowing star tip, pastel color scheme with blue and white, multiple expression poses, ultra detailed, cute yet professional quality",
    category: "character",
  },
  {
    prompt: "Professional anime character design, fierce dragon-blood warrior woman, crimson scales growing on her arms and neck, fiery orange eyes with slit pupils, massive two-handed obsidian greatsword, battle-scarred armor with dragon motifs, wild red hair like flames, dynamic battle-ready pose, ultra detailed, professional quality character art",
    category: "character",
  },
  {
    prompt: "Professional character illustration, mysterious gentleman thief in Victorian steampunk style, top hat with clockwork monocle, elegant long coat with hidden gadget pockets, mechanical prosthetic arm with built-in tools, charming smirk, standing in foggy London alley with gas lamps, ultra detailed clothing textures, masterpiece quality portrait",
    category: "character",
  },
];

export async function generateGalleryBatch(): Promise<{ generated: number; errors: number }> {
  let generated = 0;
  let errors = 0;

  const allPrompts = [...COVER_PROMPTS, ...ILLUSTRATION_PROMPTS, ...CHARACTER_PROMPTS];

  for (const item of allPrompts) {
    try {
      console.log(`[GALLERY] Generating: ${item.category} - ${item.prompt.substring(0, 60)}...`);

      let imageUrl: string;

      try {
        const size = item.category === "cover" ? "1024x1792" : "1024x1024";
        const result = await manusGenerateImage(item.prompt, size, "hd", "vivid");
        imageUrl = result.url;
      } catch (manusErr: any) {
        console.log(`[GALLERY] Manus fallback to Replit integrations: ${manusErr.message}`);
        const buf = await generateImageBuffer(item.prompt, "1024x1024");
        imageUrl = `data:image/png;base64,${buf.toString("base64")}`;
      }

      await storage.createImage({
        prompt: item.prompt,
        imageUrl,
        category: item.category,
      });

      generated++;
      console.log(`[GALLERY] ✓ Saved ${item.category} #${generated}`);
    } catch (err: any) {
      errors++;
      console.error(`[GALLERY] ✗ Error: ${err.message}`);
    }
  }

  return { generated, errors };
}
