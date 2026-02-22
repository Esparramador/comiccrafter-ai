import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import VideoProductionWizard from "@/components/video/VideoProductionWizard";
import VideoViewer from "@/components/video/VideoViewer";

export default function VideoStudio() {
  const [generatedProject, setGeneratedProject] = useState(null);
  const navigate = useNavigate();

  if (generatedProject) {
    return (
      <VideoViewer
        project={generatedProject}
        onBack={() => {
          setGeneratedProject(null);
        }}
      />
    );
  }

  return <VideoProductionWizard onProjectCreated={setGeneratedProject} />;
}