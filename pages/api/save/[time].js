// this route stores that someone wants to "take a photo", the most recently saved timestamp is used when printing
// I'm using Vercel's edge config as a janky database because it's fast to read from.

export default async function handler(req, res) {
  const updateEdgeConfig = await fetch(
    'https://api.vercel.com/v1/edge-config/ecfg_athi2rt3yset3ky6rb6deg6brcuo/items',
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'create',
            key: req.query.time,
            value: 'saved',
          }
        ],
      }),
    },
  );
  const result = await updateEdgeConfig.json();
  return res.json(result);
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb'
        }
    }
}
