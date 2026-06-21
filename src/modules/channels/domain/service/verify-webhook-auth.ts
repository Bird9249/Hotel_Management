export function verifyChannelWebhookAuth(request: Request) {
  const secret = process.env.WEBHOOK_SECRET_CHANNELS;
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }

  const authorization = request.headers.get("authorization");
  if (authorization === `Bearer ${secret}`) return true;

  const signature = request.headers.get("x-channel-signature");
  return signature === secret;
}
