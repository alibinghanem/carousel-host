import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ImageReveal } from "../components/ImageReveal";
import { clampOpts, colors, ease } from "../theme";
import type { Photo } from "../generated/photos";

export const INK = "#070F26";
/** photo occupies this share of the 9:16 frame; the rest is a gradient into ink for typography */
export const PLATE_H = 1500;

/** Full-bleed photo plate: photo top-anchored (78 % of the frame), warm grade, top + bottom scrims. Navy is only the scrim. */
export const Plate: React.FC<{
  photo: Photo;
  focal?: [number, number];
  kb?: { from: number; to: number; dur: number; dx?: number; dy?: number };
  brightness?: number;
  scrim?: number; // bottom scrim strength 0..1
  children?: React.ReactNode;
}> = ({ photo, focal = [0.5, 0.5], kb = { from: 1.06, to: 1.24, dur: 120, dx: 3, dy: 0 }, brightness = 1, scrim = 1, children }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: INK }}>
      <ImageReveal photo={photo} reveal="none" box={{ left: 0, top: 0, width, height: PLATE_H }} focal={focal} kb={kb} brightness={brightness} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, rgba(7,15,38,0.6) 0px, rgba(7,15,38,0) 300px, rgba(7,15,38,0) ${PLATE_H - 720}px, rgba(7,15,38,${0.9 * scrim}) ${PLATE_H - 120}px, ${INK} ${PLATE_H + 30}px, ${INK} ${height}px)`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

/** A window inside the plate that opens on `fx,fy` and grows to fill the plate: the in-chapter "dive" into the interior. */
export const InnerPortal: React.FC<{
  photo: Photo;
  start: number;
  dur?: number;
  fx?: number;
  fy?: number;
  focal?: [number, number];
}> = ({ photo, start, dur = 26, fx = 0.5, fy = 0.4, focal = [0.5, 0.5] }) => {
  const frame = useCurrentFrame();
  const { width: W } = useVideoConfig();
  const H = PLATE_H;
  const e = interpolate(frame - start, [0, dur], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  if (e <= 0) return null;
  const cx0 = fx * W, cy0 = fy * H;
  const w = W * e, h = H * e;
  const cx = cx0 + (W / 2 - cx0) * e, cy = cy0 + (H / 2 - cy0) * e;
  const left = cx - w / 2, top = cy - h / 2, r = 90 * (1 - e);
  const rim = e < 0.04 ? e / 0.04 : Math.max(0, 1 - (e - 0.6) / 0.35);
  return (
    <>
      <div style={{ position: "absolute", left, top, width: w, height: h, borderRadius: r, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -left, top: -top, width: W, height: H, transformOrigin: `${cx0}px ${cy0}px`, scale: String(1 + 0.7 * (1 - e)) }}>
          <ImageReveal photo={photo} reveal="none" box={{ left: 0, top: 0, width: W, height: H }} focal={focal} kb={{ from: 1.06, to: 1.2, dur: 90, dx: -3 }} />
          <AbsoluteFill style={{ background: `linear-gradient(to bottom, rgba(7,15,38,0.5) 0px, rgba(7,15,38,0) 300px, rgba(7,15,38,0) ${H - 600}px, rgba(7,15,38,0.6) ${H}px)` }} />
        </div>
      </div>
      <div style={{ position: "absolute", left, top, width: w, height: h, borderRadius: r, border: `3px solid ${colors.gold}`, boxShadow: "0 0 40px rgba(220,165,13,0.7)", opacity: rim }} />
    </>
  );
};
