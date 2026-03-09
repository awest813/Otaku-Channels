/**
 * Seed script — run with: cd backend && npm run db:seed
 *
 * Populates the database with:
 *  - Approved source domains
 *  - Sample anime titles with genres, tags, aliases
 *  - Sample episodes
 *  - Sample channels (Retro Mecha, Shonen Power Hour, Cozy Slice of Life, etc.)
 *  - Channel program blocks and schedules
 *  - An admin user (dev only)
 */

import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const db = new PrismaClient();

// ─── Allowed source domains ──────────────────────────────────────────────────

const ALLOWED_DOMAINS = [
  { domain: 'www.youtube.com', name: 'YouTube', isEmbeddable: true, notes: 'Official YouTube embeds' },
  { domain: 'youtube.com', name: 'YouTube (bare)', isEmbeddable: true },
  { domain: 'youtu.be', name: 'YouTube (short)', isEmbeddable: true },
  { domain: 'tubitv.com', name: 'Tubi', isEmbeddable: false, notes: 'Free ad-supported' },
  { domain: 'pluto.tv', name: 'Pluto TV', isEmbeddable: false, notes: 'Free ad-supported live channels' },
  { domain: 'www.retrocrush.tv', name: 'RetroCrush', isEmbeddable: false, notes: 'Retro anime — officially licensed' },
  { domain: 'retrocrush.tv', name: 'RetroCrush (bare)', isEmbeddable: false },
  { domain: 'www.crunchyroll.com', name: 'Crunchyroll', isEmbeddable: false, notes: 'Free tier available' },
  { domain: 'crunchyroll.com', name: 'Crunchyroll (bare)', isEmbeddable: false },
  { domain: 'www.funimation.com', name: 'Funimation', isEmbeddable: false },
  { domain: 'hidive.com', name: 'HIDIVE', isEmbeddable: false, notes: 'Has free tier' },
  { domain: 'www.hidive.com', name: 'HIDIVE (www)', isEmbeddable: false },
];

// ─── Genres ──────────────────────────────────────────────────────────────────

const GENRES = [
  'action', 'adventure', 'comedy', 'drama', 'fantasy', 'horror', 'magic',
  'mecha', 'military', 'mystery', 'psychological', 'romance', 'samurai',
  'sci-fi', 'school', 'slice-of-life', 'sports', 'supernatural', 'thriller',
  'martial-arts', 'historical', 'cyberpunk', 'magical-girl', 'music',
];

// ─── Sample anime ─────────────────────────────────────────────────────────────

const ANIME_DATA = [
  {
    title: 'Blade of Eternity',
    slug: 'blade-of-eternity',
    titleEnglish: 'Blade of Eternity',
    synopsis: 'A young swordsman discovers ancient powers as he defends his homeland from a demonic invasion spanning three kingdoms.',
    type: 'TV' as const,
    status: 'COMPLETED' as const,
    releaseYear: 2021,
    releaseSeason: 'FALL' as const,
    episodeCount: 24,
    episodeDuration: 24,
    posterUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop',
    rating: 8.2,
    trendingScore: 95,
    isFeatured: true,
    genres: ['action', 'fantasy', 'adventure'],
    tags: ['trending', 'shonen'],
    sources: [{
      domain: 'www.youtube.com',
      url: 'https://www.youtube.com/playlist?list=PLxxxxxxxx',
      sourceName: 'YouTube Official',
      sourceType: 'youtube',
      isEmbeddable: true,
      language: 'sub',
      region: 'global',
    }],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, title: 'The Awakening', durationSeconds: 1440 },
      { episodeNumber: 2, seasonNumber: 1, title: 'Shattered Steel', durationSeconds: 1440 },
      { episodeNumber: 3, seasonNumber: 1, title: 'Kingdom of Ash', durationSeconds: 1440 },
      { episodeNumber: 4, seasonNumber: 1, title: 'Blood Covenant', durationSeconds: 1440 },
      { episodeNumber: 5, seasonNumber: 1, title: 'The Third Seal', durationSeconds: 1440 },
      { episodeNumber: 6, seasonNumber: 1, title: 'Demon Rising', durationSeconds: 1440 },
    ],
  },
  {
    title: 'Neon Shibuya',
    slug: 'neon-shibuya',
    titleEnglish: 'Neon Shibuya',
    synopsis: 'In a cyberpunk future Tokyo, a hacker uncovers a conspiracy that threatens to merge humans with AI.',
    type: 'TV' as const,
    status: 'COMPLETED' as const,
    releaseYear: 2022,
    releaseSeason: 'WINTER' as const,
    episodeCount: 12,
    episodeDuration: 23,
    posterUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=600&fit=crop',
    rating: 8.7,
    trendingScore: 88,
    isFeatured: true,
    genres: ['sci-fi', 'thriller', 'cyberpunk'],
    tags: ['cyberpunk', 'seinen'],
    sources: [{
      domain: 'tubitv.com',
      url: 'https://tubitv.com/series/000000/neon-shibuya',
      sourceName: 'Tubi',
      sourceType: 'tubi',
      isEmbeddable: false,
      language: 'dub',
      region: 'US',
    }],
    episodes: [],
  },
  {
    title: 'Iron Heart Academy',
    slug: 'iron-heart-academy',
    titleEnglish: 'Iron Heart Academy',
    synopsis: 'A mechanical prodigy enrolls in a prestigious academy for gifted students, where rivalries forge destiny.',
    type: 'TV' as const,
    status: 'COMPLETED' as const,
    releaseYear: 2003,
    releaseSeason: 'SPRING' as const,
    episodeCount: 26,
    episodeDuration: 25,
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=600&fit=crop',
    rating: 7.8,
    trendingScore: 60,
    genres: ['mecha', 'school', 'action'],
    tags: ['retro', 'mecha'],
    sources: [],
    episodes: [],
  },
  {
    title: 'Sakura Storm',
    slug: 'sakura-storm',
    titleEnglish: 'Sakura Storm',
    synopsis: 'A magical girl story reimagined — a high school student awakens storm powers during a mysterious festival.',
    type: 'TV' as const,
    status: 'ONGOING' as const,
    releaseYear: 2023,
    releaseSeason: 'SPRING' as const,
    episodeCount: 13,
    episodeDuration: 23,
    posterUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop',
    rating: 8.0,
    trendingScore: 82,
    isFeatured: true,
    genres: ['magical-girl', 'fantasy', 'romance'],
    tags: ['trending', 'shoujo'],
    sources: [{
      domain: 'www.youtube.com',
      url: 'https://www.youtube.com/playlist?list=PLsakurastorm',
      sourceName: 'YouTube Official',
      sourceType: 'youtube',
      isEmbeddable: true,
      language: 'sub',
      region: 'global',
    }],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, title: 'Storm Born', durationSeconds: 1380 },
      { episodeNumber: 2, seasonNumber: 1, title: 'Petal Shield', durationSeconds: 1380 },
      { episodeNumber: 3, seasonNumber: 1, title: 'Festival Night', durationSeconds: 1380 },
    ],
  },
  {
    title: 'Orbital Striker',
    slug: 'orbital-striker',
    titleEnglish: 'Orbital Striker',
    synopsis: 'Giant robots defend Earth from an alien superweapon threatening to detonate the Moon.',
    type: 'TV' as const,
    status: 'COMPLETED' as const,
    releaseYear: 2001,
    releaseSeason: 'FALL' as const,
    episodeCount: 52,
    episodeDuration: 24,
    posterUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&h=600&fit=crop',
    rating: 8.4,
    trendingScore: 70,
    genres: ['mecha', 'sci-fi', 'action'],
    tags: ['retro', 'mecha', 'dubbed'],
    sources: [{
      domain: 'tubitv.com',
      url: 'https://tubitv.com/series/000001/orbital-striker',
      sourceName: 'Tubi',
      sourceType: 'tubi',
      isEmbeddable: false,
      language: 'dub',
      region: 'US',
    }],
    episodes: [],
  },
  {
    title: 'Cafe Tengu',
    slug: 'cafe-tengu',
    titleEnglish: 'Cafe Tengu',
    synopsis: 'A cozy slice-of-life following a tengu spirit who runs a magical cafe in modern-day Kyoto.',
    type: 'TV' as const,
    status: 'COMPLETED' as const,
    releaseYear: 2023,
    releaseSeason: 'SUMMER' as const,
    episodeCount: 12,
    episodeDuration: 22,
    posterUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop',
    rating: 8.6,
    trendingScore: 78,
    isFeatured: true,
    genres: ['slice-of-life', 'comedy', 'fantasy'],
    tags: ['cozy', 'iyashikei'],
    sources: [{
      domain: 'www.youtube.com',
      url: 'https://www.youtube.com/playlist?list=PLcafetengu',
      sourceName: 'YouTube Official',
      sourceType: 'youtube',
      isEmbeddable: true,
      language: 'sub',
      region: 'global',
    }],
    episodes: [],
  },
  {
    title: 'Ramen Ronin',
    slug: 'ramen-ronin',
    titleEnglish: 'Ramen Ronin',
    synopsis: 'A wandering samurai finds peace in cooking ramen, but trouble always follows him to the next town.',
    type: 'TV' as const,
    status: 'COMPLETED' as const,
    releaseYear: 1998,
    episodeCount: 48,
    episodeDuration: 24,
    posterUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=1200&h=600&fit=crop',
    rating: 8.9,
    trendingScore: 65,
    genres: ['samurai', 'comedy', 'slice-of-life'],
    tags: ['retro', 'classic', 'cozy'],
    sources: [{
      domain: 'www.retrocrush.tv',
      url: 'https://www.retrocrush.tv/watch/ramen-ronin',
      sourceName: 'RetroCrush',
      sourceType: 'retrocrush',
      isEmbeddable: false,
      language: 'sub',
      region: 'global',
    }],
    episodes: [],
  },
  {
    title: 'Ghost Precinct',
    slug: 'ghost-precinct',
    titleEnglish: 'Ghost Precinct',
    synopsis: 'A detective agency staffed by spirits solves supernatural crimes in a city where ghosts walk among the living.',
    type: 'TV' as const,
    status: 'COMPLETED' as const,
    releaseYear: 2022,
    releaseSeason: 'FALL' as const,
    episodeCount: 24,
    episodeDuration: 25,
    posterUrl: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1200&h=600&fit=crop',
    rating: 8.3,
    trendingScore: 74,
    genres: ['mystery', 'supernatural', 'comedy'],
    tags: ['trending', 'detective'],
    sources: [{
      domain: 'www.youtube.com',
      url: 'https://www.youtube.com/playlist?list=PLghostprecinct',
      sourceName: 'YouTube Official',
      sourceType: 'youtube',
      isEmbeddable: true,
      language: 'sub',
      region: 'global',
    }],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, title: 'Cold Case', durationSeconds: 1500 },
      { episodeNumber: 2, seasonNumber: 1, title: 'The Haunting', durationSeconds: 1500 },
      { episodeNumber: 3, seasonNumber: 1, title: 'Spirit Evidence', durationSeconds: 1500 },
      { episodeNumber: 4, seasonNumber: 1, title: 'Phantom Witness', durationSeconds: 1500 },
    ],
  },
  {
    title: 'Thunder Fist',
    slug: 'thunder-fist',
    titleEnglish: 'Thunder Fist',
    synopsis: 'A street-level martial artist with electric powers rises through underground tournament brackets.',
    type: 'TV' as const,
    status: 'COMPLETED' as const,
    releaseYear: 2018,
    releaseSeason: 'WINTER' as const,
    episodeCount: 50,
    episodeDuration: 23,
    posterUrl: 'https://images.unsplash.com/photo-1555436169-f51a0cfe5e2c?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1555436169-f51a0cfe5e2c?w=1200&h=600&fit=crop',
    rating: 8.1,
    trendingScore: 72,
    genres: ['action', 'martial-arts', 'sports'],
    tags: ['shonen', 'tournament'],
    sources: [{
      domain: 'www.crunchyroll.com',
      url: 'https://www.crunchyroll.com/thunder-fist',
      sourceName: 'Crunchyroll',
      sourceType: 'crunchyroll',
      isEmbeddable: false,
      language: 'sub',
      region: 'global',
    }],
    episodes: [],
  },
  {
    title: 'Star Blazer X',
    slug: 'star-blazer-x',
    titleEnglish: 'Star Blazer X',
    titleJapanese: '宇宙戦艦X',
    synopsis: 'The heroic crew of a converted battleship races across the galaxy to save a dying Earth.',
    type: 'TV' as const,
    status: 'COMPLETED' as const,
    releaseYear: 1975,
    episodeCount: 26,
    episodeDuration: 25,
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop',
    rating: 9.0,
    trendingScore: 55,
    genres: ['sci-fi', 'action', 'drama'],
    tags: ['retro', 'classic', 'space-opera'],
    aliases: [{ alias: 'Space Battleship Yamato', language: 'en' }],
    sources: [{
      domain: 'www.retrocrush.tv',
      url: 'https://www.retrocrush.tv/watch/star-blazer-x',
      sourceName: 'RetroCrush',
      sourceType: 'retrocrush',
      isEmbeddable: false,
      language: 'dub',
      region: 'global',
    }],
    episodes: [],
  },
  {
    title: 'Eternal Gate',
    slug: 'eternal-gate',
    titleEnglish: 'Eternal Gate',
    synopsis: 'Two rival clans must unite to close a portal unleashing ancient demons across the mortal realm.',
    type: 'MOVIE' as const,
    status: 'COMPLETED' as const,
    releaseYear: 2021,
    releaseSeason: 'SUMMER' as const,
    episodeDuration: 95,
    posterUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    rating: 8.5,
    trendingScore: 80,
    isFeatured: true,
    genres: ['fantasy', 'action'],
    tags: ['movie', 'featured'],
    sources: [{
      domain: 'www.youtube.com',
      url: 'https://www.youtube.com/watch?v=eternalgate_official',
      sourceName: 'YouTube Official',
      sourceType: 'youtube',
      isEmbeddable: true,
      language: 'sub',
      region: 'global',
    }],
    episodes: [],
  },
];

// ─── Channels ─────────────────────────────────────────────────────────────────

const CHANNELS_DATA = [
  {
    slug: 'retro-mecha',
    name: 'Retro Mecha',
    description: 'Classic giant robot anime from the golden age — 70s through 90s mecha epics.',
    type: 'CURATED' as const,
    visibility: 'PUBLIC' as const,
    isFeatured: true,
    channelNumber: '101',
    artworkUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&h=400&fit=crop',
    animeSlugs: ['iron-heart-academy', 'orbital-striker', 'star-blazer-x'],
  },
  {
    slug: 'shonen-power-hour',
    name: 'Shonen Power Hour',
    description: 'Non-stop shonen action — tournaments, power-ups, and friendship speeches.',
    type: 'CURATED' as const,
    visibility: 'PUBLIC' as const,
    isFeatured: true,
    channelNumber: '102',
    artworkUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    animeSlugs: ['blade-of-eternity', 'thunder-fist', 'sakura-storm'],
  },
  {
    slug: 'cozy-slice-of-life',
    name: 'Cozy Slice of Life',
    description: 'Warm, soothing slice-of-life anime for a relaxing evening.',
    type: 'MOOD' as const,
    visibility: 'PUBLIC' as const,
    isFeatured: true,
    channelNumber: '103',
    artworkUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop',
    animeSlugs: ['cafe-tengu', 'ramen-ronin'],
  },
  {
    slug: 'late-night-cyberpunk',
    name: 'Late Night Cyberpunk',
    description: 'Neon-soaked dystopian futures and hacker thrillers for the midnight hour.',
    type: 'MOOD' as const,
    visibility: 'PUBLIC' as const,
    isFeatured: false,
    channelNumber: '104',
    artworkUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
    animeSlugs: ['neon-shibuya'],
  },
  {
    slug: 'fantasy-quest-tv',
    name: 'Fantasy Quest TV',
    description: 'Epic quests, magical kingdoms, and sword-and-sorcery adventures.',
    type: 'GENRE' as const,
    visibility: 'PUBLIC' as const,
    isFeatured: true,
    channelNumber: '105',
    artworkUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    animeSlugs: ['blade-of-eternity', 'eternal-gate', 'sakura-storm', 'cafe-tengu'],
  },
  {
    slug: 'anime-movies-weekend',
    name: 'Anime Movies Weekend',
    description: 'Feature films, OVAs, and movie specials — perfect for movie night.',
    type: 'CURATED' as const,
    visibility: 'PUBLIC' as const,
    isFeatured: false,
    channelNumber: '106',
    artworkUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=400&fit=crop',
    animeSlugs: ['eternal-gate'],
  },
  {
    slug: 'mystery-and-supernatural',
    name: 'Mystery & Supernatural',
    description: 'Detectives, ghosts, spirits, and things that go bump in the night.',
    type: 'GENRE' as const,
    visibility: 'PUBLIC' as const,
    isFeatured: false,
    channelNumber: '107',
    artworkUrl: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=600&h=400&fit=crop',
    animeSlugs: ['ghost-precinct'],
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding database…');

  // 1. Allowed domains
  console.log('  → Seeding allowed domains…');
  for (const d of ALLOWED_DOMAINS) {
    await db.allowedDomain.upsert({
      where: { domain: d.domain },
      create: d,
      update: d,
    });
  }

  // 2. Genres
  console.log('  → Seeding genres…');
  for (const slug of GENRES) {
    const name = slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
    await db.genre.upsert({
      where: { slug },
      create: { slug, name },
      update: {},
    });
  }

  // 3. Admin user (dev only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('  → Seeding dev admin user (admin@otakuchannels.local / Admin1234)…');
    const pw = await argon2.hash('Admin1234', { type: argon2.argon2id });
    await db.user.upsert({
      where: { email: 'admin@otakuchannels.local' },
      create: {
        email: 'admin@otakuchannels.local',
        username: 'admin',
        passwordHash: pw,
        role: 'ADMIN',
        isVerified: true,
        profile: { create: {} },
      },
      update: {},
    });
  }

  // 4. Anime
  console.log('  → Seeding anime titles…');
  const animeIdMap: Record<string, string> = {};

  for (const a of ANIME_DATA) {
    const { genres, tags, sources, episodes, aliases, ...animeFields } = a as any;

    const anime = await db.animeTitle.upsert({
      where: { slug: animeFields.slug },
      create: {
        ...animeFields,
        genres: {
          create: await resolveGenreLinks(genres),
        },
        tags: {
          create: await resolveTagLinks(tags),
        },
        aliases: aliases ? { create: aliases } : undefined,
      },
      update: {
        ...animeFields,
      },
    });
    animeIdMap[animeFields.slug] = anime.id;

    // Sources
    for (const src of sources) {
      await db.contentSource.upsert({
        where: { id: `${anime.id}-${src.sourceType}` },
        create: { ...src, animeId: anime.id, status: 'ACTIVE' },
        update: { url: src.url, status: 'ACTIVE' },
      }).catch(async () => {
        // upsert by composite not available — just create if missing
        const existing = await db.contentSource.findFirst({
          where: { animeId: anime.id, sourceType: src.sourceType },
        });
        if (!existing) {
          await db.contentSource.create({ data: { ...src, animeId: anime.id, status: 'ACTIVE' } });
        }
      });
    }

    // Episodes
    for (const ep of episodes) {
      await db.episode.upsert({
        where: { animeId_seasonNumber_episodeNumber: { animeId: anime.id, seasonNumber: ep.seasonNumber, episodeNumber: ep.episodeNumber } },
        create: { ...ep, animeId: anime.id },
        update: { title: ep.title },
      });
    }
  }

  // 5. Channels
  console.log('  → Seeding channels…');
  for (const ch of CHANNELS_DATA) {
    const { animeSlugs, ...channelFields } = ch;

    const channel = await db.channel.upsert({
      where: { slug: channelFields.slug },
      create: channelFields,
      update: channelFields,
    });

    // Program blocks
    await db.channelProgramBlock.deleteMany({ where: { channelId: channel.id } });
    for (let i = 0; i < animeSlugs.length; i++) {
      const animeId = animeIdMap[animeSlugs[i]];
      if (!animeId) continue;
      await db.channelProgramBlock.create({
        data: { channelId: channel.id, animeId, position: i },
      });
    }

    // Simple schedule: each anime gets a 24-min rotating slot
    await db.channelSchedule.deleteMany({ where: { channelId: channel.id } });
    for (let i = 0; i < animeSlugs.length; i++) {
      const animeId = animeIdMap[animeSlugs[i]];
      if (!animeId) continue;
      await db.channelSchedule.create({
        data: { channelId: channel.id, slotIndex: i, animeId, durationSec: 1440, label: `Slot ${i + 1}` },
      });
    }
  }

  console.log('✅ Seed complete.');
}

async function resolveGenreLinks(slugs: string[]) {
  const links = [];
  for (const slug of slugs) {
    const genre = await db.genre.findUnique({ where: { slug } });
    if (genre) links.push({ genreId: genre.id });
  }
  return links;
}

async function resolveTagLinks(slugs: string[]) {
  const links = [];
  for (const slug of slugs) {
    const tag = await db.tag.upsert({
      where: { slug },
      create: { slug, name: slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') },
      update: {},
    });
    links.push({ tagId: tag.id });
  }
  return links;
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
