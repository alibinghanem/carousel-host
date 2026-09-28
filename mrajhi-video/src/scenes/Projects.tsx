import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { useLayout } from "../theme";
import { GradientBackground } from "../components/GradientBackground";
import { KineticText, Rule } from "../components/KineticText";
import { ProjectShowcase } from "../components/ProjectShowcase";
import { PROJECTS } from "../content";

/** S3 — project showcase: title beat, then one masked panel per real project. */
export const Projects: React.FC<{ short?: boolean }> = ({ short = false }) => {
  const { width, height, portrait, size } = useLayout();
  const list = short ? [PROJECTS[0], PROJECTS[1], PROJECTS[3]] : PROJECTS;
  const step = short ? 66 : 78;
  const lead = short ? 30 : 42;
  return (
    <AbsoluteFill>
      <GradientBackground variant="navy" seed={2} />
      <div style={{ position: "absolute", left: 0, right: 0, top: height / 2 - size.headline * 0.9, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <KineticText text="مشاريعنا في قلب الرياض" size={portrait ? 96 : size.headline - 10} weight={900} start={2} align="center" goldWords={[3]} maxWidth={width - 200} exitAt={lead - 14} />
        <div style={{ height: 34 }} />
        <Rule start={10} dur={20} width={260} thickness={6} exitAt={lead - 12} style={{ transformOrigin: "center" }} />
      </div>
      <Sequence from={lead} durationInFrames={step * list.length + 40} layout="none">
        <ProjectShowcase projects={list} step={step} />
      </Sequence>
    </AbsoluteFill>
  );
};
