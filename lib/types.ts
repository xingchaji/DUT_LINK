export type Skill = {
  name: string;
  score: number;
  category: "技术" | "创意" | "协作" | "探索";
  confidence?: number;
  evidence?: string[];
};

export type ProfileInput = {
  name: string;
  major: string;
  grade: string;
  bio: string;
  experiences: string;
  interests: string;
  awards: string;
  achievements: string;
  githubRepos: string;
};

export type GeneratedProfile = {
  summary: string;
  skills: Skill[];
  interests: string[];
  potentialDirections: string[];
  analysisMode?: "ai" | "rules";
  evidenceCount?: number;
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
  scoreBreakdown?: {
    complementarity: number;
    sharedInterests: number;
    crossDiscipline: number;
  };
};

export type Opportunity = {
  id: string;
  title: string;
  organizer: string;
  type: "竞赛" | "项目" | "社区";
  status: string;
  deadline: string;
  fit: number;
  description: string;
  tags: string[];
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
  bonusPolicy: string;
  accent: string;
  matchReasons?: string[];
};

export type RecruitmentPost = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  teamName: string;
  ownerName: string;
  description: string;
  neededSkills: string[];
  currentSize: number;
  capacity: number;
  contact: string;
  createdAt: string;
  applicants: number;
};

export type Discovery = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bridge: string;
  readTime: string;
  why: string;
  sources: Array<{ title: string; url: string; type: "论文" | "文章" | "视频" }>;
};

export type CommunityArticle = {
  id: string;
  title: string;
  summary: string;
  authorName: string;
  authorMajor: string;
  bridge: string;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  major: string;
};
