import { z } from 'zod/v4';
import { categories, audiences } from '@/lib/data/types';
export const submissionSchema = z.object({
  title: z.string().trim().min(5, 'title').max(150, 'title'),
  description: z
    .string()
    .trim()
    .min(30, 'description')
    .max(3000, 'description'),
  category: z.enum(categories, { error: 'category' }),
  audience: z.array(z.enum(audiences)).min(1, 'audience'),
  attendance: z
    .number({ error: 'attendance' })
    .int('attendance')
    .min(1, 'attendance')
    .max(100000, 'attendance'),
  accessibility: z.string().max(2000),
  language: z.array(z.string()).min(1, 'language'),
  entry: z.enum(['free', 'ticketed']),
  website: z
    .string()
    .refine((v) => !v || /^https?:\/\/[^\s]+$/i.test(v), 'url'),
  venue_id: z.enum(['sea', 'khan', 'palace', 'square'], { error: 'venue' }),
  date: z
    .string()
    .refine(
      (v) =>
        /^2027-\d{2}-\d{2}$/.test(v) &&
        !isNaN(Date.parse(v)) &&
        new Date(v).toISOString().slice(0, 10) === v,
      'date',
    ),
  slot: z.enum(['morning', 'afternoon', 'evening', 'whole-day'], {
    error: 'slot',
  }),
  name: z.string().trim().min(2, 'name'),
  organisation: z.string().trim().min(2, 'organisation'),
  email: z.email({ error: 'email' }),
  phone: z
    .string()
    .refine(
      (v) =>
        /^[+\d\s()-]+$/.test(v) &&
        v.replace(/\D/g, '').length >= 7 &&
        v.replace(/\D/g, '').length <= 15,
      'phone',
    ),
  consent: z.boolean().refine((v) => v, 'consent'),
});
export type Submission = z.infer<typeof submissionSchema>;
export const defaultSubmission: Submission = {
  title: '',
  description: '',
  category: 'music',
  audience: ['everyone'],
  attendance: 50,
  accessibility: '',
  language: ['ar'],
  entry: 'free',
  website: '',
  venue_id: 'sea',
  date: '',
  slot: 'evening',
  name: '',
  organisation: '',
  email: '',
  phone: '',
  consent: false,
};
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'name'),
  email: z.email({ error: 'email' }),
  topic: z.enum(['proposals', 'partnerships', 'general'], { error: 'topic' }),
  message: z.string().trim().min(20, 'message').max(5000, 'message'),
});
export type ContactInput = z.infer<typeof contactSchema>;
