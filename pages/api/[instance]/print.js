import { list } from "@vercel/blob";
import { getAll } from '@vercel/edge-config';

export async function getBlob(instance){
  let { blobs } = await list({ prefix: instance }); // get all images
  let configItems = await getAll(); // get all the times someone has "captured"
  configItems = Object.entries(configItems)
  configItems = configItems.sort((a, b) => parseInt(b[0]) - parseInt(a[0])) // get the most recent capture
  
  let displaying = configItems[0][0]
  console.log(displaying)
  blobs = blobs
    .filter(
      (blob) => parseInt(blob.pathname.split("/")[1]) <= parseInt(displaying),
    )
    .map((blob) => ({
      url: blob.url,
      timestamp: parseInt(blob.pathname.split("/")[1]),
    })); // select all photos that are at or before the time of capture
  let blob = blobs[blobs.length - 1] // get the last blob to print
  return blob
}

export default async function handler(req, res) {
  let configItems = await getAll();
  configItems = Object.entries(configItems)
  configItems = configItems.sort((a, b) => parseInt(b[0]) - parseInt(a[0])) // this is the same logic to get the most recent "capture" to generate the URL which is used by the Siri shortcut
  
  let displaying = configItems[0][0]
  return res.json({blob: await getBlob(req.query.instance), url: `https://photobooth.sampoder.com/${req.query.instance}/${displaying}`});
}
