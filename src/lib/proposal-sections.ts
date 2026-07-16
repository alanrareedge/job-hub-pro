export const proposalSectionConfigs = {
  understanding: {
    field: "section_understanding",
    title: "Understanding Your Project",
    question: "What do you believe the customer is trying to achieve?",
  },
  recommendation: {
    field: "section_recommendation",
    title: "Our Recommendation",
    question: "What do you recommend and why?",
  },
  scope: {
    field: "section_scope",
    title: "Scope of Work",
    question: "Exactly what is included?",
  },
  assumptions: {
    field: "section_assumptions",
    title: "Assumptions",
    question: "What are you assuming to be true?",
  },
  exclusions: {
    field: "section_exclusions",
    title: "Exclusions",
    question: "What is deliberately not included?",
  },
  "next-steps": {
    field: "section_next_steps",
    title: "What Happens Next",
    question: "What should the customer do next?",
  },
} as const;

export type ProposalSectionSlug = keyof typeof proposalSectionConfigs;
export type ProposalSectionField =
  (typeof proposalSectionConfigs)[ProposalSectionSlug]["field"];

export const proposalSectionList = Object.entries(proposalSectionConfigs).map(
  ([slug, config]) => ({
    slug: slug as ProposalSectionSlug,
    ...config,
  }),
);

export function getProposalSectionConfig(section: string) {
  if (section in proposalSectionConfigs) {
    return proposalSectionConfigs[section as ProposalSectionSlug];
  }

  return null;
}
