export type Skill = {
  name: string;
  score: number;
  category: "技术" | "创意" | "协作" | "探索";
};

export type ProfileInput = {
  name: string;
  major: string;
  grade: string;
  bio: string;
  experiences: string;
  interests: string;
};

export type GeneratedProfile = {
  summary: string;
  skills: Skill[];
  interests: string[];
  potentialDirections: string[];
};

export type PersonMatch = {
  id: string;
  name: string;
  major: string;
  avatar: string;
  match: number;
  tags: string[];
  reason: string;
  status: string;
};

