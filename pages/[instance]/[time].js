"use client";

// this is the page rendered when you scan the QR code or tap the NFC tag, it lets you see what happened with all the people before you

import { useRouter } from "next/router";
import { list } from "@vercel/blob";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";

// this function is used to limit the amount of images to 350
// because a browser can't render more than that.
// it creates a 350-length array and then fills it in with equally spaced apart items

function sampleArray(arr) {
  if (arr.length <= 350) return arr;
  const step = (arr.length - 1) / 349;
  return Array.from({ length: 350 }, (_, i) => arr[Math.round(i * step)]);
}

// sourced from https://overreacted.io/making-setinterval-declarative-with-react-hooks/

function useInterval(callback, delay) {
  const savedCallback = useRef();
 
  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
 
  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function Viewer({ blobs }) {
  const router = useRouter();
  const [images, setImages] = useState([]);

  // sourced / adapted from https://stackoverflow.com/questions/44698967/requesting-blob-images-and-transforming-to-base64-with-fetch-api
  // used so that I can fetch them all at once
  const imageUrlToBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((onSuccess, onError) => {
      try {
        const reader = new FileReader();
        reader.onload = function () {
          onSuccess(this.result);
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        onError(e);
      }
    });
  };

  useEffect(() => {
    Promise.all(blobs.map((blob) => imageUrlToBase64(blob.url))).then(
      (values) => {
        setImages(values);
      },
    );
  }, []); // this takes all the images, downloads them, and turns them into base64
  
  let [count, setCount] = useState(0);
  
  useInterval(() => { // render a new image every tenth of a second
    setCount(count + 1);
  }, 100);

  return (
    <div>
      { // either displays a loading screen or the current image being displayed
      }
      {!(images.length > 0) ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: 36,
            width: '100dvw',
            height: '100dvh',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          Loading...
        </div>
      ) : <img src={images[count] || images[images.length - 1]} style={{ objectFit: 'cover', height: '100dvh', width: '100dvw', objectPosition: 'center'}} />}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          width: '100dvw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
          fontSize: 28
        }}
        onClick={() => setCount(0)}
      >
        <div style={{background: "black", padding: "16px 32px", borderRadius: 8, display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer'}}>🔁 <span style={{ display: 'inline-block', marginLeft: '12px', fontWeight: 800, transform: 'translateY(-0.5px)' }}>Replay</span></div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res, params }) {
  let { blobs } = await list({ prefix: params.instance });
  blobs = blobs
    .filter(
      (blob) => parseInt(blob.pathname.split("/")[1]) <= parseInt(params.time),
    )
    .map((blob) => ({
      url: blob.url,
      timestamp: parseInt(blob.pathname.split("/")[1]),
    }));
  blobs = sampleArray(blobs); // get all the images before and at the timestamp
  return { props: { blobs } };
}
