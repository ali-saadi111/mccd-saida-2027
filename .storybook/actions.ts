// Storybook runs without a Next server. These validation-only replacements
// use the same schemas and deliberately have no persistence or sending.
import { submissionSchema, contactSchema } from '../src/lib/schemas/submission';
export async function validateSubmissionAction(input: unknown) {
  const result = submissionSchema.safeParse(input);
  return {
    valid: result.success,
    errors: result.success
      ? []
      : result.error.issues.map((i) => ({ field: i.path[0], key: i.message })),
  };
}
export async function contactAction(input: unknown) {
  return { valid: contactSchema.safeParse(input).success, sent: false };
}
