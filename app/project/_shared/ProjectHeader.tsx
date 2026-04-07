import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import React from "react";

function ProjectHeader() {
  return (
    <div className="flex items-center justify-between p-4 shadow">
      <div className="flex w-37.5 items-center">
        <span className="text-2xl font-bold tracking-tight cursor-pointer transition-opacity hover:opacity-80 bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          MOK
        </span>
      </div>
      <Button>
        <Save /> Save
      </Button>
    </div>
  );
}

export default ProjectHeader;
