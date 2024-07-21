// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { newVar } from "@/lib/mock";

export function enableCors(res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*"); // replace this your actual origin
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  enableCors(res);
  const resp = await fetch(
    "https://raw.githubusercontent.com/CancerGary/lark-url-preview-presets/main/data.json",
  );
  const data = await resp.json();
  // const data = newVar;
  res.status(200).json(data);
}
