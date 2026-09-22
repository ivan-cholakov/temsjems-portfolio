import nodemailer from "nodemailer";

import { createHandler } from "./contact.js";

const SMTP_HOST = "smtp.tem.scaleway.com";
const SMTP_PORT = 465;
const SMTP_TIMEOUTS = { connectionTimeout: 5_000, greetingTimeout: 5_000, socketTimeout: 8_000 };

export function createSmtpSender(env) {
  if (!env.TEM_SMTP_USERNAME || !env.TEM_SMTP_PASSWORD) return null;

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: { user: env.TEM_SMTP_USERNAME, pass: env.TEM_SMTP_PASSWORD },
    ...SMTP_TIMEOUTS,
  });

  return async function send(message) {
    const info = await transport.sendMail(message);
    if (info.rejected.length > 0) {
      throw new Error(`relay rejected ${info.rejected.join(", ")}: ${info.response}`);
    }
    return { id: info.messageId, response: info.response };
  };
}

export const handle = createHandler({
  send: createSmtpSender(process.env),
  now: () => Date.now(),
  log: (line) => console.log(line),
});
