/**
 * Worker entry point. This project deploys as a Cloudflare Worker with static
 * assets (not Cloudflare Pages), so routing happens here rather than via a
 * `functions/` directory: POST /api/inquiry runs the enquiry handler, and
 * every other request falls through to the built static site.
 */
import { handleInquiry, type InquiryEnv } from './server/inquiry';

interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env extends InquiryEnv {
  ASSETS: AssetFetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/inquiry') return handleInquiry(request, env);
    return env.ASSETS.fetch(request);
  },
};
