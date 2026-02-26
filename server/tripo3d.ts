const TRIPO_API_BASE = "https://api.tripo3d.ai/v2/openapi";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.TRIPO3D_API_KEY}`,
  };
}

export async function createTextTo3D(prompt: string, options?: {
  model_version?: string;
  texture?: boolean;
  pbr?: boolean;
}) {
  const res = await fetch(`${TRIPO_API_BASE}/task`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "text_to_model",
      prompt,
      model_version: options?.model_version || "v2.0-20240919",
      texture: options?.texture !== false,
      pbr: options?.pbr !== false,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function createImageTo3D(imageToken: string, options?: {
  model_version?: string;
  texture?: boolean;
  pbr?: boolean;
}) {
  const res = await fetch(`${TRIPO_API_BASE}/task`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "image_to_model",
      file: { type: "jpg", file_token: imageToken },
      model_version: options?.model_version || "v2.0-20240919",
      texture: options?.texture !== false,
      pbr: options?.pbr !== false,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function uploadImageToTripo(imageBuffer: Buffer, filename: string) {
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/jpeg" });
  formData.append("file", blob, filename);

  const res = await fetch(`${TRIPO_API_BASE}/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.TRIPO3D_API_KEY}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D upload error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function getTaskStatus(taskId: string) {
  const res = await fetch(`${TRIPO_API_BASE}/task/${taskId}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D status error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function downloadModel(taskId: string): Promise<{ glbUrl: string; fbxUrl?: string }> {
  const status = await getTaskStatus(taskId);
  if (status.data?.status !== "success") {
    throw new Error(`Task not complete. Status: ${status.data?.status}`);
  }
  return {
    glbUrl: status.data?.output?.model || "",
    fbxUrl: status.data?.output?.fbx_model || "",
  };
}
