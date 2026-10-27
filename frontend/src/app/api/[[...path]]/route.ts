const BODYLESS_METHODS = new Set(["GET", "HEAD"]);
const HOP_BY_HOP_HEADERS = [
  "connection",
  "content-length",
  "host",
  "transfer-encoding",
];

async function proxyToBackend(request: Request) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("The BACKEND_URL service binding is not configured");
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(
    `${incomingUrl.pathname}${incomingUrl.search}`,
    backendUrl,
  );
  const headers = new Headers(request.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: BODYLESS_METHODS.has(request.method)
      ? undefined
      : await request.arrayBuffer(),
  });
  const responseHeaders = new Headers(response.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));
  responseHeaders.delete("content-encoding");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyToBackend;
export const HEAD = proxyToBackend;
export const POST = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;
