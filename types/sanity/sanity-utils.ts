// fill out later
import { groq } from "next-sanity";
import client from "./sanity-client";
import { Artist } from "@/types/Artist";
import { Project } from "@/types/Project";

const revalidate = 10;

export async function getArtists(): Promise<Artist[]> {
  const query = groq`*[_type == "artist"]{
      _id,
      _createdAt, 
      "slug": slug.current,
      name,
      signature,
      "profileImage": profileImage.asset->url,
  }`;

  const artists = await client.fetch(query, {}, { next: { revalidate } });
  console.log("Fetched projects:", artists); // Log fetched artists
  return artists;
}

export async function getArtistWithProjects(slug: string): Promise<{
  artist: Artist | null;
  projects: Project[];
}> {
  const query = groq`
    *[_type == "artist" && slug.current == $slug][0] {
      _id,
      _createdAt,
      name,
      about,
      spotifyEmbedUrl,
      "profileImage": profileImage.asset->url,
      "backgroundImage": backgroundImage.asset->url,
      signature,
      socialMediaLinks[]{
        name,
        url
      },
      "projects": *[_type == "project" && (artist._ref == ^._id || ^._id in featured[]._ref)] | order(_createdAt asc)[0...3]{
        _id,
        _createdAt,
        name,
        type,
        url,
        releaseYear,
        "coverImageUrl": cover.asset->url,
        "artist": artist->name,
        "featuredArtists": featured[]->name
      }
    }
  `;

  const result = await client.fetch(query, { slug });

  // Extract artist and projects from the result
  const artist = result || null;
  const projects = artist?.projects || [];

  console.log("Fetched artist:", artist);

  return { artist, projects };
}

export async function getAllArtistsWithFeaturedProjects() {
  const query = groq`
    {
      "artists": *[_type == "artist"] {
         _id,
        _createdAt, 
        "slug": slug.current,
        name,
        signature,
        "profileImage": profileImage.asset->url,
      },
      "featuredProjects": *[_type == "project"] | order(_createdAt desc) [0...3]{
        _id,
        _createdAt,
        name,
        type,
        url,
        releaseYear,
        "coverImageUrl": cover.asset->url,
        "artist": artist->name,
        "featuredArtists": featured[]->name
      }
    }`;
  const result = await client.fetch(query);
  console.log("Fetched artists and featured projects:", result);

  return result;
}
