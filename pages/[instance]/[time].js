'use client'

import { useRouter } from "next/router"
import { list } from '@vercel/blob';
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const ReactP5Wrapper = dynamic(
  () => import("@p5-wrapper/react").then((mod) => mod.ReactP5Wrapper),
  {
    ssr: false,
  }
)


function sketch(p5) {
  let images = [];
  let loaded = [];
  
  p5.updateWithProps = props => {
    if (props.images) {
      images = [...(props.images.map(image => p5.loadImage(image)))]
    }
  };
  
  p5.setup = () => {
    p5.createCanvas(600, 400, p5.WEBGL);
    p5.frameRate(1);
  };
  
  p5.draw = () => {
    p5.image(images[p5.frameCount % images.length], -300, -200, 600, 400);
  }
}


export default function Viewer({blobs}) {
  const router = useRouter()
  const [images, setImages] = useState([])
  
  const imageUrlToBase64 = async url => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((onSuccess, onError) => {
      try {
        const reader = new FileReader() ;
        reader.onload = function(){ onSuccess(this.result) } ;
        reader.readAsDataURL(blob) ;
      } catch(e) {
        onError(e);
      }
    });
  };
  
  
  
  useEffect(() => {
     Promise.all(blobs.map(blob => imageUrlToBase64(blob.url))).then((values) => {
       setImages(values);
     });
  }, []);
  
  return (
    <>
      <div>
        {images.length > 0 && <ReactP5Wrapper sketch={sketch} images={images} />}
      </div>
    </>
  );
}

export async function getServerSideProps({ req, res, params }){
  let { blobs } = await list({prefix: params.instance});
  blobs = blobs.filter(blob => parseInt(blob.pathname.split("/")[1]) > parseInt(params.time)).map(blob => ({
    url: blob.url,
    timestamp: parseInt(blob.pathname.split("/")[1]),
  }))
  console.log(blobs)
  return { props: { blobs } }
}