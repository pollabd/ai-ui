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
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadinMsg] = useState("Loading");

  useEffect(() => {
    projectId && GetProjectDetail();
  }, [projectId]);

  const GetProjectDetail = async () => {
    setLoading(true);
    setLoadinMsg("Loading...");
    const result = await axios.get("/api/project?projectId=" + projectId);
    setProjectDetail(result?.data?.projectDetail);
    setScreenConfig(result?.data?.screenConfig);
    // if (result.data.screenConfig.length == 0) {
    //   generateScreenConfig();
    // }
    setLoading(false);
  };

  useEffect(() => {
    if (projectDetail && screenConfig && screenConfig.length == 0) {
      generateScreenConfig();
    } else if (projectDetail && screenConfig) {
      GenerateScreenUIUX();
    }
  }, [projectDetail && screenConfig]);
  const generateScreenConfig = async () => {
    // console.log("Generating screen config");
    setLoading(true);
    setLoadinMsg("Generating screen config...");
    const result = await axios.post("/api/generate-config", {
      projectId: projectId,
      deviceType: projectDetail?.device,
      userInput: projectDetail?.userInput,
    });
    console.log(result.data);

    GetProjectDetail();
    setLoading(false);
  };

  const GenerateScreenUIUX = async () => {
    setLoading(true);

    for (let index = 0; index < screenConfig?.length; index++) {
      const screen = screenConfig[index];
      if (screen?.code) continue;
      setLoadinMsg("Generating Screen" + index + 1);
      const result = await axios.post("/api/generate-screen-ui", {
        projectId,
        screenId: screen.screenId,
        screenName: screen.screenName,
        purpose: screen.purpose,
        screenDescription: screen.screenDescription,
      });
      console.log(result.data);
      setScreenConfig((prev) => prev.map((item, i) => (i === index ? result.data : item)));
    }

    setLoading(false);
  };

  return (
    <div>
      <ProjectHeader />
      {/* Settings */}
      <div className="flex">
        {loading && (
          <div className="absolute p-3 bg-blue-300/20 border-blue-400 rounded-xl left-1/2 top-20">
            <h2 className="flex gap-2 items-center">
              <Loader2Icon className="animate-spin" /> {loadingMsg}
            </h2>
          </div>
        )}
        <SettingsSection projectDetail={projectDetail} />
        {/* Canvas */}

        <Canvas projectDetail={projectDetail} screenConfig={screenConfig} loading={loading} />
      </div>
    </div>
  );
}

export default ProjectCanvasPlayground;
