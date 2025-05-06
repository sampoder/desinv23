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
  let video;
  let bodyPose;
  let poses = [];
  let connections;
  
  let c;
  let colours;
  let flag = false;
  let lines;
  let stressors;
  
  let predefined = ["💼", "🎓", "❤️", "📚", "📝", "⏳", "🏃‍♂️", "📆", "🧑‍🧑‍🧒‍🧒", "🗳️"];

 
  
  p5.preload = async () => {
    let loading = ml5.bodyPose(); // Load the bodyPose model: https://docs.ml5js.org/#/reference/bodypose
    await loading.ready;
    console.log("ready!")
    bodyPose = loading
  }

  p5.updateWithProps = (props) => {
    if (props.instanceId) {
      instanceId = props.instanceId;
    }
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    video = p5.createCapture(p5.VIDEO);
    video.size(p5.windowWidth, p5.windowHeight);
    video.hide();
    console.log(video)
    while(bodyPose == null) {}
    bodyPose.detectStart(video, r => {
      console.log(r)
      poses = r
    });
    
    
    connections = bodyPose.getSkeleton();
    times = new Set();
    
    colours = [
      p5.color(130, 211, 27),
      p5.color(255, 204, 0),
      p5.color(18, 150, 224),
      p5.color(252, 183, 27)
    ]
  };

  p5.draw = () => {
    if(poses.length == 0 && !flag) { // change the colour of the background when there's no one in the frame
      c = p5.random(colours);
      flag = true;
    } else if (poses.length > 0) {
      flag = false;
    }
    
    // console.log(poses)
    
    p5.background(c);
    
    for (let i = 0; i < poses.length; i++)
    {
      let pose = poses[i]
      for (let j = 0; j < connections.length; j++)
      {
        let pointAIndex = connections[j][0]
        let pointBIndex = connections[j][1]
        let pointA = pose.keypoints[pointAIndex]
        let pointB = pose.keypoints[pointBIndex]
        if (pointA.confidence > 0.1 && pointB.confidence > 0.1)
        {
          p5.stroke(0, 0, 255)
          p5.strokeWeight(5)
          p5.line(pointA.x, pointA.y, pointB.x, pointB.y)
        }
      }
    } 
    
    
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
        <div style={{ position: "absolute", top: 0, right: 16 }}>
          <div
            style={{
              background: "white",
              padding: "8px",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
              color: "black",
            }}
          >
            📸
          </div>
        </div>
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
        {on && (
          <>
            <ReactP5Wrapper sketch={sketch} instanceId={instanceId} />
            <script src="https://unpkg.com/ml5@1/dist/ml5.min.js"></script>
          </>
        )}
      </div>
    </>
  );
}
