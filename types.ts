
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface UserProfile {
  id: string;
  username: string;
  xu_balance: number;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  referrer_id?: string;
  referral_earned?: number;
}

export interface ShortLinkTask {
  id: string;
  title: string;
  platform: string;
  xu: number; // Đã đổi từ reward sang xu
  url: string;
  description: string;
  status: 'active' | 'inactive';
  type: 'auto' | 'manual';
  provider?: string;
  api_token?: string;
  manual_link?: string;
}

export interface TaskRequest {
  id: string;
  user_id: string;
  task_id: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  method: 'BANK' | 'GARENA';
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface TaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  verification_code: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
