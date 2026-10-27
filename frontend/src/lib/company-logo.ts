/** Well-known employers whose website isn't simply `<name>.com`. */
const KNOWN_DOMAINS: Record<string, string> = {
  google: "google.com",
  alphabet: "abc.xyz",
  microsoft: "microsoft.com",
  meta: "meta.com",
  facebook: "facebook.com",
  amazon: "amazon.com",
  apple: "apple.com",
  netflix: "netflix.com",
  flutterwave: "flutterwave.com",
  paystack: "paystack.com",
  datadog: "datadoghq.com",
  vercel: "vercel.com",
  canva: "canva.com",
  github: "github.com",
  linkedin: "linkedin.com",
  stripe: "stripe.com",
  spotify: "spotify.com",
  uber: "uber.com",
  airbnb: "airbnb.com",
  shopify: "shopify.com",
  andela: "andela.com",
  moniepoint: "moniepoint.com",
  kuda: "kuda.com",
  piggyvest: "piggyvest.com",
  interswitch: "interswitchgroup.com",
  "interswitch group": "interswitchgroup.com",
};

/** Best-guess website domain for a company name, e.g. "Open AI Inc." -> "openai.com". */
export function companyDomain(name: string) {
  const key = name.trim().toLowerCase();
  if (KNOWN_DOMAINS[key]) return KNOWN_DOMAINS[key];

  const slug = key
    .replace(/\b(inc|llc|ltd|limited|plc|corp|corporation|co|company|group)\b\.?/g, "")
    .replace(/[^a-z0-9]/g, "");
  return slug ? `${slug}.com` : null;
}

/** Logo (favicon) URL for a company, or null when no domain can be guessed. */
export function companyLogoUrl(name: string, size = 64) {
  const domain = companyDomain(name);
  return domain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`
    : null;
}
