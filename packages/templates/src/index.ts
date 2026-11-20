import type { TemplateDefinition } from '@lywuai/shared';
import { businessTemplate } from './templates/business';
import { portfolioTemplate } from './templates/portfolio';
import { restaurantTemplate } from './templates/restaurant';
import { agencyTemplate } from './templates/agency';
import { salonTemplate } from './templates/salon';
import { medicalTemplate } from './templates/medical';
import { fitnessTemplate } from './templates/fitness';
import { lawyerTemplate } from './templates/lawyer';
import { tutorTemplate } from './templates/tutor';
import { freelancerTemplate } from './templates/freelancer';

export * from './utils';
export * from './templates/business';
export * from './templates/portfolio';
export * from './templates/restaurant';
export * from './templates/agency';
export * from './templates/salon';
export * from './templates/medical';
export * from './templates/fitness';
export * from './templates/lawyer';
export * from './templates/tutor';
export * from './templates/freelancer';

export const templates: TemplateDefinition[] = [
  businessTemplate,
  portfolioTemplate,
  restaurantTemplate,
  agencyTemplate,
  salonTemplate,
  medicalTemplate,
  fitnessTemplate,
  lawyerTemplate,
  tutorTemplate,
  freelancerTemplate,
];

export function getTemplate(id: string): TemplateDefinition {
  const match = templates.find((t) => t.id === id);
  return match || businessTemplate;
}
