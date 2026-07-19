const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export type ApiColumn = { name: string; type: string; is_primary_key: boolean };

export type ApiTable = {
  name: string;
  source_file: string;
  row_count: number;
  columns: ApiColumn[];
  sample_rows: Record<string, unknown>[];
};

export type ApiRelationship = {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
};

export type ApiSchema = { tables: ApiTable[]; relationships: ApiRelationship[] };

export type ApiFileResult = {
  filename: string;
  ok: boolean;
  tables_added: string[];
  error: string | null;
};

export type UploadResult = {
  session_id: string;
  files: ApiFileResult[];
  schema: ApiSchema;
};

export type ApiChart = {
  title: string;
  chart_type: "bar" | "line" | "pie" | "area" | "stat" | "funnel" | "scatter";
  sql: string;
  x_field: string | null;
  y_fields: string[];
  data: Record<string, unknown>[];
};

export type ApiDashboard = { key_insight: string; charts: ApiChart[] };

export type UsageInfo = {
  input_tokens: number;
  output_tokens: number;
  claude_calls: number;
  cost_usd?: number;
};

export type ChatResult = {
  reply: string;
  sql_used: string[];
  charts: ApiChart[];
  usage?: UsageInfo;
};

export type ChatEvent =
  | { type: "sql"; sql: string }
  | { type: "chart"; chart: ApiChart }
  | { type: "result"; reply: string; sql_used: string[] }
  | { type: "error"; detail: string }
  | { type: "done"; usage?: UsageInfo };

export function chatSocketUrl(sessionId: string): string {
  return `${API_BASE.replace(/^http/, "ws")}/ws/chat/${sessionId}`;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new ApiError(
      0,
      "Could not reach the backend. Make sure it's running on " + API_BASE
    );
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

export function uploadFiles(files: File[], context?: string): Promise<UploadResult> {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  if (context?.trim()) form.append("context", context.trim());
  return request<UploadResult>("/api/upload", { method: "POST", body: form });
}

export function loadSample(name: string, context?: string): Promise<UploadResult> {
  const query = context?.trim() ? `?context=${encodeURIComponent(context.trim())}` : "";
  return request<UploadResult>(`/api/samples/${name}${query}`, { method: "POST" });
}

export function updateContext(sessionId: string, context: string): Promise<{ extra_context: string | null }> {
  return request(`/api/context/${sessionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context }),
  });
}

export function getSchema(sessionId: string): Promise<ApiSchema> {
  return request<ApiSchema>(`/api/schema/${sessionId}`);
}

export function getDashboard(sessionId: string): Promise<ApiDashboard> {
  return request<ApiDashboard>(`/api/dashboard/${sessionId}`);
}

export function getUsage(
  sessionId: string
): Promise<{ session: UsageInfo; global: UsageInfo }> {
  return request(`/api/usage/${sessionId}`);
}

export function runQuery(
  sessionId: string,
  sql: string
): Promise<{ data: Record<string, unknown>[] }> {
  return request(`/api/query/${sessionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
}

export function sendChat(sessionId: string, message: string): Promise<ChatResult> {
  return request<ChatResult>(`/api/chat/${sessionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}
