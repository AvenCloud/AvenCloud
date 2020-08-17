import React from "react";
import MainWidth from "./MainWidth";

export default function VideoSection({ vimeoId, videoTitle }) {
  return (
    <div
      style={{
        backgroundColor: "#222",
        padding: "10px 0",
      }}
    >
      <MainWidth>
        <div style={{}}>
          <div
            style={{
              padding: "56.25% 0 0 0",
              position: "relative",
            }}
          >
            {/* <link rel="preconnect" href="https://i.vimeocdn.com" /> */}
            <link rel="preconnect" href="https://fresnel.vimeocdn.com" />
            <iframe
              title={`Video: ${videoTitle}`}
              src={`https://player.vimeo.com/video/${vimeoId}`}
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            ></iframe>
          </div>
        </div>
      </MainWidth>
    </div>
  );
}
