/**
 * Themed pseudo-live channel definitions for the Otaku Channels platform.
 *
 * Each channel carries a `scheduleSlots` array that the channel schedule engine
 * uses to compute "now playing" / "up next" deterministically based on a fixed
 * epoch (2024-01-01 UTC).  The cycle repeats continuously so every viewer sees
 * the same content at the same time.
 */
import type { ChannelWithSchedule, ScheduleSlot } from '@/types';

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Build episode slots for a series run (season 1 by default). */
function epSlots(
  startIndex: number,
  seriesTitle: string,
  episodes: Array<{ title: string; durationSec?: number }>,
  tags: string[] = [],
  thumbnailUrl?: string
): ScheduleSlot[] {
  return episodes.map((ep, i) => ({
    slotIndex: startIndex + i,
    label: `${seriesTitle} – Ep ${i + 1}`,
    seriesTitle,
    episodeTitle: ep.title,
    episodeNumber: i + 1,
    seasonNumber: 1,
    durationSec: ep.durationSec ?? 1440, // 24 min default
    tags,
    thumbnailUrl,
  }));
}

/** Build a single movie slot. */
function movieSlot(
  slotIndex: number,
  title: string,
  durationSec: number,
  tags: string[] = [],
  thumbnailUrl?: string
): ScheduleSlot {
  return {
    slotIndex,
    label: title,
    seriesTitle: title,
    durationSec,
    tags,
    thumbnailUrl,
  };
}

// ─── Channel Definitions ─────────────────────────────────────────────────────

/**
 * CH 101 · Shonen Station
 * Non-stop action shonen — battles, power-ups, and epic moments.
 */
const shonenStationSlots: ScheduleSlot[] = [
  ...epSlots(
    0,
    'Demon Slayer',
    [
      { title: 'Cruelty' },
      { title: 'Trainer Sakonji Urokodaki' },
      { title: 'Sabito and Makomo' },
      { title: 'Final Selection' },
      { title: 'My Own Steel' },
      { title: 'Swordsman Accompanying a Demon' },
    ],
    ['Action', 'Shonen', 'Fantasy'],
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    6,
    'Jujutsu Kaisen',
    [
      { title: 'Ryomen Sukuna' },
      { title: 'For Myself' },
      { title: 'Girl of Steel' },
      { title: 'Curse Womb Must Die' },
      { title: 'Curse Womb Must Die -II-' },
      { title: 'After Rain' },
    ],
    ['Action', 'Shonen', 'Supernatural'],
    'https://images.unsplash.com/photo-1555883006-0f5a0915a80f?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    12,
    'My Hero Academia',
    [
      { title: 'Izuku Midoriya: Origin' },
      { title: 'What It Takes to Be a Hero' },
      { title: 'Roaring Muscles' },
      { title: 'Start Line' },
      { title: 'What I Can Do for Now' },
      { title: 'Rage, You Damned Nerd' },
    ],
    ['Action', 'Shonen', 'Superpower'],
    'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    18,
    'Bleach',
    [
      { title: 'The Day I Became a Shinigami' },
      { title: "A Shinigami's Work" },
      { title: "The Older Brother's Wish, the Younger Sister's Wish" },
      { title: 'Cursed Parakeet' },
    ],
    ['Action', 'Shonen', 'Supernatural'],
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=225&fit=crop'
  ),
];

/**
 * CH 102 · Retro Vault
 * Golden-age classics — the shows that defined an era.
 */
const retroVaultSlots: ScheduleSlot[] = [
  ...epSlots(
    0,
    'Cowboy Bebop',
    [
      { title: 'Asteroid Blues' },
      { title: 'Stray Dog Strut' },
      { title: 'Honky Tonk Women' },
      { title: 'Gateway Shuffle' },
      { title: 'Ballad of Fallen Angels' },
      { title: 'Sympathy for the Devil' },
    ],
    ['Sci-Fi', 'Action', 'Retro'],
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    6,
    'Trigun',
    [
      { title: 'The $$60,000,000,000 Man' },
      { title: 'Truth of Mistake' },
      { title: 'Peace Maker' },
      { title: 'Love and Peace' },
      { title: 'Hard Puncher' },
      { title: 'Lost July' },
    ],
    ['Western', 'Action', 'Retro'],
    'https://images.unsplash.com/photo-1445112098124-3e76dd67983c?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    12,
    'Ghost in the Shell: Stand Alone Complex',
    [
      { title: 'Public Security Section 9' },
      { title: 'TESTATION' },
      { title: 'ANDROID AND I' },
      { title: 'VISUALIZE' },
      { title: 'DECOY' },
      { title: 'MEME' },
    ],
    ['Sci-Fi', 'Cyberpunk', 'Retro'],
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    18,
    'Neon Genesis Evangelion',
    [
      { title: 'Angel Attack' },
      { title: 'The Beast' },
      { title: 'A Transfer' },
      { title: "Hedgehog's Dilemma" },
    ],
    ['Mecha', 'Sci-Fi', 'Retro'],
    'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=400&h=225&fit=crop'
  ),
];

/**
 * CH 103 · Mecha Core
 * Giant robots and the pilots who move them.
 */
const mechaCoreSlots: ScheduleSlot[] = [
  ...epSlots(
    0,
    'Neon Genesis Evangelion',
    [
      { title: 'Angel Attack' },
      { title: 'The Beast' },
      { title: 'A Transfer' },
      { title: "Hedgehog's Dilemma" },
      { title: 'Rei I' },
      { title: 'Rei II' },
    ],
    ['Mecha', 'Sci-Fi', 'Psychological'],
    'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    6,
    'Code Geass',
    [
      { title: 'The Day a Demon Was Born' },
      { title: 'The White Knight Awakens' },
      { title: 'The False Classmate' },
      { title: 'His Name is Zero' },
      { title: 'The Princess and the Witch' },
      { title: 'The Stolen Mask' },
    ],
    ['Mecha', 'Action', 'Strategy'],
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    12,
    'Mobile Suit Gundam Wing',
    [
      { title: 'The Shooting Star She Saw' },
      { title: 'The Gundam Deathscythe' },
      { title: 'Five Gundams Confirmed' },
      { title: 'The Victoria Nightmare' },
      { title: "Relena's Secret" },
      { title: 'Party Night' },
    ],
    ['Mecha', 'Sci-Fi', 'Action'],
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    18,
    'Darling in the FranXX',
    [
      { title: 'Alone and Lonesome' },
      { title: 'What It Means to Connect' },
      { title: 'Fighting Puppet' },
      { title: 'Flap Flap' },
    ],
    ['Mecha', 'Romance', 'Sci-Fi'],
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=225&fit=crop'
  ),
];

/**
 * CH 104 · Chill Nights
 * Slow down and breathe — peaceful, atmospheric anime for late evenings.
 */
const chillNightsSlots: ScheduleSlot[] = [
  ...epSlots(
    0,
    'Mushishi',
    [
      { title: 'The Green Gathering' },
      { title: 'The Tender Horns' },
      { title: 'The Soft Light of the Border' },
      { title: 'The Pillow Pathway' },
      { title: 'The Heavy Seed' },
      { title: 'Those Who Inhale the Dew' },
    ],
    ['Slice of Life', 'Mystery', 'Supernatural', 'Chill'],
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    6,
    "Natsume's Book of Friends",
    [
      { title: 'Natsume and the Book of Friends' },
      { title: 'The Dew God' },
      { title: 'Fox Child' },
      { title: 'The False Successor' },
      { title: 'A Moment of Glitter' },
      { title: 'The Wind and the Rock' },
    ],
    ['Slice of Life', 'Supernatural', 'Chill'],
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    12,
    'Aria the Animation',
    [
      { title: 'That Wonderful Miracle...' },
      { title: 'That Bewildering Aqua Alta...' },
      { title: 'That Dreamy Town...' },
      { title: 'That Glass-Clear Singing Voice...' },
      { title: 'That Sudden Encounter...' },
      { title: 'That Day of Winds...' },
    ],
    ['Slice of Life', 'Sci-Fi', 'Chill', 'Relaxing'],
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    18,
    'Flying Witch',
    [
      { title: 'The Witch Descends on Hirosaki' },
      { title: 'Tea Party of Witches' },
      { title: 'The Harvest of Spring Herbs' },
      { title: "The Witch's Delivery Service" },
    ],
    ['Slice of Life', 'Magic', 'Chill'],
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=225&fit=crop'
  ),
];

/**
 * CH 105 · Fantasy Realm
 * Dungeons, dragons, and other-world adventures.
 */
const fantasyRealmSlots: ScheduleSlot[] = [
  ...epSlots(
    0,
    'Re:Zero',
    [
      { title: 'The End of the Beginning and the Beginning of the End' },
      { title: 'Reunion with the Witch' },
      { title: 'Starting Life from Zero in Another World' },
      { title: 'The Happy Roswaal Mansion Family' },
      { title: 'The Morning of Our Promise Is Still Distant' },
      { title: 'The Sounds That Make You Want to Cry' },
    ],
    ['Fantasy', 'Isekai', 'Psychological'],
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    6,
    'That Time I Got Reincarnated as a Slime',
    [
      { title: 'The Storm Dragon, Veldora' },
      { title: 'Meeting the Goblins' },
      { title: 'Battle at the Goblin Village' },
      { title: 'Gabiru is Here!' },
      { title: "Shizu's Past" },
      { title: 'Ruler of Monsters' },
    ],
    ['Fantasy', 'Isekai', 'Comedy'],
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    12,
    'Overlord',
    [
      { title: 'End and Beginning' },
      { title: 'Floor Guardians' },
      { title: 'Battle in Carne Village' },
      { title: 'Confrontation' },
      { title: 'Two Adventurers' },
      { title: 'Ruler of Death' },
    ],
    ['Fantasy', 'Isekai', 'Dark'],
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    18,
    'Sword Art Online',
    [
      { title: 'The World of Swords' },
      { title: 'Beater' },
      { title: 'Red-Nosed Reindeer' },
      { title: 'The Black Swordsman' },
    ],
    ['Fantasy', 'Isekai', 'Action'],
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=225&fit=crop'
  ),
];

/**
 * CH 106 · Dub Central
 * The best of anime in English — premium dubs, crystal-clear dialogue.
 */
const dubCentralSlots: ScheduleSlot[] = [
  ...epSlots(
    0,
    'Fullmetal Alchemist: Brotherhood',
    [
      { title: 'Fullmetal Alchemist' },
      { title: 'The First Day' },
      { title: 'City of Heresy' },
      { title: "An Alchemist's Anguish" },
      { title: 'Rain of Sorrows' },
      { title: 'Road of Hope' },
    ],
    ['Action', 'Adventure', 'Dub'],
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    6,
    'Death Note',
    [
      { title: 'Rebirth' },
      { title: 'Confrontation' },
      { title: 'Dealings' },
      { title: 'Pursuit' },
      { title: 'Tactics' },
      { title: 'Unraveling' },
    ],
    ['Thriller', 'Psychological', 'Dub'],
    'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    12,
    'Attack on Titan',
    [
      { title: 'To You, in 2000 Years: The Fall of Shiganshina, Part 1' },
      { title: 'That Day: The Fall of Shiganshina, Part 2' },
      { title: "A Dim Light Amid Despair: Humanity's Comeback, Part 1" },
      {
        title: "The Night of the Closing Ceremony: Humanity's Comeback, Part 2",
      },
      { title: 'First Battle: The Struggle for Trost, Part 1' },
      { title: 'The World the Girl Saw: The Struggle for Trost, Part 2' },
    ],
    ['Action', 'Dark Fantasy', 'Dub'],
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=225&fit=crop'
  ),
  ...epSlots(
    18,
    'Steins;Gate',
    [
      { title: 'Prologue of the Beginning and the End' },
      { title: 'Time Travel Paranoia' },
      { title: 'Parallel Process Paranoia' },
      { title: 'Interpreter Rendezvous' },
    ],
    ['Sci-Fi', 'Thriller', 'Dub'],
    'https://images.unsplash.com/photo-1559181567-c3190ca9d5d4?w=400&h=225&fit=crop'
  ),
];

/**
 * CH 107 · Movie Night
 * Feature films — masterpieces from Studio Ghibli, Makoto Shinkai, and more.
 */
const movieNightSlots: ScheduleSlot[] = [
  movieSlot(
    0,
    'Spirited Away',
    7500, // 125 min
    ['Film', 'Fantasy', 'Studio Ghibli'],
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=225&fit=crop'
  ),
  movieSlot(
    1,
    "Howl's Moving Castle",
    7140, // 119 min
    ['Film', 'Fantasy', 'Studio Ghibli'],
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=225&fit=crop'
  ),
  movieSlot(
    2,
    'Your Name',
    6360, // 106 min
    ['Film', 'Romance', 'Fantasy'],
    'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=225&fit=crop'
  ),
  movieSlot(
    3,
    'A Silent Voice',
    7800, // 130 min
    ['Film', 'Drama', 'Romance'],
    'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&h=225&fit=crop'
  ),
  movieSlot(
    4,
    'Princess Mononoke',
    8040, // 134 min
    ['Film', 'Fantasy', 'Studio Ghibli', 'Action'],
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=225&fit=crop'
  ),
  movieSlot(
    5,
    'Akira',
    7440, // 124 min
    ['Film', 'Sci-Fi', 'Cyberpunk', 'Classic'],
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop'
  ),
  movieSlot(
    6,
    'Nausicaä of the Valley of the Wind',
    7080, // 118 min
    ['Film', 'Sci-Fi', 'Fantasy', 'Studio Ghibli'],
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop'
  ),
  movieSlot(
    7,
    'Grave of the Fireflies',
    5460, // 91 min
    ['Film', 'Drama', 'War', 'Studio Ghibli'],
    'https://images.unsplash.com/photo-1445112098124-3e76dd67983c?w=400&h=225&fit=crop'
  ),
];

// ─── Exported Channel Catalogue ───────────────────────────────────────────────

export const themedChannels: ChannelWithSchedule[] = [
  {
    id: 'tc-shonen',
    slug: 'shonen-station',
    name: 'Shonen Station',
    description:
      'Non-stop action shonen programming — battles, power-ups, friendship bonds, and the determination to become the strongest. Your daily fix of hype.',
    tagline: 'Power Up. Level Up. Never Give Up.',
    thumbnail:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop',
    channelNumber: '101',
    sourceName: 'Otaku Channels',
    sourceType: 'live',
    isEmbeddable: false,
    watchUrl: '/channels/shonen-station',
    tags: ['Action', 'Shonen', 'Battles', 'Power-Ups'],
    genre: 'Action',
    mood: 'Hype',
    nowPlaying: '',
    scheduleSlots: shonenStationSlots,
  },
  {
    id: 'tc-retro',
    slug: 'retro-vault',
    name: 'Retro Vault',
    description:
      'Golden-age classics from the 90s and early 2000s — the anime that built the culture. Revisit the legends or discover them for the first time.',
    tagline: 'The Classics Never Die.',
    thumbnail:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=225&fit=crop',
    channelNumber: '102',
    sourceName: 'Otaku Channels',
    sourceType: 'retro',
    isEmbeddable: false,
    watchUrl: '/channels/retro-vault',
    tags: ['Retro', 'Classic', '90s', '2000s'],
    genre: 'Classic',
    mood: 'Nostalgic',
    nowPlaying: '',
    scheduleSlots: retroVaultSlots,
  },
  {
    id: 'tc-mecha',
    slug: 'mecha-core',
    name: 'Mecha Core',
    description:
      'Giant robots, philosophical battles, and the weight of piloting a machine into war. From Evangelion to Gundam — the genre that shaped sci-fi anime.',
    tagline: 'Iron Fists, Human Hearts.',
    thumbnail:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=225&fit=crop',
    channelNumber: '103',
    sourceName: 'Otaku Channels',
    sourceType: 'live',
    isEmbeddable: false,
    watchUrl: '/channels/mecha-core',
    tags: ['Mecha', 'Sci-Fi', 'Robots', 'Action'],
    genre: 'Mecha',
    mood: 'Epic',
    nowPlaying: '',
    scheduleSlots: mechaCoreSlots,
  },
  {
    id: 'tc-chill',
    slug: 'chill-nights',
    name: 'Chill Nights',
    description:
      'Wind down with peaceful, atmospheric stories. Slow-burn narratives, nature aesthetics, and heartwarming characters — perfect for late evenings.',
    tagline: 'Slow Down. Breathe. Wander.',
    thumbnail:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
    channelNumber: '104',
    sourceName: 'Otaku Channels',
    sourceType: 'live',
    isEmbeddable: false,
    watchUrl: '/channels/chill-nights',
    tags: ['Chill', 'Slice of Life', 'Relaxing', 'Atmospheric'],
    genre: 'Slice of Life',
    mood: 'Chill',
    nowPlaying: '',
    scheduleSlots: chillNightsSlots,
  },
  {
    id: 'tc-fantasy',
    slug: 'fantasy-realm',
    name: 'Fantasy Realm',
    description:
      'Portal to other worlds — isekai adventures, dungeon crawls, magic systems, and heroes who grow stronger with every episode.',
    tagline: 'Another World Awaits.',
    thumbnail:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=225&fit=crop',
    channelNumber: '105',
    sourceName: 'Otaku Channels',
    sourceType: 'live',
    isEmbeddable: false,
    watchUrl: '/channels/fantasy-realm',
    tags: ['Fantasy', 'Isekai', 'Adventure', 'Magic'],
    genre: 'Fantasy',
    mood: 'Adventure',
    nowPlaying: '',
    scheduleSlots: fantasyRealmSlots,
  },
  {
    id: 'tc-dub',
    slug: 'dub-central',
    name: 'Dub Central',
    description:
      'Premium English-dubbed anime — crystal-clear dialogue, award-winning voice performances, and no subtitles needed. Lean back and enjoy.',
    tagline: 'World-Class Dubbing. Zero Subtitles.',
    thumbnail:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
    channelNumber: '106',
    sourceName: 'Otaku Channels',
    sourceType: 'live',
    isEmbeddable: false,
    watchUrl: '/channels/dub-central',
    tags: ['Dubbed', 'English', 'Premium'],
    genre: 'Mixed',
    mood: 'Accessible',
    nowPlaying: '',
    scheduleSlots: dubCentralSlots,
  },
  {
    id: 'tc-movies',
    slug: 'movie-night',
    name: 'Movie Night',
    description:
      'Feature-length anime films — from Studio Ghibli masterpieces to modern emotional gut-punches. A new film every few hours, all night long.',
    tagline: 'Grab the Popcorn.',
    thumbnail:
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=225&fit=crop',
    channelNumber: '107',
    sourceName: 'Otaku Channels',
    sourceType: 'live',
    isEmbeddable: false,
    watchUrl: '/channels/movie-night',
    tags: ['Movies', 'Films', 'Ghibli', 'Cinema'],
    genre: 'Film',
    mood: 'Cinematic',
    nowPlaying: '',
    scheduleSlots: movieNightSlots,
  },
];

/** Look up a themed channel by slug. */
export function getChannelBySlug(
  slug: string
): ChannelWithSchedule | undefined {
  return themedChannels.find((ch) => ch.slug === slug);
}
