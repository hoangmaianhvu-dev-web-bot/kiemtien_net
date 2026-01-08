
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface UserProfile {
  id: string;
  username: string;
  xu: number;
  role: string;
  avatar_url?: string;
  created_at: string;
  referrer_id?: string;
  referral_earned?: number;
}

export interface ShortLinkTask {
  id: string;
  title: string;
  xu: number; 
  url: string;
  status: 'active' | 'inactive';
  type: 'normal' | 'special' | 'separator';
  max_slots: number;
  completed_count: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  link: string;
  type: 'mod' | 'toy' | 'free' | 'shopee';
  description: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  users?: { username: string };
}

export interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  users?: { username: string };
}
