"use client";

import { useRouter } from "next/router";
import { list } from "@vercel/blob";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getAll } from '@vercel/edge-config';

import html2canvas from 'html2canvas'
import { jsPDF } from "jspdf";
import { getBlob } from "../api/[instance]/print"

import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Viewer({ blob, instance }) {
  
  const { data } = useSWR(`/api/${instance}/print`, fetcher, { refreshInterval: 1000 })

  function exportAsPDF() {
    html2canvas(document.querySelector(`#capture`), { allowTaint: true, useCORS:true }).then(canvas => {
      let dataURL = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "in",
        format: [6, 4]
      });
  
      pdf.addImage(dataURL, 'PNG', 0, 0, 6, 4);
      pdf.save(`${Math.random()}.pdf`);
    });
  }
  
  return (
    <div id="capture" style={{ width: '1200px', height: '800px', position: 'relative', fontFamily: "'Futura'", borderRadius: '16px'}}>
      <img src={(data?.blob || blob).url} style={{width: '100%', height: '100%',objectFit: 'cover', objectPosition: 'center', borderRadius: '16px' }} />
      <div style={{ width: '100%', position: 'absolute', bottom: 0, left: 0, background: 'rgba(0, 0, 0, 0.7)', padding: '32px', display: 'flex', borderRadius: '16px'}}>
        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800 }}>
            DESINV23 Design Showcase - Spring 2025
          </h1>
          <h2 style={{ fontSize: 32 }}>
            github.com/sampoder/photo-booth
          </h2>
        </div>
        <img onClick={() => exportAsPDF()} style={{ border: '8px solid white', borderRadius: 8}} src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:3001/${instance}/${(data?.blob || blob).timestamp}`} />
      </div>
      <style>{`
        @media print {
          body {-webkit-print-color-adjust: exact;}
        }
        
        `}
      </style>
    </div>
  );
}

export async function getServerSideProps({ req, res, params }) {
  const blob = await getBlob()
  console.log(blob)
  return { props: { blob, instance: params.instance } };
}
