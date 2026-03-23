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
  const res = await fetch(`${STRAPI_URL}/api/artists?filters[slug][$eq]=${slug}&populate=profileImage,backgroundImage,socialMediaLinks,projects.cover`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch artist');
  const json = await res.json();
  const item = json.data?.[0];
  if (!item) return { artist: null, projects: [] };
  const attrs = item.attributes;
  const artist = {
    _id: String(item.id),
    _createdAt: attrs.createdAt,
    name: attrs.name,
    slug: attrs.slug,
    signature: attrs.signature,
    spotifyEmbedUrl: attrs.spotifyEmbedUrl || undefined,
    about: attrs.about || undefined,
    profileImage: resolveUrl(attrs.profileImage?.data?.attributes?.url),
    backgroundImage: attrs.backgroundImage?.data?.attributes?.url
      ? resolveUrl(attrs.backgroundImage.data.attributes.url) : undefined,
    socialMediaLinks: attrs.socialMediaLinks || [],
  };
  const projects = (attrs.projects?.data || []).map((p: any) => ({
    _id: String(p.id),
    name: p.attributes.name,
    type: p.attributes.type,
    url: p.attributes.url,
    releaseYear: p.attributes.releaseYear,
    coverImageUrl: resolveUrl(p.attributes.cover?.data?.attributes?.url),
  }));
  return { artist, projects };
}

export async function getAllArtistsWithFeaturedProjects() {
  try {
    const [artistsRes, projectsRes] = await Promise.all([
      fetch(`${STRAPI_URL}/api/artists?populate=profileImage,backgroundImage&sort=orderRank:asc`, { cache: 'no-store' }),
      fetch(`${STRAPI_URL}/api/projects?populate=cover,artist&sort=createdAt:desc&pagination[limit]=3`, { cache: 'no-store' })
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
      artist: item.attributes.artist?.data?.attributes?.name || '',
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
      fetch(`${STRAPI_URL}/api/projects?populate=cover,artist&sort=createdAt:desc&pagination[limit]=6`, { cache: 'no-store' }),
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
    const featuredProjects = (projectsJson.data || []).map((item: any) => ({
      _id: String(item.id),
      name: item.attributes.name,
      type: item.attributes.type || 'Album',
      url: item.attributes.url || '#',
      releaseYear: item.attributes.releaseYear || new Date().getFullYear(),
      coverImageUrl: resolveUrl(item.attributes.cover?.data?.attributes?.url),
      artist: item.attributes.artist?.data?.attributes?.name || '',
    }));
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
