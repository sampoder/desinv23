import { list } from "@vercel/blob";
import { getAll } from '@vercel/edge-config';

export async function getBlob(instance){
  let { blobs } = await list({ prefix: instance });
  let configItems = await getAll();
  configItems = Object.entries(configItems)
  configItems = configItems.sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
  
  let displaying = configItems[0][0]
  console.log(displaying)
  blobs = blobs
    .filter(
      (blob) => parseInt(blob.pathname.split("/")[1]) <= parseInt(displaying),
    )
    .map((blob) => ({
      url: blob.url,
      timestamp: parseInt(blob.pathname.split("/")[1]),
    }));
  let blob = blobs[blobs.length - 1]
  return blob
}

export default async function handler(req, res) {
  let configItems = await getAll();
  configItems = Object.entries(configItems)
  configItems = configItems.sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
  
  let displaying = configItems[0][0]
  return res.json({blob: await getBlob(req.query.instance), url: `https://photobooth.sampoder.com/${req.query.instance}/${displaying}`});
}
