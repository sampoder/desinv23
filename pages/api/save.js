// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { put } from '@vercel/blob';

export default async function handler(req, res) {
  const blob = await put(`${req.body.instanceId}/${req.body.time}`, await (await fetch(req.body.image)).blob(), {
    access: 'public',
    contentType: "image/png"
  });
  
  return res.json(blob);
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb'
        }
    }
}