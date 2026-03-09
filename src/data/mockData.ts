import type {
  AnimeSeries,
  Episode,
  LiveChannel,
  Movie,
  SourceProvider,
} from '@/types';

/** All legal free anime streaming sources supported by the app. */
export const sourceProviders: SourceProvider[] = [
  {
    id: 'youtube',
    name: 'YouTube Official',
    type: 'youtube',
    baseUrl: 'https://www.youtube.com',
  },
  {
    id: 'tubi',
    name: 'Tubi',
    type: 'tubi',
    baseUrl: 'https://tubitv.com/category/anime',
  },
  {
    id: 'pluto',
    name: 'Pluto TV',
    type: 'pluto',
    baseUrl: 'https://pluto.tv/live-tv/pluto-tv-anime',
  },
  {
    id: 'retrocrush',
    name: 'RetroCrush',
    type: 'retrocrush',
    baseUrl: 'https://www.retrocrush.tv',
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    type: 'crunchyroll',
    baseUrl: 'https://www.crunchyroll.com/videos/anime/popular',
  },
  {
    id: 'retro',
    name: 'Retro Channel',
    type: 'retro',
    baseUrl: 'https://www.retrocrush.tv',
  },
  {
    id: 'freestream',
    name: 'FreeStream Anime',
    type: 'freestream',
    baseUrl: 'https://tubitv.com/category/anime',
  },
];

export const mockSeries: AnimeSeries[] = [
  {
    id: 's1',
    slug: 'blade-of-eternity',
    title: 'Blade of Eternity',
    description:
      'A young swordsman discovers ancient powers as he defends his homeland from a demonic invasion spanning three kingdoms.',
    thumbnail:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Fantasy', 'Adventure'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=1QfliUWiM8w',
    releaseYear: 2021,
    episodeCount: 24,
    tags: ['Trending', 'Action'],
  },
  {
    id: 's2',
    slug: 'neon-shibuya',
    title: 'Neon Shibuya',
    description:
      'In a cyberpunk future Tokyo, a hacker uncovers a conspiracy that threatens to merge humans with AI.',
    thumbnail:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Sci-Fi', 'Thriller', 'Cyberpunk'],
    language: 'sub',
    sourceName: 'FreeStream Anime',
    sourceType: 'freestream',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    releaseYear: 2022,
    episodeCount: 12,
    tags: ['Cyberpunk', 'Sci-Fi'],
  },
  {
    id: 's3',
    slug: 'crystal-defenders',
    title: 'Crystal Defenders',
    description:
      'Five childhood friends reunite to protect magical crystals from an ancient evil that has awakened after centuries.',
    thumbnail:
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Fantasy', 'Action', 'Magic'],
    language: 'dub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=CMcAzn4dUck',
    releaseYear: 2019,
    episodeCount: 52,
    tags: ['Dubbed', 'Classic'],
  },
  {
    id: 's4',
    slug: 'iron-heart-academy',
    title: 'Iron Heart Academy',
    description:
      'A mechanical prodigy enrolls in a prestigious academy for gifted students, where rivalries forge destiny.',
    thumbnail:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Mecha', 'School', 'Action'],
    language: 'both',
    sourceName: 'Retro Channel',
    sourceType: 'retro',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    releaseYear: 2003,
    episodeCount: 26,
    tags: ['Mecha', 'Retro'],
  },
  {
    id: 's5',
    slug: 'sakura-storm',
    title: 'Sakura Storm',
    description:
      'A magical girl story reimagined — a high school student awakens storm powers during a mysterious festival.',
    thumbnail:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Magical Girl', 'Fantasy', 'Romance'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=J-H-_gEL62E',
    releaseYear: 2023,
    episodeCount: 13,
    tags: ['Trending', 'Fantasy'],
  },
  {
    id: 's6',
    slug: 'void-hunters',
    title: 'Void Hunters',
    description:
      'Elite monster-hunting squad ventures into dimensional rifts to protect Earth from otherworldly predators.',
    thumbnail:
      'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Horror', 'Sci-Fi'],
    language: 'dub',
    sourceName: 'FreeStream Anime',
    sourceType: 'freestream',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    releaseYear: 2020,
    episodeCount: 24,
    tags: ['Dubbed', 'Action'],
  },
  {
    id: 's7',
    slug: 'ramen-ronin',
    title: 'Ramen Ronin',
    description:
      'A wandering samurai finds peace in cooking ramen, but trouble always follows him to the next town.',
    thumbnail:
      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Samurai', 'Comedy', 'Slice of Life'],
    language: 'sub',
    sourceName: 'Retro Channel',
    sourceType: 'retro',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    releaseYear: 1998,
    episodeCount: 48,
    tags: ['Retro', 'Samurai'],
  },
  {
    id: 's8',
    slug: 'galactic-drift',
    title: 'Galactic Drift',
    description:
      'Space racing drama set in the 24th century where pilots risk their lives drifting asteroid belts.',
    thumbnail:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Sci-Fi', 'Sports', 'Action'],
    language: 'both',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=bE9X77tMC58',
    releaseYear: 2021,
    episodeCount: 24,
    tags: ['Sci-Fi', 'Sports'],
  },
  {
    id: 's9',
    slug: 'demon-village',
    title: 'Demon Village',
    description:
      'A human child raised by demons must choose a side when war erupts between the two worlds.',
    thumbnail:
      'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Fantasy', 'Drama', 'Action'],
    language: 'sub',
    sourceName: 'FreeStream Anime',
    sourceType: 'freestream',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    releaseYear: 2022,
    episodeCount: 24,
    tags: ['Fantasy', 'Trending'],
  },
  {
    id: 's10',
    slug: 'school-of-swords',
    title: 'School of Swords',
    description:
      'Students at a magical sword school compete in brutal tournaments to earn the title of Grand Blade.',
    thumbnail:
      'https://images.unsplash.com/photo-1555883006-0f5a0915a80f?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1555883006-0f5a0915a80f?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'School', 'Fantasy'],
    language: 'dub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=ErjwRMNC2LM',
    releaseYear: 2020,
    episodeCount: 13,
    tags: ['Dubbed', 'School'],
  },
  {
    id: 's11',
    slug: 'mountain-spirit',
    title: 'Mountain Spirit',
    description:
      'Slow-burn nature anime following a forest spirit who protects a sacred mountain from industrial development.',
    thumbnail:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Fantasy', 'Slice of Life', 'Drama'],
    language: 'sub',
    sourceName: 'Retro Channel',
    sourceType: 'retro',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    releaseYear: 1995,
    episodeCount: 39,
    tags: ['Retro', 'Peaceful'],
  },
  {
    id: 's12',
    slug: 'thunder-fist',
    title: 'Thunder Fist',
    description:
      'A street-level martial artist with electric powers rises through underground tournament brackets.',
    thumbnail:
      'https://images.unsplash.com/photo-1555436169-f51a0cfe5e2c?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1555436169-f51a0cfe5e2c?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Martial Arts', 'Sports'],
    language: 'both',
    sourceName: 'FreeStream Anime',
    sourceType: 'freestream',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    releaseYear: 2018,
    episodeCount: 50,
    tags: ['Martial Arts', 'Action'],
  },
  {
    id: 's13',
    slug: 'cafe-tengu',
    title: 'Cafe Tengu',
    description:
      'A cozy slice-of-life following a tengu spirit who runs a magical cafe in modern-day Kyoto.',
    thumbnail:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Slice of Life', 'Comedy', 'Fantasy'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=8Q-tR4wNg5c',
    releaseYear: 2023,
    episodeCount: 12,
    tags: ['Cozy', 'Slice of Life'],
  },
  {
    id: 's14',
    slug: 'orbital-striker',
    title: 'Orbital Striker',
    description:
      'Giant robots defend Earth from an alien superweapon threatening to detonate the Moon.',
    thumbnail:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Mecha', 'Sci-Fi', 'Action'],
    language: 'dub',
    sourceName: 'Retro Channel',
    sourceType: 'retro',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    releaseYear: 2001,
    episodeCount: 52,
    tags: ['Mecha', 'Retro', 'Dubbed'],
  },
  {
    id: 's15',
    slug: 'ghost-precinct',
    title: 'Ghost Precinct',
    description:
      'A detective agency staffed by spirits solves supernatural crimes in a city where ghosts walk among the living.',
    thumbnail:
      'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Mystery', 'Supernatural', 'Comedy'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=m3wZn7Le4yM',
    releaseYear: 2022,
    episodeCount: 24,
    tags: ['Mystery', 'Supernatural'],
  },
  // ── Tubi ──────────────────────────────────────────────────────────────
  {
    id: 's16',
    slug: 'wolf-warrior',
    title: 'Wolf Warrior',
    description:
      'A lone wolf-human hybrid hunts supernatural threats lurking in a sprawling feudal city.',
    thumbnail:
      'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Supernatural', 'Adventure'],
    language: 'dub',
    sourceName: 'Tubi',
    sourceType: 'tubi',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    releaseYear: 2018,
    episodeCount: 26,
    tags: ['Trending', 'Dubbed', 'Action'],
  },
  {
    id: 's17',
    slug: 'harbor-mages',
    title: 'Harbor Mages',
    description:
      'Young mages defending a coastal city discover their magic is tied to ancient sea gods.',
    thumbnail:
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Fantasy', 'Magic', 'Adventure'],
    language: 'sub',
    sourceName: 'Tubi',
    sourceType: 'tubi',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    releaseYear: 2020,
    episodeCount: 13,
    tags: ['Fantasy', 'Magic'],
  },
  // ── Pluto TV ───────────────────────────────────────────────────────────
  {
    id: 's18',
    slug: 'crimson-battalion',
    title: 'Crimson Battalion',
    description:
      'A squadron of misfit soldiers discovers a government cover-up while fighting on the front lines.',
    thumbnail:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Military', 'Drama'],
    language: 'dub',
    sourceName: 'Pluto TV',
    sourceType: 'pluto',
    isEmbeddable: false,
    watchUrl: 'https://pluto.tv/live-tv/pluto-tv-anime',
    releaseYear: 2016,
    episodeCount: 24,
    tags: ['Dubbed', 'Action', 'Trending'],
  },
  {
    id: 's19',
    slug: 'sky-pirates',
    title: 'Sky Pirates',
    description:
      'A ragtag crew of airship pirates seeks a legendary treasure hidden above the clouds.',
    thumbnail:
      'https://images.unsplash.com/photo-1464618663641-bbdd760ae84a?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1464618663641-bbdd760ae84a?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Adventure', 'Comedy', 'Fantasy'],
    language: 'both',
    sourceName: 'Pluto TV',
    sourceType: 'pluto',
    isEmbeddable: false,
    watchUrl: 'https://pluto.tv/live-tv/pluto-tv-anime',
    releaseYear: 2014,
    episodeCount: 52,
    tags: ['Comedy', 'Adventure'],
  },
  // ── RetroCrush ─────────────────────────────────────────────────────────
  {
    id: 's20',
    slug: 'star-blazer-x',
    title: 'Star Blazer X',
    description:
      'The heroic crew of a converted battleship races across the galaxy to save a dying Earth.',
    thumbnail:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Sci-Fi', 'Action', 'Drama'],
    language: 'dub',
    sourceName: 'RetroCrush',
    sourceType: 'retrocrush',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    releaseYear: 1975,
    episodeCount: 26,
    tags: ['Retro', 'Classic', 'Dubbed'],
  },
  {
    id: 's21',
    slug: 'ninja-scrolls',
    title: 'Ninja Scrolls',
    description:
      'A wandering ninja for hire unravels a deadly conspiracy deep in feudal Japan.',
    thumbnail:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Samurai', 'Historical'],
    language: 'sub',
    sourceName: 'RetroCrush',
    sourceType: 'retrocrush',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    releaseYear: 1993,
    episodeCount: 13,
    tags: ['Retro', 'Samurai', 'Classic'],
  },
  // ── Crunchyroll (free tier) ────────────────────────────────────────────
  {
    id: 's22',
    slug: 'dragon-path',
    title: 'Dragon Path',
    description:
      'A boy with the blood of a fire dragon trains to become the strongest martial artist in the land.',
    thumbnail:
      'https://images.unsplash.com/photo-1559181567-c3190ca9d5d4?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1559181567-c3190ca9d5d4?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Martial Arts', 'Adventure'],
    language: 'sub',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/videos/anime/popular',
    releaseYear: 2023,
    episodeCount: 24,
    tags: ['Trending', 'Action'],
  },
  {
    id: 's23',
    slug: 'alchemy-academy',
    title: 'Alchemy Academy',
    description:
      'Rival alchemists compete and cooperate at a prestigious school where every experiment can change the world.',
    thumbnail:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Fantasy', 'School', 'Comedy'],
    language: 'sub',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/videos/anime/popular',
    releaseYear: 2022,
    episodeCount: 12,
    tags: ['School', 'Comedy'],
  },
  // ── Additional series for 40+ entry milestone ─────────────────────────
  {
    id: 's24',
    slug: 'iron-tide',
    title: 'Iron Tide',
    description:
      'A submarine crew of rogue soldiers fights a shadow navy threatening global shipping lanes from the deep.',
    thumbnail:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Military', 'Thriller'],
    language: 'dub',
    sourceName: 'Tubi',
    sourceType: 'tubi',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    releaseYear: 2019,
    episodeCount: 26,
    tags: ['Dubbed', 'Action', 'Military'],
  },
  {
    id: 's25',
    slug: 'spirit-compass',
    title: 'Spirit Compass',
    description:
      'A wandering shrine maiden follows an enchanted compass that leads her to troubled spirits needing peace.',
    thumbnail:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Supernatural', 'Drama', 'Slice of Life'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=CMcAzn4dUck',
    releaseYear: 2021,
    episodeCount: 13,
    tags: ['Supernatural', 'Peaceful'],
  },
  {
    id: 's26',
    slug: 'hex-league',
    title: 'Hex League',
    description:
      'Teenage spellcasters compete in a worldwide esports tournament where magical abilities meet digital arenas.',
    thumbnail:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Fantasy', 'Sports', 'School'],
    language: 'sub',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/videos/anime/popular',
    releaseYear: 2024,
    episodeCount: 13,
    tags: ['Trending', 'Fantasy', 'Sports'],
  },
];

export const mockMovies: Movie[] = [
  {
    id: 'm1',
    slug: 'eternal-gate',
    title: 'Eternal Gate',
    description:
      'Two rival clans must unite to close a portal unleashing ancient demons across the mortal realm.',
    thumbnail:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Fantasy', 'Action'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=bE9X77tMC58',
    releaseYear: 2021,
    tags: ['Movie', 'Fantasy'],
  },
  {
    id: 'm2',
    slug: 'starfall-requiem',
    title: 'Starfall Requiem',
    description:
      'A meteor strike awakens long-dormant robots; humanity watches as machine battles machine in a war for survival.',
    thumbnail:
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Sci-Fi', 'Mecha'],
    language: 'dub',
    sourceName: 'FreeStream Anime',
    sourceType: 'freestream',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    releaseYear: 2019,
    tags: ['Movie', 'Mecha', 'Dubbed'],
  },
  {
    id: 'm3',
    slug: 'lantern-festival',
    title: 'Lantern Festival',
    description:
      'A heartfelt story of a girl searching for her missing grandmother through a magical mountain village.',
    thumbnail:
      'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Drama', 'Fantasy', 'Family'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=ErjwRMNC2LM',
    releaseYear: 2020,
    tags: ['Movie', 'Drama', 'Family'],
  },
  {
    id: 'm4',
    slug: 'shadow-temple',
    title: 'Shadow Temple',
    description:
      'A priest and his unlikely allies raid a cursed temple to retrieve a stolen artifact before it dooms the kingdom.',
    thumbnail:
      'https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Action', 'Fantasy', 'Adventure'],
    language: 'dub',
    sourceName: 'Tubi',
    sourceType: 'tubi',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    releaseYear: 2021,
    tags: ['Movie', 'Action', 'Dubbed'],
  },
  {
    id: 'm5',
    slug: 'celestial-voyage',
    title: 'Celestial Voyage',
    description:
      'An astronomer and a spirit guide travel through the cosmos to mend a rift in the stars.',
    thumbnail:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Sci-Fi', 'Fantasy', 'Drama'],
    language: 'sub',
    sourceName: 'RetroCrush',
    sourceType: 'retrocrush',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    releaseYear: 1988,
    tags: ['Movie', 'Retro', 'Classic'],
  },
  {
    id: 'm6',
    slug: 'battle-arena-zero',
    title: 'Battle Arena Zero',
    description:
      'Champions from across the world converge in an underground arena to prove who is truly the strongest.',
    thumbnail:
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Action', 'Martial Arts', 'Sports'],
    language: 'dub',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/videos/anime/popular',
    releaseYear: 2022,
    tags: ['Movie', 'Action', 'Dubbed'],
  },
  {
    id: 'm7',
    slug: 'frozen-horizon',
    title: 'Frozen Horizon',
    description:
      'A lone explorer ventures into an ice-locked continent to uncover a civilization preserved beneath the glacier.',
    thumbnail:
      'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Adventure', 'Mystery', 'Drama'],
    language: 'sub',
    sourceName: 'Pluto TV',
    sourceType: 'pluto',
    isEmbeddable: false,
    watchUrl: 'https://pluto.tv/live-tv/pluto-tv-anime',
    releaseYear: 2020,
    tags: ['Movie', 'Adventure', 'Mystery'],
  },
  {
    id: 'm8',
    slug: 'echo-of-the-void',
    title: 'Echo of the Void',
    description:
      'When a space station intercepts a signal from a dead star, its crew must decide whether to answer before reality unravels.',
    thumbnail:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Sci-Fi', 'Horror', 'Thriller'],
    language: 'dub',
    sourceName: 'Tubi',
    sourceType: 'tubi',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    releaseYear: 2021,
    tags: ['Movie', 'Sci-Fi', 'Dubbed'],
  },
];

export const mockLiveChannels: LiveChannel[] = [
  {
    id: 'l1',
    slug: 'shonen-station',
    name: 'Shonen Station',
    description:
      'Non-stop action anime 24/7. Tournament arcs, power-ups, and friendship speeches.',
    thumbnail:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop',
    channelNumber: '101',
    sourceName: 'Live Anime TV',
    sourceType: 'live',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/videos/anime/popular',
    tags: ['Action', 'Shonen', 'Live'],
    nowPlaying: 'Thunder Fist – Ep 22',
    nextUp: 'Blade of Eternity – Ep 5',
  },
  {
    id: 'l2',
    slug: 'retro-vault',
    name: 'Retro Vault',
    description:
      'Classic 80s and 90s anime preserved and presented in original form.',
    thumbnail:
      'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=225&fit=crop',
    channelNumber: '102',
    sourceName: 'Retro Channel',
    sourceType: 'retro',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    tags: ['Retro', '90s', '80s', 'Live'],
    nowPlaying: 'Mountain Spirit – Ep 3',
    nextUp: 'Ramen Ronin – Ep 12',
  },
  {
    id: 'l3',
    slug: 'mecha-core',
    name: 'Mecha Core',
    description:
      'Giant robots, piloted heroes, and epic space battles around the clock.',
    thumbnail:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=225&fit=crop',
    channelNumber: '103',
    sourceName: 'Live Anime TV',
    sourceType: 'live',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    tags: ['Mecha', 'Sci-Fi', 'Live'],
    nowPlaying: 'Orbital Striker – Ep 31',
    nextUp: 'Iron Heart Academy – Ep 8',
  },
  {
    id: 'l4',
    slug: 'youtube-premieres',
    name: 'YouTube Premieres',
    description:
      'Curated official anime channels from YouTube — embeddable episodes and playlists.',
    thumbnail:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=225&fit=crop',
    channelNumber: '104',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=1QfliUWiM8w',
    tags: ['YouTube', 'Official', 'Live'],
    nowPlaying: 'Sakura Storm – Ep 1',
    nextUp: 'Cafe Tengu – Ep 3',
  },
  {
    id: 'l5',
    slug: 'tubi-anime',
    name: 'Tubi Anime',
    description:
      'Free, ad-supported anime from the Tubi catalog — no subscription required.',
    thumbnail:
      'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&h=225&fit=crop',
    channelNumber: '105',
    sourceName: 'Tubi',
    sourceType: 'tubi',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/category/anime',
    tags: ['Tubi', 'Free', 'Live'],
    nowPlaying: 'Wolf Warrior – Ep 4',
    nextUp: 'Harbor Mages – Ep 2',
  },
  {
    id: 'l6',
    slug: 'pluto-anime',
    name: 'Pluto TV Anime',
    description:
      '24/7 free anime streaming on Pluto TV — watch anytime with no sign-up.',
    thumbnail:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
    channelNumber: '106',
    sourceName: 'Pluto TV',
    sourceType: 'pluto',
    isEmbeddable: false,
    watchUrl: 'https://pluto.tv/live-tv/pluto-tv-anime',
    tags: ['Pluto', 'Free', 'Live'],
    nowPlaying: 'Crimson Battalion – Ep 9',
    nextUp: 'Sky Pirates – Ep 12',
  },
  {
    id: 'l7',
    slug: 'retrocrush-classics',
    name: 'RetroCrush Classics',
    description:
      'Classic retro anime from the RetroCrush vault — free and officially licensed.',
    thumbnail:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop',
    channelNumber: '107',
    sourceName: 'RetroCrush',
    sourceType: 'retrocrush',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    tags: ['RetroCrush', 'Retro', 'Classic', 'Live'],
    nowPlaying: 'Ninja Scrolls – Ep 5',
    nextUp: 'Star Blazer X – Ep 3',
  },
  {
    id: 'l8',
    slug: 'crunchyroll-simulcast',
    name: 'Crunchyroll Simulcast',
    description:
      'Latest simulcast episodes from Crunchyroll — new episodes drop within hours of Japan broadcast.',
    thumbnail:
      'https://images.unsplash.com/photo-1559181567-c3190ca9d5d4?w=400&h=225&fit=crop',
    channelNumber: '108',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/videos/anime/popular',
    tags: ['Crunchyroll', 'Simulcast', 'New', 'Live'],
    nowPlaying: 'Dragon Path – Ep 18',
    nextUp: 'Hex League – Ep 7',
  },
];

export const mockEpisodes: Record<string, Episode[]> = {
  'blade-of-eternity': Array.from({ length: 6 }, (_, i) => ({
    id: `be-ep${i + 1}`,
    seriesSlug: 'blade-of-eternity',
    title: `Episode ${i + 1}: ${
      [
        'The Awakening',
        'Shattered Steel',
        'Kingdom of Ash',
        'Blood Covenant',
        'The Third Seal',
        'Demon Rising',
      ][i]
    }`,
    description: 'A pivotal episode that advances the main arc.',
    thumbnail:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=320&h=180&fit=crop',
    episodeNumber: i + 1,
    seasonNumber: 1,
    duration: '24 min',
    watchUrl: 'https://www.youtube.com/watch?v=1QfliUWiM8w',
    isEmbeddable: true,
    sourceName: 'YouTube Official',
  })),
  'sakura-storm': Array.from({ length: 5 }, (_, i) => ({
    id: `ss-ep${i + 1}`,
    seriesSlug: 'sakura-storm',
    title: `Episode ${i + 1}: ${
      [
        'Storm Born',
        'Petal Shield',
        'Festival Night',
        'Thunder Kiss',
        'Eye of the Storm',
      ][i]
    }`,
    description: 'Magical battles and heartfelt moments.',
    thumbnail:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=320&h=180&fit=crop',
    episodeNumber: i + 1,
    seasonNumber: 1,
    duration: '23 min',
    watchUrl: 'https://www.youtube.com/watch?v=J-H-_gEL62E',
    isEmbeddable: true,
    sourceName: 'YouTube Official',
  })),
  'ghost-precinct': Array.from({ length: 4 }, (_, i) => ({
    id: `gp-ep${i + 1}`,
    seriesSlug: 'ghost-precinct',
    title: `Episode ${i + 1}: ${
      ['Cold Case', 'The Haunting', 'Spirit Evidence', 'Phantom Witness'][i]
    }`,
    description: 'Supernatural detective work in the spirit city.',
    thumbnail:
      'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=320&h=180&fit=crop',
    episodeNumber: i + 1,
    seasonNumber: 1,
    duration: '25 min',
    watchUrl: 'https://www.youtube.com/watch?v=m3wZn7Le4yM',
    isEmbeddable: true,
    sourceName: 'YouTube Official',
  })),
};

export function getSeriesBySlug(slug: string): AnimeSeries | undefined {
  return mockSeries.find((s) => s.slug === slug);
}
export function getEpisodesBySeries(slug: string): Episode[] {
  return mockEpisodes[slug] ?? [];
}
export function getEpisodeById(id: string): Episode | undefined {
  return Object.values(mockEpisodes)
    .flat()
    .find((ep) => ep.id === id);
}
export function getRelatedSeries(
  series: AnimeSeries,
  count = 6
): AnimeSeries[] {
  return mockSeries
    .filter(
      (s) =>
        s.id !== series.id && s.genres.some((g) => series.genres.includes(g))
    )
    .slice(0, count);
}
export const allContent = [...mockSeries, ...mockMovies] as Array<
  AnimeSeries | Movie
>;
