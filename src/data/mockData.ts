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
    isOfficial: true,
    region: 'global',
    embedType: 'youtube',
  },
  {
    id: 'tubi',
    name: 'Tubi',
    type: 'tubi',
    baseUrl: 'https://tubitv.com/category/anime',
    isOfficial: true,
    region: 'US',
    embedType: 'external',
  },
  {
    id: 'pluto',
    name: 'Pluto TV',
    type: 'pluto',
    baseUrl: 'https://pluto.tv/live-tv/pluto-tv-anime',
    isOfficial: true,
    region: 'US',
    embedType: 'external',
  },
  {
    id: 'retrocrush',
    name: 'RetroCrush',
    type: 'retrocrush',
    baseUrl: 'https://www.retrocrush.tv',
    isOfficial: true,
    region: 'global',
    embedType: 'external',
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    type: 'crunchyroll',
    baseUrl: 'https://www.crunchyroll.com/videos/anime/popular',
    isOfficial: true,
    region: 'global',
    embedType: 'external',
  },
  {
    id: 'retro',
    name: 'Retro Channel',
    type: 'retro',
    baseUrl: 'https://www.retrocrush.tv',
    isOfficial: false,
    region: 'global',
    embedType: 'iframe',
  },
  {
    id: 'freestream',
    name: 'FreeStream Anime',
    type: 'freestream',
    baseUrl: 'https://tubitv.com/category/anime',
    isOfficial: false,
    region: 'global',
    embedType: 'iframe',
  },
  {
    id: 'consumet',
    name: 'Consumet',
    type: 'consumet',
    baseUrl: 'https://consumet.org',
    isOfficial: false,
    region: 'global',
    embedType: 'hls',
  },
  {
    id: 'jikan',
    name: 'MyAnimeList (Jikan API)',
    type: 'jikan',
    baseUrl: 'https://myanimelist.net',
    isOfficial: false,
    region: 'global',
    embedType: 'external',
  },
  {
    id: 'kitsu',
    name: 'Kitsu API',
    type: 'kitsu',
    baseUrl: 'https://kitsu.io',
    isOfficial: false,
    region: 'global',
    embedType: 'external',
  },
  {
    id: 'shikimori',
    name: 'Shikimori API',
    type: 'shikimori',
    baseUrl: 'https://shikimori.one',
    isOfficial: false,
    region: 'global',
    embedType: 'external',
  },
];

export const mockSeries: AnimeSeries[] = [
  // ── YouTube Official (embeddable with real video IDs) ─────────────────
  {
    id: 's1',
    slug: 'demon-slayer-highlights',
    title: 'Demon Slayer Highlights',
    description:
      "Official clips and highlights from the Demon Slayer anime series on Crunchyroll's YouTube channel. Experience breathtaking battles and emotional moments in stunning animation.",
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
    // Crunchyroll official Demon Slayer clip on YouTube
    watchUrl: 'https://www.youtube.com/watch?v=VQGCKyvzIM4',
    releaseYear: 2019,
    episodeCount: 26,
    tags: ['Trending', 'Action'],
  },
  {
    id: 's2',
    slug: 'one-punch-man-clips',
    title: 'One Punch Man — Official Clips',
    description:
      'Official clips from One Punch Man, the hit anime about the strongest hero who defeats any enemy with a single punch. Features epic battles and hilarious moments.',
    thumbnail:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // Official One Punch Man clip
    watchUrl: 'https://www.youtube.com/watch?v=0Lhvn4RK_7I',
    releaseYear: 2015,
    episodeCount: 24,
    tags: ['Trending', 'Action', 'Comedy'],
  },
  {
    id: 's3',
    slug: 'attack-on-titan-clips',
    title: 'Attack on Titan — Official Clips',
    description:
      'Official clips from Attack on Titan. Humanity fights for survival against the terrifying Titans in this epic dark fantasy series.',
    thumbnail:
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Drama', 'Fantasy'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // Funimation AoT official clip
    watchUrl: 'https://www.youtube.com/watch?v=MGRm4IzK1SQ',
    releaseYear: 2013,
    episodeCount: 87,
    tags: ['Trending', 'Action', 'Dark'],
  },
  {
    id: 's4',
    slug: 'my-hero-academia-clips',
    title: 'My Hero Academia — Clips',
    description:
      'Official clips from My Hero Academia, the beloved shonen series about a boy born without powers in a world full of superheroes.',
    thumbnail:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'School', 'Superhero'],
    language: 'both',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // MHA official clip from Funimation
    watchUrl: 'https://www.youtube.com/watch?v=IhQvOOIFGiY',
    releaseYear: 2016,
    episodeCount: 113,
    tags: ['Trending', 'Action', 'School'],
  },
  {
    id: 's5',
    slug: 'naruto-free-episodes',
    title: 'Naruto — Free on Crunchyroll',
    description:
      'Follow Naruto Uzumaki on his journey to become the greatest ninja and earn the title of Hokage. Classic shonen adventure available free.',
    thumbnail:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Adventure', 'Fantasy'],
    language: 'both',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/naruto',
    releaseYear: 2002,
    episodeCount: 220,
    tags: ['Classic', 'Action', 'Adventure'],
  },
  {
    id: 's6',
    slug: 'dragon-ball-z-free',
    title: 'Dragon Ball Z — Free on Tubi',
    description:
      'The legendary Dragon Ball Z — Goku and friends defend Earth against increasingly powerful enemies in this iconic action series. Free on Tubi.',
    thumbnail:
      'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Adventure', 'Martial Arts'],
    language: 'dub',
    sourceName: 'Tubi',
    sourceType: 'tubi',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/series/3532/dragon-ball-z',
    releaseYear: 1989,
    episodeCount: 291,
    tags: ['Classic', 'Dubbed', 'Action'],
  },
  {
    id: 's7',
    slug: 'sword-art-online-clips',
    title: 'Sword Art Online — Official Clips',
    description:
      'Official clips from Sword Art Online. Players trapped in a virtual reality MMORPG must fight to survive and escape the game.',
    thumbnail:
      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Fantasy', 'Romance'],
    language: 'both',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // Official SAO clip on Aniplex channel
    watchUrl: 'https://www.youtube.com/watch?v=6ohYYtxfDCg',
    releaseYear: 2012,
    episodeCount: 25,
    tags: ['Action', 'Fantasy', 'Romance'],
  },
  {
    id: 's8',
    slug: 'fullmetal-alchemist-brotherhood',
    title: 'Fullmetal Alchemist: Brotherhood',
    description:
      'Two brothers use alchemy to restore what they lost. A story of sacrifice, redemption, and the true cost of power. Widely considered one of the greatest anime ever made.',
    thumbnail:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Adventure', 'Drama'],
    language: 'both',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/fullmetal-alchemist-brotherhood',
    releaseYear: 2009,
    episodeCount: 64,
    tags: ['Classic', 'Action', 'Drama', 'Trending'],
  },
  {
    id: 's9',
    slug: 'spirited-away-clips',
    title: 'Studio Ghibli — Official Clips',
    description:
      "Official clips from Studio Ghibli's beloved films on their YouTube channel. Featuring breathtaking animation and magical storytelling.",
    thumbnail:
      'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Fantasy', 'Adventure', 'Family'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // Studio Ghibli official YouTube clip
    watchUrl: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
    releaseYear: 2001,
    episodeCount: 1,
    tags: ['Ghibli', 'Family', 'Fantasy'],
  },
  {
    id: 's10',
    slug: 'jujutsu-kaisen-clips',
    title: 'Jujutsu Kaisen — Official Clips',
    description:
      'Official clips from Jujutsu Kaisen. A boy swallows a cursed talisman and joins a secret organization to hunt down cursed spirits.',
    thumbnail:
      'https://images.unsplash.com/photo-1555883006-0f5a0915a80f?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1555883006-0f5a0915a80f?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Horror', 'School'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // Crunchyroll official JJK clip
    watchUrl: 'https://www.youtube.com/watch?v=PKNZKOpVCcU',
    releaseYear: 2020,
    episodeCount: 47,
    tags: ['Trending', 'Action', 'Horror'],
  },
  {
    id: 's11',
    slug: 'pokemon-free',
    title: 'Pokémon — Official on YouTube',
    description:
      "Watch Ash and Pikachu's adventures free on the official Pokémon YouTube channel. Full episodes available!",
    thumbnail:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Adventure', 'Family', 'Fantasy'],
    language: 'dub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // Official Pokemon YouTube channel playlist
    watchUrl: 'https://www.youtube.com/watch?v=RYNA_FZEVLA',
    releaseYear: 1997,
    episodeCount: 1000,
    tags: ['Family', 'Classic', 'Dubbed'],
  },
  {
    id: 's12',
    slug: 'bleach-clips',
    title: 'Bleach — Official Clips',
    description:
      'Official clips from Bleach. Ichigo Kurosaki gains the powers of a Soul Reaper and must defend the living world against evil spirits.',
    thumbnail:
      'https://images.unsplash.com/photo-1555436169-f51a0cfe5e2c?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1555436169-f51a0cfe5e2c?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Adventure', 'Supernatural'],
    language: 'both',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // Official Bleach clip from Viz Media
    watchUrl: 'https://www.youtube.com/watch?v=Q2vsDLiTFkU',
    releaseYear: 2004,
    episodeCount: 366,
    tags: ['Classic', 'Action', 'Dubbed'],
  },
  {
    id: 's13',
    slug: 'hunter-x-hunter-clips',
    title: 'Hunter x Hunter — Official Clips',
    description:
      'Official clips from Hunter x Hunter (2011). A young boy sets out to become a Hunter like his father, facing dangerous trials and powerful enemies.',
    thumbnail:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Adventure', 'Fantasy'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // HxH official English dub clip
    watchUrl: 'https://www.youtube.com/watch?v=D9iTQRB4XRk',
    releaseYear: 2011,
    episodeCount: 148,
    tags: ['Classic', 'Action', 'Adventure'],
  },
  {
    id: 's14',
    slug: 'fairy-tail-free',
    title: 'Fairy Tail — Free on Crunchyroll',
    description:
      'Natsu and friends of the Fairy Tail guild go on magical adventures in the land of Fiore. Epic battles, friendship, and magic!',
    thumbnail:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Fantasy', 'Comedy'],
    language: 'both',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/fairy-tail',
    releaseYear: 2009,
    episodeCount: 328,
    tags: ['Classic', 'Action', 'Fantasy'],
  },
  {
    id: 's15',
    slug: 'death-note-free',
    title: 'Death Note — Free on Tubi',
    description:
      'A high school student discovers a supernatural notebook that lets him kill anyone whose name is written in it. A psychological battle between Light Yagami and the detective L.',
    thumbnail:
      'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Thriller', 'Mystery', 'Supernatural'],
    language: 'both',
    sourceName: 'Tubi',
    sourceType: 'tubi',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/series/474/death-note',
    releaseYear: 2006,
    episodeCount: 37,
    tags: ['Thriller', 'Mystery', 'Trending'],
  },
  // ── Tubi ──────────────────────────────────────────────────────────────
  {
    id: 's16',
    slug: 'black-clover-free',
    title: 'Black Clover — Free on Tubi',
    description:
      'Asta, a boy with no magic power in a magic-filled world, aims to become the Wizard King. Full series free on Tubi.',
    thumbnail:
      'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Fantasy', 'Adventure'],
    language: 'dub',
    sourceName: 'Tubi',
    sourceType: 'tubi',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/series/7217/black-clover',
    releaseYear: 2017,
    episodeCount: 170,
    tags: ['Action', 'Fantasy', 'Dubbed'],
  },
  {
    id: 's17',
    slug: 'one-piece-free',
    title: 'One Piece — Free on Crunchyroll',
    description:
      'Monkey D. Luffy sails the seas to find the ultimate treasure and become the Pirate King. The greatest adventure anime ever made.',
    thumbnail:
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Adventure', 'Comedy'],
    language: 'both',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/one-piece',
    releaseYear: 1999,
    episodeCount: 1000,
    tags: ['Classic', 'Action', 'Adventure', 'Trending'],
  },
  // ── Pluto TV ───────────────────────────────────────────────────────────
  {
    id: 's18',
    slug: 'inuyasha-pluto',
    title: 'InuYasha — Free on Pluto TV',
    description:
      'A modern-day schoolgirl is transported to feudal Japan where she teams up with a half-demon named InuYasha on a quest for the Shikon Jewel.',
    thumbnail:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Romance', 'Fantasy'],
    language: 'dub',
    sourceName: 'Pluto TV',
    sourceType: 'pluto',
    isEmbeddable: false,
    watchUrl: 'https://pluto.tv/live-tv/pluto-tv-anime',
    releaseYear: 2000,
    episodeCount: 167,
    tags: ['Classic', 'Romance', 'Fantasy', 'Dubbed'],
  },
  {
    id: 's19',
    slug: 'sailor-moon-pluto',
    title: 'Sailor Moon — Free on Pluto TV',
    description:
      'Usagi Tsukino transforms into Sailor Moon to battle evil forces as part of the legendary Sailor Scouts. A classic magical girl series.',
    thumbnail:
      'https://images.unsplash.com/photo-1464618663641-bbdd760ae84a?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1464618663641-bbdd760ae84a?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Magical Girl', 'Romance', 'Action'],
    language: 'both',
    sourceName: 'Pluto TV',
    sourceType: 'pluto',
    isEmbeddable: false,
    watchUrl: 'https://pluto.tv/live-tv/pluto-tv-anime',
    releaseYear: 1992,
    episodeCount: 200,
    tags: ['Classic', 'Magical Girl', 'Romance'],
  },
  // ── RetroCrush ─────────────────────────────────────────────────────────
  {
    id: 's20',
    slug: 'cowboy-bebop-retro',
    title: 'Cowboy Bebop — Free on RetroCrush',
    description:
      'The year is 2071. Space bounty hunters travel the solar system in search of fugitives and their own lost pasts. A timeless classic.',
    thumbnail:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Sci-Fi', 'Action', 'Drama'],
    language: 'both',
    sourceName: 'RetroCrush',
    sourceType: 'retrocrush',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    releaseYear: 1998,
    episodeCount: 26,
    tags: ['Classic', 'Retro', 'Dubbed'],
  },
  {
    id: 's21',
    slug: 'ghost-in-the-shell-retro',
    title: 'Ghost in the Shell: SAC',
    description:
      'Major Motoko Kusanagi leads Section 9, a covert ops unit, in a futuristic Japan dealing with cybercrime and political intrigue.',
    thumbnail:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Sci-Fi', 'Action', 'Cyberpunk'],
    language: 'both',
    sourceName: 'RetroCrush',
    sourceType: 'retrocrush',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    releaseYear: 2002,
    episodeCount: 52,
    tags: ['Classic', 'Retro', 'Cyberpunk'],
  },
  // ── Crunchyroll (free tier) ────────────────────────────────────────────
  {
    id: 's22',
    slug: 'spy-x-family-crunchyroll',
    title: 'SPY x FAMILY — Free on Crunchyroll',
    description:
      'A spy, an assassin, and a telepath form a fake family — but each has a secret. Heartwarming, hilarious, and full of espionage.',
    thumbnail:
      'https://images.unsplash.com/photo-1559181567-c3190ca9d5d4?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1559181567-c3190ca9d5d4?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Comedy', 'Action', 'Family'],
    language: 'sub',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/spy-x-family',
    releaseYear: 2022,
    episodeCount: 25,
    tags: ['Trending', 'Comedy', 'Action'],
  },
  {
    id: 's23',
    slug: 'vinland-saga-crunchyroll',
    title: 'Vinland Saga — Free on Crunchyroll',
    description:
      'A young Viking warrior embarks on a journey of revenge that leads to unexpected places. A sweeping historical epic.',
    thumbnail:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Historical', 'Drama'],
    language: 'sub',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/vinland-saga',
    releaseYear: 2019,
    episodeCount: 48,
    tags: ['Action', 'Historical', 'Drama'],
  },
  {
    id: 's24',
    slug: 'chainsaw-man-crunchyroll',
    title: 'Chainsaw Man — Free on Crunchyroll',
    description:
      'Denji lives a miserable life as a debt-ridden Devil Hunter until a contract with his chainsaw dog devil Pochita transforms his fate.',
    thumbnail:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Action', 'Horror', 'Fantasy'],
    language: 'sub',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/chainsaw-man',
    releaseYear: 2022,
    episodeCount: 12,
    tags: ['Trending', 'Action', 'Horror'],
  },
  {
    id: 's25',
    slug: 'avatar-last-airbender',
    title: 'Avatar: The Last Airbender',
    description:
      'Aang, the last Airbender, must master all four elements to restore peace to a world torn apart by the Fire Nation. An animated epic.',
    thumbnail:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Adventure', 'Fantasy', 'Action'],
    language: 'dub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // Official Avatar clip/episode on Nickelodeon's YouTube
    watchUrl: 'https://www.youtube.com/watch?v=d1EnW4575Gw',
    releaseYear: 2005,
    episodeCount: 61,
    tags: ['Classic', 'Family', 'Adventure', 'Dubbed'],
  },
  {
    id: 's26',
    slug: 'tokyo-ghoul-clips',
    title: 'Tokyo Ghoul — Official Clips',
    description:
      'Ken Kaneki becomes a half-ghoul after a near-fatal encounter, forcing him to live between two worlds. Dark urban fantasy.',
    thumbnail:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop',
    type: 'series',
    genres: ['Horror', 'Action', 'Drama'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // Official Tokyo Ghoul clip
    watchUrl: 'https://www.youtube.com/watch?v=l2NWsIhGzJg',
    releaseYear: 2014,
    episodeCount: 48,
    tags: ['Horror', 'Action', 'Dark'],
  },
  {
    id: 's-blade',
    slug: 'blade-of-eternity',
    title: 'Blade of Eternity',
    description:
      'A young swordsman wields the legendary Blade of Eternity to protect his world from an ancient evil that threatens to consume everything.',
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
    watchUrl: 'https://www.youtube.com/watch?v=VQGCKyvzIM4',
    releaseYear: 2022,
    episodeCount: 3,
    tags: ['Action', 'Fantasy'],
  },
];

export const mockMovies: Movie[] = [
  {
    id: 'm1',
    slug: 'spirited-away-movie',
    title: 'Spirited Away',
    description:
      'A young girl wanders into a world ruled by gods, witches, and spirits. A breathtaking Studio Ghibli masterpiece. Available on various streaming platforms.',
    thumbnail:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Fantasy', 'Adventure', 'Family'],
    language: 'sub',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
    releaseYear: 2001,
    tags: ['Movie', 'Ghibli', 'Fantasy'],
  },
  {
    id: 'm2',
    slug: 'your-name-movie',
    title: 'Your Name (Kimi no Na wa)',
    description:
      'Two strangers find themselves linked in a bizarre way — switching bodies across time and distance. A beautiful and heart-wrenching love story.',
    thumbnail:
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Romance', 'Drama', 'Fantasy'],
    language: 'sub',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/movie/your-name',
    releaseYear: 2016,
    tags: ['Movie', 'Romance', 'Drama'],
  },
  {
    id: 'm3',
    slug: 'princess-mononoke',
    title: 'Princess Mononoke',
    description:
      "A young warrior becomes embroiled in a struggle between forest gods and humans who consume the forest's resources. A Studio Ghibli epic.",
    thumbnail:
      'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Action', 'Adventure', 'Fantasy'],
    language: 'both',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    watchUrl: 'https://www.youtube.com/watch?v=4OiMOHRDs14',
    releaseYear: 1997,
    tags: ['Movie', 'Ghibli', 'Classic'],
  },
  {
    id: 'm4',
    slug: 'howls-moving-castle',
    title: "Howl's Moving Castle",
    description:
      'A young woman cursed with old age finds refuge in the moving castle of a wizard named Howl. A magical love story from Studio Ghibli.',
    thumbnail:
      'https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Fantasy', 'Romance', 'Adventure'],
    language: 'both',
    sourceName: 'Tubi',
    sourceType: 'tubi',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/movies/howls-moving-castle',
    releaseYear: 2004,
    tags: ['Movie', 'Ghibli', 'Romance'],
  },
  {
    id: 'm5',
    slug: 'akira-classic',
    title: 'Akira',
    description:
      'In a dystopian future Tokyo, a biker gang member is caught up in a government conspiracy involving telekinetic powers and military experiments.',
    thumbnail:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Sci-Fi', 'Action', 'Cyberpunk'],
    language: 'both',
    sourceName: 'RetroCrush',
    sourceType: 'retrocrush',
    isEmbeddable: false,
    watchUrl: 'https://www.retrocrush.tv',
    releaseYear: 1988,
    tags: ['Movie', 'Classic', 'Cyberpunk', 'Retro'],
  },
  {
    id: 'm6',
    slug: 'my-neighbor-totoro',
    title: 'My Neighbor Totoro',
    description:
      'Two young girls encounter magical forest creatures while their mother is recovering in the hospital. A heartwarming Ghibli classic.',
    thumbnail:
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Family', 'Fantasy', 'Slice of Life'],
    language: 'both',
    sourceName: 'YouTube Official',
    sourceType: 'youtube',
    isEmbeddable: true,
    // Official Ghibli clip
    watchUrl: 'https://www.youtube.com/watch?v=92a7Hj0ijLs',
    releaseYear: 1988,
    tags: ['Movie', 'Ghibli', 'Family', 'Classic'],
  },
  {
    id: 'm7',
    slug: 'weathering-with-you',
    title: 'Weathering with You',
    description:
      'A runaway high school boy meets a girl who has the power to stop the rain and bring out the sun. A beautiful romantic fantasy.',
    thumbnail:
      'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Romance', 'Fantasy', 'Drama'],
    language: 'sub',
    sourceName: 'Crunchyroll',
    sourceType: 'crunchyroll',
    isEmbeddable: false,
    watchUrl: 'https://www.crunchyroll.com/movie/weathering-with-you',
    releaseYear: 2019,
    tags: ['Movie', 'Romance', 'Fantasy'],
  },
  {
    id: 'm8',
    slug: 'dragon-ball-super-broly',
    title: 'Dragon Ball Super: Broly',
    description:
      'Goku and Vegeta face Broly, a Saiyan warrior with immeasurable power. Stunning animation and intense battles.',
    thumbnail:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=225&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200&h=600&fit=crop',
    type: 'movie',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    language: 'both',
    sourceName: 'Tubi',
    sourceType: 'tubi',
    isEmbeddable: false,
    watchUrl: 'https://tubitv.com/movies/dragon-ball-super-broly',
    releaseYear: 2018,
    tags: ['Movie', 'Action', 'Dubbed'],
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
    nowPlaying: 'Demon Slayer – Ep 22',
    nextUp: 'Jujutsu Kaisen – Ep 5',
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
    nowPlaying: 'Cowboy Bebop – Ep 3',
    nextUp: 'Ghost in the Shell SAC – Ep 12',
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
    nowPlaying: 'Evangelion – Ep 31',
    nextUp: 'Gundam Wing – Ep 8',
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
    watchUrl: 'https://www.youtube.com/watch?v=VQGCKyvzIM4',
    tags: ['YouTube', 'Official', 'Live'],
    nowPlaying: 'Demon Slayer – Official Clip',
    nextUp: 'One Punch Man – Best Fights',
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
    nowPlaying: 'Dragon Ball Z – Ep 4',
    nextUp: 'Death Note – Ep 2',
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
    nowPlaying: 'InuYasha – Ep 9',
    nextUp: 'Sailor Moon – Ep 12',
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
    nowPlaying: 'Akira',
    nextUp: 'Cowboy Bebop – Ep 5',
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
    nowPlaying: 'SPY x FAMILY – Ep 18',
    nextUp: 'Chainsaw Man – Ep 7',
  },
];

export const mockEpisodes: Record<string, Episode[]> = {
  'demon-slayer-highlights': Array.from({ length: 6 }, (_, i) => ({
    id: `ds-ep${i + 1}`,
    seriesSlug: 'demon-slayer-highlights',
    title: `Clip ${i + 1}: ${
      [
        "Tanjiro's First Mission",
        'Water Breathing Forms',
        'Muzan Kibutsuji',
        "Zenitsu's Thunder",
        "Inosuke's Beast Breathing",
        'Final Selection',
      ][i]
    }`,
    description: 'Official clip from Demon Slayer: Kimetsu no Yaiba.',
    thumbnail:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=320&h=180&fit=crop',
    episodeNumber: i + 1,
    seasonNumber: 1,
    duration: '~5 min',
    watchUrl: 'https://www.youtube.com/watch?v=VQGCKyvzIM4',
    isEmbeddable: true,
    sourceName: 'YouTube Official',
  })),
  'one-punch-man-clips': Array.from({ length: 5 }, (_, i) => ({
    id: `opm-ep${i + 1}`,
    seriesSlug: 'one-punch-man-clips',
    title: `Best Fights ${i + 1}: ${
      [
        'Saitama vs Boros',
        'Saitama vs Genos',
        'King vs Awakened Centipede',
        'Garou vs Bang',
        'Metal Bat Rampage',
      ][i]
    }`,
    description: 'Official One Punch Man clip.',
    thumbnail:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=320&h=180&fit=crop',
    episodeNumber: i + 1,
    seasonNumber: 1,
    duration: '~10 min',
    watchUrl: 'https://www.youtube.com/watch?v=0Lhvn4RK_7I',
    isEmbeddable: true,
    sourceName: 'YouTube Official',
  })),
  'jujutsu-kaisen-clips': Array.from({ length: 4 }, (_, i) => ({
    id: `jjk-ep${i + 1}`,
    seriesSlug: 'jujutsu-kaisen-clips',
    title: `Clip ${i + 1}: ${
      [
        'Yuji Joins Jujutsu Tech',
        'Domain Expansion',
        'Sukuna Awakens',
        'Nanami vs Mahito',
      ][i]
    }`,
    description: 'Official Jujutsu Kaisen clip from Crunchyroll.',
    thumbnail:
      'https://images.unsplash.com/photo-1555883006-0f5a0915a80f?w=320&h=180&fit=crop',
    episodeNumber: i + 1,
    seasonNumber: 1,
    duration: '~8 min',
    watchUrl: 'https://www.youtube.com/watch?v=PKNZKOpVCcU',
    isEmbeddable: true,
    sourceName: 'YouTube Official',
  })),
  'attack-on-titan-clips': Array.from({ length: 4 }, (_, i) => ({
    id: `aot-ep${i + 1}`,
    seriesSlug: 'attack-on-titan-clips',
    title: `Clip ${i + 1}: ${
      [
        'The Colossal Titan Appears',
        'Levi vs Titan',
        'The Battle of Trost',
        'Rumbling Begins',
      ][i]
    }`,
    description: 'Official Attack on Titan clip.',
    thumbnail:
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=320&h=180&fit=crop',
    episodeNumber: i + 1,
    seasonNumber: 1,
    duration: '~12 min',
    watchUrl: 'https://www.youtube.com/watch?v=MGRm4IzK1SQ',
    isEmbeddable: true,
    sourceName: 'YouTube Official',
  })),
  'blade-of-eternity': Array.from({ length: 3 }, (_, i) => ({
    id: `blade-ep${i + 1}`,
    seriesSlug: 'blade-of-eternity',
    title: `Episode ${i + 1}: ${
      ['The Awakening', 'Forging Destiny', 'Edge of Darkness'][i]
    }`,
    description: 'An episode of Blade of Eternity.',
    thumbnail:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=320&h=180&fit=crop',
    episodeNumber: i + 1,
    seasonNumber: 1,
    duration: '~24 min',
    watchUrl: 'https://www.youtube.com/watch?v=VQGCKyvzIM4',
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
