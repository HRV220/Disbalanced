/**
 * User Types for Disbalanced
 */

/** User subscription status */
export interface Subscription {
  active: boolean;
  expiresAt: string | null; // ISO date string
  plan?: string;
}

/** Basic user */
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  subscription: Subscription;
}

/** Admin view of user (with additional fields) */
export interface AdminUser extends User {
  lastLoginAt: string | null;
  loginCount: number;
  presetCount: number;
}

/** User session (from NextAuth) */
export interface UserSession {
  user: {
    id: string;
    email: string;
    name?: string;
    subscription: Subscription;
  };
  expires: string;
}

/** Login credentials */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Registration data */
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

/** Password change data */
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/** Admin: Update user subscription */
export interface AdminUpdateSubscription {
  userId: string;
  active: boolean;
  expiresAt: string | null;
}

/** API response for user list (admin) */
export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

/** Check if subscription is valid */
export function isSubscriptionActive(subscription: Subscription): boolean {
  if (!subscription.active) return false;
  if (!subscription.expiresAt) return true;

  const expiresAt = new Date(subscription.expiresAt);
  return expiresAt > new Date();
}

/** Format subscription status for display */
export function formatSubscriptionStatus(subscription: Subscription): string {
  if (!subscription.active) {
    return "Неактивна";
  }

  if (!subscription.expiresAt) {
    return "Активна (бессрочно)";
  }

  const expiresAt = new Date(subscription.expiresAt);
  const now = new Date();

  if (expiresAt <= now) {
    return "Истекла";
  }

  const daysLeft = Math.ceil(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 7) {
    return `Активна (осталось ${daysLeft} дн.)`;
  }

  return `Активна до ${expiresAt.toLocaleDateString("ru-RU")}`;
}
