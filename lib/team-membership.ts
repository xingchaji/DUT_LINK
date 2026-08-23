import { store } from "@/lib/store";

export function findCompetitionMembership(userId: string, opportunityId: string) {
  const owned = store.recruitments.find((post) => post.opportunityId === opportunityId && post.ownerId === userId);
  if (owned) return { recruitment: owned, role: "captain" as const };
  const memberOf = store.recruitments.find((post) => post.opportunityId === opportunityId && post.members.some((member) => member.userId === userId));
  if (memberOf) return { recruitment: memberOf, role: "member" as const };
  const accepted = store.applications.find((application) => {
    if (application.applicantId !== userId || application.status !== "accepted") return false;
    return store.recruitments.find((post) => post.id === application.recruitmentId)?.opportunityId === opportunityId;
  });
  if (!accepted) return null;
  return { recruitment: store.recruitments.find((post) => post.id === accepted.recruitmentId)!, role: "member" as const };
}
