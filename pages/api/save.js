// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { put } from '@vercel/blob';

export default async function handler(req, res) {
  console.log(req.body.image)
  const blob = await put(`${req.body.instanceId}/${req.body.time}`, await (await fetch(req.body.image)).blob(), {
    access: 'public',
    contentType: "image/png"
  });
  
  return res.json(blob);
}

