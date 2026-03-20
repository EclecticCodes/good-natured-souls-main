const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

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
    profileImage: item.attributes.profileImage?.data?.attributes?.url ? `${STRAPI_URL}${item.attributes.profileImage.data.attributes.url}` : '',
    backgroundImage: item.attributes.backgroundImage?.data?.attributes?.url ? `${STRAPI_URL}${item.attributes.backgroundImage.data.attributes.url}` : undefined,
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
    profileImage: attrs.profileImage?.data?.attributes?.url ? `${STRAPI_URL}${attrs.profileImage.data.attributes.url}` : '',
    backgroundImage: attrs.backgroundImage?.data?.attributes?.url ? `${STRAPI_URL}${attrs.backgroundImage.data.attributes.url}` : undefined,
    socialMediaLinks: attrs.socialMediaLinks || [],
  };

  const projects = (attrs.projects?.data || []).map((p: any) => ({
    _id: String(p.id),
    name: p.attributes.name,
    type: p.attributes.type,
    url: p.attributes.url,
    releaseYear: p.attributes.releaseYear,
    coverImageUrl: p.attributes.cover?.data?.attributes?.url ? `${STRAPI_URL}${p.attributes.cover.data.attributes.url}` : '',
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
    profileImage: item.attributes.profileImage?.data?.attributes?.url ? `${STRAPI_URL}${item.attributes.profileImage.data.attributes.url}` : '',
    backgroundImage: item.attributes.backgroundImage?.data?.attributes?.url ? `${STRAPI_URL}${item.attributes.backgroundImage.data.attributes.url}` : undefined,
  }));

  const featuredProjects = (projectsJson.data || []).map((item: any) => ({
    _id: String(item.id),
    _createdAt: item.attributes.createdAt,
    name: item.attributes.name,
    type: item.attributes.type,
    url: item.attributes.url,
    releaseYear: item.attributes.releaseYear,
    coverImageUrl: item.attributes.cover?.data?.attributes?.url ? `${STRAPI_URL}${item.attributes.cover.data.attributes.url}` : '',
    artist: item.attributes.artist?.data?.attributes?.name || '',
  }));

  return { artists, featuredProjects };
  } catch { return { artists: [], featuredProjects: [] }; }
}
