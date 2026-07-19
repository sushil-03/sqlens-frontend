"use client";

import * as React from "react";
import { UploadScreen } from "@/components/upload-screen";
import { LoadingScreen } from "@/components/loading-screen";
import { Workspace } from "@/components/workspace/workspace";
import {
  ApiError,
  getDashboard,
  loadSample,
  uploadFiles,
  type ApiChart,
  type UploadResult,
} from "@/lib/api";
import { buildFileSummary } from "@/lib/types";

type Stage = "upload" | "loading" | "workspace";

export default function Home() {
  const [stage, setStage] = React.useState<Stage>("upload");
  const [fileCount, setFileCount] = React.useState(0);
  const [session, setSession] = React.useState<UploadResult | null>(null);
  const [charts, setCharts] = React.useState<ApiChart[] | null>(null);
  const [keyInsight, setKeyInsight] = React.useState("");
  const [context, setContext] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const begin = (count: number, submittedContext: string | undefined, work: () => Promise<UploadResult>) => {
    setFileCount(count);
    setSession(null);
    setCharts(null);
    setKeyInsight("");
    setContext(submittedContext?.trim() ?? "");
    setError(null);
    setStage("loading");

    work()
      .then(async (result) => {
        setSession(result);
        const failed = result.files.filter((f) => !f.ok);
        if (failed.length > 0 && failed.length === result.files.length) {
          throw new ApiError(400, failed[0].error ?? "All files failed to load.");
        }
        const dashboard = await getDashboard(result.session_id);
        setCharts(dashboard.charts);
        setKeyInsight(dashboard.key_insight);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Something unexpected went wrong. Please try again."
        );
      });
  };

  const reset = () => {
    setStage("upload");
    setSession(null);
    setCharts(null);
    setKeyInsight("");
    setContext("");
    setError(null);
  };

  return (
    <div className="flex flex-1 flex-col">
      {stage === "upload" && (
        <UploadScreen
          onSubmit={(files, ctx) => begin(files.length, ctx, () => uploadFiles(files, ctx))}
          onSample={(id, ctx) => begin(3, ctx, () => loadSample(id, ctx))}
        />
      )}
      {stage === "loading" && (
        <LoadingScreen
          fileCount={fileCount}
          done={session !== null && charts !== null}
          error={error}
          onDone={() => setStage("workspace")}
          onBack={reset}
        />
      )}
      {stage === "workspace" && session && charts && (
        <Workspace
          sessionId={session.session_id}
          schema={session.schema}
          charts={charts}
          initialKeyInsight={keyInsight}
          initialContext={context}
          fileSummary={buildFileSummary(session.schema, fileCount)}
          onNewFile={reset}
        />
      )}
    </div>
  );
}
