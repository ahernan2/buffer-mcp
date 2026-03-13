// Buffer API v1 response types

export interface BufferUser {
  id: string;
  name: string;
  plan: string;
  timezone: string;
  created_at: number;
}

export interface BufferProfile {
  id: string;
  service: string;
  service_id: string;
  service_username: string;
  formatted_service: string;
  formatted_username: string;
  avatar: string;
  default: boolean;
  schedules: BufferSchedule[];
  counts: {
    pending: number;
    sent: number;
    daily_suggestions: number;
  };
}

export interface BufferSchedule {
  days: string[];
  times: string[];
}

export interface BufferUpdate {
  id: string;
  created_at: number;
  day: string;
  due_at: number;
  due_time: string;
  media: {
    photo?: string;
    link?: string;
    description?: string;
    title?: string;
  };
  profile_id: string;
  profile_service: string;
  sent_at?: number;
  service_update_id?: string;
  status: string;
  text: string;
  text_formatted: string;
  user_id: string;
  via: string;
}

export interface BufferApiError {
  error?: string;
  message?: string;
  code?: number;
}
