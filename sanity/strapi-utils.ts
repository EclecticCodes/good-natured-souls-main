const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// If the URL is already absolute (Cloudinary), return as-is. Otherwise prepend STRAPI_URL.
function resolveUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${STRAPI_URL}${url}`;
}

export async function getArtists() {
  const res = await fetch(`${STRAPI_URL}/api/artists?populate=profileImage,backgroundImage,socialMediaLinks`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch artists');
  const json = await res.json();
  return json.data.map((item: any) => ({
    _id: String(item.id),
    _createdAt: item.attributes.createdAt,
    name: item.attributes.name,
    slug: item.attributes.slug,
    signature: item.attributes.signature,
    profileImage: resolveUrl(item.attributes.profileImage?.data?.attributes?.url),
    backgroundImage: item.attributes.backgroundImage?.data?.attributes?.url
      ? resolveUrl(item.attributes.backgroundImage.data.attributes.url) : undefined,
  }));
}

export async function getArtistWithProjects(slug: string) {
  const populate = [
    'profileImage',
    'backgroundImage',
    'socialMediaLinks',
    'projects.cover',
    'musicVideos.thumbnail',
    'epk.pressPhotos',
    'HighlightArticles.coverImage',
  ].join(',');

  const res = await fetch(
    `${STRAPI_URL}/api/artists?filters[slug][$eq]=${slug}&populate=${populate}`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to fetch artist');
  const json = await res.json();
  const item = json.data?.[0];
  if (!item) return { artist: null, projects: [] };
  const attrs = item.attributes;

  // Fetch full project details separately to get all fields
  const projectIds = (attrs.projects?.data || []).map((p: any) => p.id);
  let projects: any[] = [];
  if (projectIds.length > 0) {
    try {
      const projectsRes = await fetch(
        `${STRAPI_URL}/api/projects?filters[id][$in]=${projectIds.join(',')}&populate=cover&sort=releaseYear:desc`,
        { cache: 'no-store' }
      );
      if (projectsRes.ok) {
        const projectsJson = await projectsRes.json();
        projects = (projectsJson.data || []).map((p: any) => ({
          _id: String(p.id),
          name: p.attributes.name || '',
          type: p.attributes.type || 'Album',
          url: p.attributes.url || '#',
          releaseYear: p.attributes.releaseYear || '',
          coverImageUrl: resolveUrl(p.attributes.cover?.data?.attributes?.url),
        }));
      }
    } catch {}
  }

  // Parse about rich text safely
  const aboutText = (() => {
    if (!attrs.about) return undefined;
    if (typeof attrs.about === 'string') return attrs.about;
    if (Array.isArray(attrs.about)) {
      return attrs.about.map((block: any) => {
        if (block.children) return block.children.map((c: any) => c.text || '').join('');
        if (block.text) return block.text;
        return '';
      }).filter(Boolean).join('\n\n');
    }
    return undefined;
  })();

  // Music videos
  const musicVideos = (attrs.musicVideos || []).map((v: any) => ({
    title: v.title || '',
    videoUrl: v.videoUrl || '',
    platform: v.platform || 'youtube',
    description: v.Description || '',
    thumbnailUrl: resolveUrl(v.thumbnail?.data?.attributes?.url),
  }));

  // EPK
  const epk = attrs.epk ? {
    bio: attrs.epk.bio || '',
    pressQuote: attrs.epk.pressQuote || '',
    pressQuoteSource: attrs.epk.pressQuoteSource || '',
    genre: attrs.epk.genre || '',
    location: attrs.epk.location || '',
    bookingEmail: attrs.epk.bookingEmail || '',
    pressEmail: attrs.epk.pressEmail || '',
    website: attrs.epk.website || '',
    pressPhotos: (attrs.epk.pressPhotos?.data || []).map((p: any) => resolveUrl(p.attributes?.url)),
  } : null;

  // Highlight articles
  const highlightArticles = (attrs.HighlightArticles || []).map((a: any) => ({
    title: a.title || '',
    url: a.url || '',
    publication: a.publication || '',
    coverImage: resolveUrl(a.coverImage?.data?.attributes?.url),
  }));

  const artist = {
    _id: String(item.id),
    _createdAt: attrs.createdAt,
    name: attrs.name || '',
    slug: attrs.slug || slug,
    signature: attrs.signature || '',
    spotifyEmbedUrl: attrs.spotifyEmbedUrl || undefined,
    soundcloudUrl: attrs.soundcloudUrl || undefined,
    bandcampUrl: attrs.bandcampUrl || undefined,
    appleMusicUrl: attrs.appleMusicUrl || undefined,
    mp3Url: attrs.mp3Url || undefined,
    bandsintownUrl: attrs.bandsintownUrl || undefined,
    soundkickUrl: attrs.soundkickUrl || undefined,
    about: aboutText,
    profileImage: resolveUrl(attrs.profileImage?.data?.attributes?.url),
    backgroundImage: attrs.backgroundImage?.data?.attributes?.url
      ? resolveUrl(attrs.backgroundImage.data.attributes.url) : undefined,
    socialMediaLinks: (attrs.socialMediaLinks || []).filter((l: any) => l.url),
    musicVideos,
    epk,
    highlightArticles,
    artistType: attrs.artistType || '',
  };

  return { artist, projects };
}

export async function getAllArtistsWithFeaturedProjects() {
  try {
    const [artistsRes, projectsRes] = await Promise.all([
      fetch(`${STRAPI_URL}/api/artists?populate=profileImage,backgroundImage&sort=orderRank:asc`, { cache: 'no-store' }),
      fetch(`${STRAPI_URL}/api/projects?populate=cover,artists&sort=createdAt:desc&pagination[limit]=3`, { cache: 'no-store' })
    ]);
    const artistsJson = await artistsRes.json();
    const projectsJson = await projectsRes.json();
    const artists = (artistsJson.data || []).map((item: any) => ({
      _id: String(item.id),
      _createdAt: item.attributes.createdAt,
      name: item.attributes.name,
      slug: item.attributes.slug,
      signature: item.attributes.signature,
      profileImage: resolveUrl(item.attributes.profileImage?.data?.attributes?.url),
      backgroundImage: item.attributes.backgroundImage?.data?.attributes?.url
        ? resolveUrl(item.attributes.backgroundImage.data.attributes.url) : undefined,
    }));
    const featuredProjects = (projectsJson.data || []).map((item: any) => ({
      _id: String(item.id),
      _createdAt: item.attributes.createdAt,
      name: item.attributes.name,
      type: item.attributes.type,
      url: item.attributes.url,
      releaseYear: item.attributes.releaseYear,
      coverImageUrl: resolveUrl(item.attributes.cover?.data?.attributes?.url),
      artist: item.attributes.artists?.data?.[0]?.attributes?.name || '',
    }));
    return { artists, featuredProjects };
  } catch {
    return { artists: [], featuredProjects: [] };
  }
}

export async function getHomePageData() {
  try {
    const [artistsRes, projectsRes, mainRes] = await Promise.all([
      fetch(`${STRAPI_URL}/api/artists?populate=profileImage,backgroundImage&sort=orderRank:asc`, { cache: 'no-store' }),
      fetch(`${STRAPI_URL}/api/projects?populate=cover,artists&sort=releaseYear:desc,createdAt:desc&pagination[limit]=20`, { cache: 'no-store' }),
      fetch(`${STRAPI_URL}/api/mains?populate=jumbotronImages&pagination[limit]=1`, { cache: 'no-store' }),
    ]);
    const artistsJson = artistsRes.ok ? await artistsRes.json() : { data: [] };
    const projectsJson = projectsRes.ok ? await projectsRes.json() : { data: [] };
    const mainJson = mainRes.ok ? await mainRes.json() : { data: [] };
    const artists = (artistsJson.data || []).map((item: any) => ({
      _id: String(item.id),
      name: item.attributes.name,
      slug: item.attributes.slug,
      signature: item.attributes.signature || '',
      profileImage: resolveUrl(item.attributes.profileImage?.data?.attributes?.url),
      backgroundImage: item.attributes.backgroundImage?.data?.attributes?.url
        ? resolveUrl(item.attributes.backgroundImage.data.attributes.url) : undefined,
    }));
    // Cap at 2 projects per artist, sorted by releaseYear desc
    const allProjects = (projectsJson.data || []).map((item: any) => ({
      _id: String(item.id),
      name: item.attributes.name,
      type: item.attributes.type || 'Album',
      url: item.attributes.url || '#',
      releaseYear: item.attributes.releaseYear || new Date().getFullYear(),
      coverImageUrl: resolveUrl(item.attributes.cover?.data?.attributes?.url),
      artist: item.attributes.artists?.data?.[0]?.attributes?.name || '',
      artistSlug: item.attributes.artists?.data?.[0]?.attributes?.slug || '',
    }));
    const artistCount: Record<string, number> = {};
    const featuredProjects = allProjects.filter((p: any) => {
      // Exclude projects with no artist relation from featured
      if (!p.artist) return false;
      const key = p.artist;
      artistCount[key] = (artistCount[key] || 0) + 1;
      return artistCount[key] <= 2;
    });
    const mainData = mainJson.data?.[0]?.attributes || null;
    const jumbotronImages = (mainData?.jumbotronImages?.data || []).map((img: any) =>
      resolveUrl(img.attributes.url)
    );
    const youtubeVideoIds = mainData?.youtubeVideoIds
      ? mainData.youtubeVideoIds.split(',').map((id: string) => id.trim()).filter(Boolean)
      : [];
    return {
      artists,
      featuredProjects,
      jumbotronImages,
      youtubeVideoIds,
      marqueeText: mainData?.marqueeText || null,
      bio: mainData?.bio || null,
      heroHeadline: mainData?.heroHeadline || null,
      heroTagline: mainData?.heroTagline || null,
    };
  } catch {
    return {
      artists: [],
      featuredProjects: [],
      jumbotronImages: [],
      youtubeVideoIds: [],
      marqueeText: null,
      bio: null,
      heroHeadline: null,
      heroTagline: null,
    };
  }
}

export async function getProducts() {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/products?populate=images,artist,tracks&sort=orderRank:asc&filters[status][$ne]=archived`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map((item: any) => {
      const attrs = item.attributes;
      const images = (attrs.images?.data || []).map((img: any) => resolveUrl(img.attributes.url));
      return {
        id: String(item.id),
        name: attrs.name || '',
        slug: attrs.slug || String(item.id),
        description: attrs.description || '',
        price: attrs.price || 0,
        comparePrice: attrs.comparePrice || null,
        category: attrs.category || 'digital',
        status: attrs.status || 'available',
        releaseDate: attrs.releaseDate || null,
        stock: attrs.stock || 0,
        unlimited: attrs.unlimited || false,
        featured: attrs.featured || false,
        coverImage: images[0] || '',
        images,
        artist: attrs.artist?.data?.attributes?.name || '',
        artistSlug: attrs.artist?.data?.attributes?.slug || '',
        spotifyUrl: attrs.spotifyUrl || null,
        appleMusicUrl: attrs.appleMusicUrl || null,
        youtubeUrl: attrs.youtubeUrl || null,
        soundcloudUrl: attrs.soundcloudUrl || null,
        bandcampUrl: attrs.bandcampUrl || null,
        tidalUrl: attrs.tidalUrl || null,
        amazonUrl: attrs.amazonUrl || null,
        deezerUrl: attrs.deezerUrl || null,
        mp3Url: attrs.mp3Url || null,
        sizes: attrs.sizes ? attrs.sizes.split(',').map((s: string) => s.trim()) : [],
        colors: attrs.colors ? attrs.colors.split(',').map((c: string) => c.trim()) : [],
        tracks: (attrs.tracks || []).map((t: any) => ({
          num: t.trackNumber || t.num,
          name: t.title || t.name,
          dur: t.duration || t.dur,
          featuring: t.featuring || null,
        })),
      };
    });
  } catch {
    return [];
  }
}
