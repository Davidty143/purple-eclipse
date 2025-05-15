import { RestrictionReason } from './restriction';

export interface User {
  account_id: string;
  account_username: string;
  account_email: string;
  account_status: string;
  restriction_reason: RestrictionReason | null;
  restriction_date: string | null;
  restriction_end_date: string | null;
  restriction_notes: string | null;
  banned_by: string | null;
  restricted_by: string | null;
  Role: { role_type: string };
}
