"use client";

import React, { useEffect, useState } from "react";
import ProjectHeader from "../_shared/ProjectHeader";
import SettingsSection from "../_shared/SettingsSection";
import axios from "axios";
import { useParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { ProjectType, ScreenConfig } from "@/type/types";
import Canvas from "../_shared/Canvas";

function ProjectCanvasPlayground() {
  const { projectId } = useParams();
  const [projectDetail, setProjectDetail] = useState<ProjectType>();
  const [screenConfig, setScreenConfig] = useState<ScreenConfig[]>([]);
  const [screenConfigOriginal, setScreenConfigOriginal] = useState<ScreenConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadinMsg] = useState("Loading");

  const [isGenerating, setIsGenerating] = useState(false); // ✅ guard

  useEffect(() => {
    if (projectId) GetProjectDetail();
  }, [projectId]);

  const GetProjectDetail = async () => {
    setLoading(true);
    setLoadinMsg("Loading...");
    const result = await axios.get("/api/project?projectId=" + projectId);

    setProjectDetail(result?.data?.projectDetail);
    setScreenConfigOriginal(result?.data?.screenConfig);
    setScreenConfig(result?.data?.screenConfig);

    setLoading(false);
  };

  useEffect(() => {
    if (!projectDetail) return;

    if (screenConfigOriginal?.length === 0) {
      generateScreenConfig();
    } else if (screenConfigOriginal?.length > 0) {
      GenerateScreenUIUX();
    }
  }, [projectDetail, screenConfigOriginal]);

  const generateScreenConfig = async () => {
    setLoading(true);
    setLoadinMsg("Generating screen config...");

    await axios.post("/api/generate-config", {
      projectId: projectId,
      deviceType: projectDetail?.device,
      userInput: projectDetail?.userInput,
    });

    await GetProjectDetail();
    setLoading(false);
  };

  const GenerateScreenUIUX = async () => {
    if (isGenerating) return; // ✅ prevents duplicate runs

    setIsGenerating(true);
    setLoading(true);

    for (let index = 0; index < screenConfig?.length; index++) {
      const screen = screenConfig[index];
      if (screen?.code) continue;

      setLoadinMsg("Generating Screen " + (index + 1));

      const result = await axios.post("/api/generate-screen-ui", {
        projectId,
        screenId: screen.screenId,
        screenName: screen.screenName,
        purpose: screen.purpose,
        screenDescription: screen.screenDescription,
      });

      setScreenConfig((prev) => prev.map((item, i) => (i === index ? result.data : item)));
    }

    setLoading(false);
    setIsGenerating(false);
  };

  return (
    <div>
      <ProjectHeader />

      <div className="flex">
        {loading && (
          <div className="absolute p-3 bg-blue-300/20 border-blue-400 rounded-xl left-1/2 top-20">
            <h2 className="flex gap-2 items-center">
              <Loader2Icon className="animate-spin" /> {loadingMsg}
            </h2>
          </div>
        )}

        <SettingsSection projectDetail={projectDetail} />

        <Canvas projectDetail={projectDetail} screenConfig={screenConfig} loading={loading} />
      </div>
    </div>
  );
}

export default ProjectCanvasPlayground;
