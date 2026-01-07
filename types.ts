
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
  referrer_id?: string; // ID của người giới thiệu
  referral_earned?: number; // Tổng xu đã kiếm từ bạn bè
}

export interface ShortLinkTask {
  id: string;
  platform: string;
  reward: number;
  url: string;
  description: string;
  status: 'active' | 'inactive';
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