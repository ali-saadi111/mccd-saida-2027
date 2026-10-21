'use server';
import { submissionSchema, contactSchema } from './schemas/submission';
/** Validation boundary only. Deliberately no database, authentication, upload or email. */
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
