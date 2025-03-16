export type Project = {
  _id: string;
  _createdAt: string;
  name: string;
  type: string;
  url: string;
  releaseYear: number;
  coverImageUrl: string;
  artist: string;
  featuredArtists?: string[];
};
