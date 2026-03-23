import { PortableTextBlock } from "sanity";

export type SocialMediaLink = {
  name: string;
  url: string;
};

export type Artist = {
  _id: string;
  _createdAt: string;
  artistType?: "roster" | "affiliate" | "spotlight";
  name: string;
  slug?: string;
  profileImage: string;
  backgroundImage?: string;
  signature: string;
  spotifyEmbedUrl?: string;
  about?: PortableTextBlock[];
  socialMediaLinks?: SocialMediaLink[]; // New field added here
};
