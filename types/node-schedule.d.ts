declare module 'node-schedule' {
  export interface Job {
    cancel(): boolean;
    reschedule(spec: string | Date | RecurrenceRule): boolean;
    nextInvocation(): Date;
  }

  export interface RecurrenceRule {
    year?: number;
    month?: number;
    date?: number;
    dayOfWeek?: number;
    hour?: number;
    minute?: number;
    second?: number;
    tz?: string;
  }

  export function scheduleJob(
    nameOrJob: string | Job,
    spec: string | Date | RecurrenceRule,
    callback?: () => void
  ): Job;

  export function rescheduleJob(job: Job, spec: string | Date | RecurrenceRule): boolean;
  export function cancelJob(job: Job): boolean;
  export const scheduledJobs: { [key: string]: Job };
} 