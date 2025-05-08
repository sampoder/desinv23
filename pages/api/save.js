// This API route is used to save an image into Vercel Blob. Instances are to differentiate between different times the art is displayed.
// The fetching is done to convert the image into a format Vercel can accept.

import { put } from '@vercel/blob';

export default async function handler(req, res) {
  console.log(`${req.body.instanceId}/${req.body.time}`)
  const blob = await put(`${req.body.instanceId}/${req.body.time}`, await (await fetch(req.body.image)).blob(), {
    access: 'public',
    contentType: "image/png"
  });
  
  return res.json(blob);
}

// this is so the route can accept large images

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb'
        }
    }
}
