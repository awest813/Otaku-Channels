import type { AnimeSeries, Episode, LiveChannel, Movie } from '@/types';

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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    watchUrl: 'https://example.com/neon-shibuya',
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    watchUrl: 'https://example.com/iron-heart-academy',
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    watchUrl: 'https://example.com/void-hunters',
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
    watchUrl: 'https://example.com/ramen-ronin',
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    watchUrl: 'https://example.com/demon-village',
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    watchUrl: 'https://example.com/mountain-spirit',
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
    watchUrl: 'https://example.com/thunder-fist',
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    watchUrl: 'https://example.com/orbital-striker',
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    releaseYear: 2022,
    episodeCount: 24,
    tags: ['Mystery', 'Supernatural'],
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    watchUrl: 'https://example.com/starfall-requiem',
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    releaseYear: 2020,
    tags: ['Movie', 'Drama', 'Family'],
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
    watchUrl: 'https://example.com/live/shonen-station',
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
    watchUrl: 'https://example.com/live/retro-vault',
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
    watchUrl: 'https://example.com/live/mecha-core',
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tags: ['YouTube', 'Official', 'Live'],
    nowPlaying: 'Sakura Storm – Ep 1',
    nextUp: 'Cafe Tengu – Ep 3',
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
