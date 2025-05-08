"use client";

import { useRouter } from "next/router";
import { list } from "@vercel/blob";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";

function sampleArray(arr) {
  if (arr.length <= 350) return arr;
  const step = (arr.length - 1) / 349; // 349 gaps for 350 points including the end
  return Array.from({ length: 350 }, (_, i) => arr[Math.round(i * step)]);
}

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
  }, []);
  
  let [count, setCount] = useState(0);
  
  useInterval(() => {
    // Your custom logic here
    setCount(count + 1);
  }, 100);

  return (
    <div>
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
  blobs = sampleArray(blobs);
  return { props: { blobs } };
}
