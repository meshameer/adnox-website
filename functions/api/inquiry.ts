// Cloudflare Pages Function: POST /api/inquiry → emails the contact form via Resend.
import { handleInquiry, type InquiryEnv } from '../../src/server/inquiry';

export const onRequestPost = (context: { request: Request; env: InquiryEnv }) =>
  handleInquiry(context.request, context.env);

