function triggerDownload(url: string, filename: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "chart";
}

export function downloadChartCsv(title: string, data: Record<string, unknown>[]): void {
  if (data.length === 0) return;
  const columns = Object.keys(data[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [columns.join(","), ...data.map((row) => columns.map((c) => escape(row[c])).join(","))];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(title)}.csv`);
  URL.revokeObjectURL(url);
}

export async function downloadChartImage(title: string, node: HTMLElement): Promise<void> {
  const { default: html2canvas } = await import("html2canvas-pro");
  const nodeBg = getComputedStyle(node).backgroundColor;
  const bg = nodeBg && nodeBg !== "rgba(0, 0, 0, 0)" ? nodeBg : getComputedStyle(document.body).backgroundColor;
  const canvas = await html2canvas(node, { backgroundColor: bg || "#000000", scale: 2 });
  const url = canvas.toDataURL("image/png");
  triggerDownload(url, `${slugify(title)}.png`);
}
