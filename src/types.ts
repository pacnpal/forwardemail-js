/**
 * Forward Email API Types
 */

export interface ForwardEmailConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
}

export interface EmailOptions {
  from: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
  sender?: string;
  replyTo?: string;
  inReplyTo?: string;
  references?: string | string[];
  attachDataUrls?: boolean;
  watchHtml?: string;
  amp?: string;
  icalEvent?: Record<string, any>;
  alternatives?: Record<string, any>[];
  encoding?: string;
  raw?: string;
  textEncoding?: 'quoted-printable' | 'base64';
  priority?: 'high' | 'normal' | 'low';
  headers?: Record<string, any> | Record<string, any>[];
  messageId?: string;
  date?: string | Date;
  list?: Record<string, any>;
}

export interface Attachment {
  filename?: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
  contentDisposition?: string;
  cid?: string;
  encoding?: string;
  headers?: Record<string, any>;
}

export interface EmailResponse {
  id: string;
  object: 'email';
  status: string;
  alias: string;
  domain: string;
  user: string;
  is_locked: boolean;
  envelope: {
    from: string;
    to: string[];
  };
  messageId: string;
  date: string;
  subject: string;
  accepted: string[];
  created_at: string;
  updated_at: string;
  link: string;
  is_redacted?: boolean;
  hard_bounces?: string[];
  soft_bounces?: string[];
  is_bounce?: boolean;
}

export interface EmailListResponse {
  emails: EmailResponse[];
  page?: number;
  limit?: number;
  total?: number;
}

export interface EmailLimitResponse {
  count: number;
  limit: number;
}

export interface ErrorResponse {
  message: string;
  statusCode?: number;
}

export interface Account {
  id: string;
  email: string;
  plan: string;
  object: 'user';
  sessions?: string[];
  has_newsletter?: boolean;
  max_quota_per_alias?: number;
  full_email?: string;
  display_name?: string;
  otp_enabled?: boolean;
  last_locale?: string;
  address_country?: string | null;
  locale?: string;
  created_at: string;
  updated_at: string;
  address_html?: string;
  api_token?: string;
}

export interface Domain {
  id: string;
  name: string;
  object: 'domain';
  plan: string;
  has_mx_record: boolean;
  has_txt_record: boolean;
  has_dkim_record?: boolean;
  has_return_path_record?: boolean;
  has_dmarc_record?: boolean;
  has_smtp?: boolean;
  is_smtp_suspended?: boolean;
  verification_record?: string;
  created_at: string;
  updated_at: string;
  storage_used?: number;
  storage_used_by_aliases?: number;
  storage_quota?: number;
  link?: string;
}

export interface Alias {
  id: string;
  name: string;
  object: 'alias';
  user: {
    id: string;
    email: string;
    display_name: string;
  };
  domain: {
    id: string;
    name: string;
  };
  labels: string[];
  is_enabled: boolean;
  has_recipient_verification: boolean;
  verified_recipients: string[];
  pending_recipients: string[];
  recipients: string[];
  created_at: string;
  updated_at: string;
  storage_location?: string;
  has_imap?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  pagination?: boolean;
}

export interface ListEmailsOptions extends PaginationOptions {
  q?: string;
  domain?: string;
  sort?: string;
}
