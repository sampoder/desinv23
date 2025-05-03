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
      images = [...props.images.map((image, index) => p5.loadImage(image))];
      console.log(props.images)
    }
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
    p5.frameRate(60);
  };

  p5.draw = () => {
    if (images.length > 0) {
      p5.image(
        images.length == 1 ? images[0] : images.shift(),
        -(p5.windowWidth / 2),
        -(p5.windowHeight / 2),
        p5.windowWidth,
        p5.windowHeight,
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
            top: 16,
            left: 16,
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: "black",
            padding: "8px",
            borderRadius: 4,
          }}
          onClick={() => setViewCount(viewCount + 1)}
        >
          🔁
        </div>
      </div>
  
  );
}

export async function getServerSideProps({ req, res, params }) {
  let { blobs } = await list({ prefix: params.instance });
  blobs = blobs
    .filter(
      (blob) => parseInt(blob.pathname.split("/")[1]) > parseInt(params.time),
    )
    .map((blob) => ({
      url: blob.url,
      timestamp: parseInt(blob.pathname.split("/")[1]),
    }));
  console.log(blobs);
  return { props: { blobs } };
}
