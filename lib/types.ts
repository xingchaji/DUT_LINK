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

export type QuestionnaireDimension = "问题解决" | "调研表达" | "竞赛经验" | "项目交付";

export type QuestionnaireInput = {
  name: string;
  major: string;
  grade: string;
  answers: Record<string, number>;
  interests: string[];
  evidence?: string;
};

export type GeneratedProfile = {
  summary: string;
  skills: Skill[];
  interests: string[];
  potentialDirections: string[];
  analysisMode?: "ai" | "rules" | "questionnaire" | "questionnaire-ai";
  evidenceCount?: number;
};

export type PersonMatch = {
  id: string;
  name: string;
  major: string;
  grade: string;
  avatar: string;
  match: number;
  tags: string[];
  reason: string;
  status: string;
  interestedOpportunityIds?: string[];
  scoreBreakdown?: {
    complementarity: number;
    sharedInterests: number;
    crossDiscipline: number;
  };
};

export type PersonProfile = PersonMatch & {
  bio: string;
  contact: string;
  availability: string;
  portfolio?: string;
};

export type RecruitmentCandidateProfile = PersonProfile & {
  abilityProfile?: GeneratedProfile | null;
};

export type AISettingsView = {
  enabled: boolean;
  hasApiKey: boolean;
  keyHint: string | null;
  baseUrl: string;
  model: string;
};

export type TeamMemberSummary = {
  userId: string;
  name: string;
  major: string;
  grade: string;
  skills: string[];
};

export type Opportunity = {
  id: string;
  title: string;
  organizer: string;
  type: "学术竞赛" | "体育比赛" | "文艺比赛" | "创新创业" | "项目" | "社区";
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
  registrationStart?: string | null;
  registrationEnd?: string | null;
  eventDate?: string | null;
  scope?: "全国" | "校内" | "社区";
  verification?: "official" | "campus-verified" | "pending" | "rejected";
  publisherId?: string | null;
  publisherName?: string;
};

export type RecruitmentPost = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  teamName: string;
  ownerName: string;
  ownerId: string;
  description: string;
  projectDirection?: string;
  expectedAvailability?: string;
  requirements: string;
  neededSkills: string[];
  currentSize: number;
  capacity: number;
  contact: string;
  members: TeamMemberSummary[];
  recruitmentDeadline: string;
  createdAt: string;
  applicants: number;
};

export type UserAccountProfile = {
  userId: string;
  nickname: string;
  email: string;
  major: string;
  grade: string;
  contact: string;
  bio: string;
  skills: string[];
  updatedAt: string;
};

export type OpportunityInterest = {
  userId: string;
  opportunityId: string;
  createdAt: string;
};

export type TeamInvitation = {
  id: string;
  recruitmentId: string;
  opportunityId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

export type RecruitmentApplication = {
  id: string;
  recruitmentId: string;
  applicantId: string;
  applicantName: string;
  applicantMajor: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

export type Discovery = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bridge: string;
  readTime: string;
  why: string;
  generationMode?: "ai" | "curated";
  sources: Array<{ title: string; url: string; type: "论文" | "文章" | "视频" }>;
};

export type WinningWorkInsight = {
  id: string;
  competitionId: string;
  competitionTitle: string;
  workTitle: string;
  award: string;
  year: number | null;
  school: string;
  introduction: string;
  relevanceReason: string;
  articleSections: Array<{ heading: string; body: string }>;
  knowledgeDomains: Array<{ name: string; role: string; integration: string }>;
  crossDisciplinaryValue: string;
  takeaways: string[];
  recommendedFor: string;
  mode: "ai" | "curated";
  source: { title: string; url: string; publisher: string };
};

export type CommunityArticle = {
  id: string;
  title: string;
  summary: string;
  authorName: string;
  authorMajor: string;
  bridge: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  major: string;
  role: "student" | "admin";
};

export type Notification = {
  id: string;
  userId: string;
  type: "application_received" | "application_accepted" | "application_rejected" | "invitation_received" | "invitation_accepted" | "invitation_rejected" | "opportunity_approved" | "opportunity_rejected" | "article_approved" | "article_rejected";
  title: string;
  body: string;
  relatedId: string;
  read: boolean;
  createdAt: string;
};
