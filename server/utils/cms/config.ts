import type { H3Event } from 'h3'

const DEV_FALLBACK_SECRET = 'dev-only-insecure-cms-session-secret-change-me'

export function cmsConfig(event?: H3Event) {
  const cms = useRuntimeConfig(event).cms
  const isProd = !import.meta.dev
  let sessionSecret = String(cms.sessionSecret || '')
  if (sessionSecret.length < 32) {
    // Fail closed in production; a dev server still boots without .env.
    if (isProd) {
      throw createError({ statusCode: 500, statusMessage: 'CMS is not configured' })
    }
    sessionSecret = DEV_FALLBACK_SECRET
  }
  return {
    isProd,
    sessionSecret,
    trustProxy: String(cms.trustProxy) === 'true',
    allowSeed: String(cms.allowSeed) === 'true',
    seedAdminPassword: String(cms.seedAdminPassword || ''),
    seedEditorPassword: String(cms.seedEditorPassword || '')
  }
}

export function clientIp(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: cmsConfig(event).trustProxy }) || 'unknown'
}

// Public-content flags. Read from trusted server config only — never from
// the request (query, header, cookie) — and independent of the auth secret,
// so a public page never fails because the admin CMS is unconfigured.
export function cmsPublicFlags(event?: H3Event) {
  const cms = useRuntimeConfig(event).cms
  return {
    aboutPublicEnabled: String(cms.aboutPublicEnabled) === 'true',
    aboutPublicProofEnabled: String(cms.aboutPublicProofEnabled) === 'true',
    technologyPublicEnabled: String(cms.technologyPublicEnabled) === 'true',
    creativePublicEnabled: String(cms.creativePublicEnabled) === 'true',
    workPublicEnabled: String(cms.workPublicEnabled) === 'true',
    insightsPublicEnabled: String(cms.insightsPublicEnabled) === 'true',
    contactPublicEnabled: String(cms.contactPublicEnabled) === 'true',
    testimonialsPublicEnabled: String(cms.testimonialsPublicEnabled) === 'true'
  }
}
