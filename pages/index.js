"use client";

import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import dynamic from "next/dynamic";
import { useState } from "react";

const ReactP5Wrapper = dynamic(
  () => import("@p5-wrapper/react").then((mod) => mod.ReactP5Wrapper),
  {
    ssr: false,
  },
);

function sketch(p5) {
  let times = new Set();
  let instanceId = `${Math.random()}`;

  function saveFrame(frames) {
    let frame = frames[0];
    fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: frame.imageData,
        time: frame.filename,
        instanceId,
      }),
    });
  }

  p5.updateWithProps = (props) => {
    if (props.instanceId) {
      instanceId = props.instanceId;
    }
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
    times = new Set();
  };

  p5.draw = () => {
    p5.background(250);
    p5.normalMaterial();
    p5.push();
    p5.rotateZ(p5.frameCount * 0.01);
    p5.rotateX(p5.frameCount * 0.01);
    p5.rotateY(p5.frameCount * 0.01);
    p5.plane(100);
    p5.pop();
    let time = new Date().getTime();
    let second = time - (time % 1000);
    if (!times.has(second)) {
      console.log("Queuing...");
      times.add(second);
      p5.saveFrames(second, null, 1, 1, saveFrame);
    }
  };
}

export default function Main() {
  const [on, setOn] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [instanceId, setInstanceId] = useState("");

  return (
    <>
      <Head>
        <title>Silhouettes</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌈</text></svg>" />
      </Head>
      <div>
        <div style={{ position: "absolute", bottom: 0, right: 16 }}>
          <div
            style={{
              background: "white",
              padding: "8px",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              color: "black",
            }}
            
          >
            {expanded ? (
              <>
                <button onClick={() => {
                  setOn(!on)
                  setExpanded(false)
                }} disabled={instanceId == ""} style={{ color: 'white', marginRight: '8px', padding: '4px' }}>
                  {instanceId == ""
                    ? "Enter an ID"
                    : on
                      ? "Stop"
                      : `Start (${instanceId})`}
                </button>
                <input
                  placeholder="Instance ID"
                  onChange={(e) => setInstanceId(e.target.value)}
                  value={instanceId}
                  style={{ padding: '4px' }}
                />
              </>
            ) : (
              <span onClick={() => setExpanded(true)}>▲</span>
            )}
          </div>
        </div>
        {on && <ReactP5Wrapper sketch={sketch} instanceId={instanceId} />}
      </div>
    </>
  );
}
