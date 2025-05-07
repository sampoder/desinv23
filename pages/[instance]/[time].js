"use client";

import { useRouter } from "next/router";
import { list } from "@vercel/blob";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactP5Wrapper = dynamic(
  () => import("@p5-wrapper/react").then((mod) => mod.ReactP5Wrapper),
  {
    ssr: false,
  },
);

function sketch(p5) {
  let images = [];
  let loaded = [];

  p5.updateWithProps = (props) => {
    if (props.images) {
      images = [];
      console.log(props.images)
    }
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.frameRate(20);
  };

  p5.draw = () => {
    if (images.length > 0) {
      let img = images.length == 1 ? images[0] : images.shift()
      if(p5.windowHeight > p5.windowWidth) {
        img.resize(0, p5.windowHeight)
      } else {
        img.resize(p5.windowWidth, 0)
      }
      p5.imageMode(p5.CENTER)
      p5.image(
        img,
        0,
        0,
      );
    }
  };
}

export default function Viewer({ blobs }) {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [viewCount, setViewCount] = useState(1);

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

  return (
  
      <div>
        <ReactP5Wrapper
          sketch={sketch}
          images={images}
          viewCount={viewCount}
        />
        {!(images.length > 0) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontSize: 36,
              width: '100vw',
              height: '100vh',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            Loading...
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui',
            fontSize: 28
          }}
          onClick={() => setViewCount(viewCount + 1)}
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
  console.log(blobs);
  return { props: { blobs } };
}
