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
  face_limit?: number;
  auto_size?: boolean;
  negative_prompt?: string;
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
      ...(options?.face_limit ? { face_limit: options.face_limit } : {}),
      ...(options?.auto_size !== undefined ? { auto_size: options.auto_size } : {}),
      ...(options?.negative_prompt ? { negative_prompt: options.negative_prompt } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 403 && err.includes("credit")) {
      throw new Error("Tu cuenta de Tripo3D no tiene créditos suficientes. Recarga en tripo3d.ai para generar modelos 3D.");
    }
    throw new Error(`Tripo3D error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function createImageTo3D(imageToken: string, options?: {
  model_version?: string;
  texture?: boolean;
  pbr?: boolean;
  face_limit?: number;
  auto_size?: boolean;
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
      ...(options?.face_limit ? { face_limit: options.face_limit } : {}),
      ...(options?.auto_size !== undefined ? { auto_size: options.auto_size } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function createMultiviewTo3D(imageTokens: string[], options?: {
  model_version?: string;
  texture?: boolean;
  pbr?: boolean;
}) {
  const files = imageTokens.map(token => ({ type: "jpg", file_token: token }));
  const res = await fetch(`${TRIPO_API_BASE}/task`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "multiview_to_model",
      files,
      model_version: options?.model_version || "v2.0-20240919",
      texture: options?.texture !== false,
      pbr: options?.pbr !== false,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D multiview error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function retopologyModel(draftTaskId: string, options?: {
  target_face_count?: number;
  topology?: "quad" | "triangle";
}) {
  const res = await fetch(`${TRIPO_API_BASE}/task`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "retopology",
      draft_model_task_id: draftTaskId,
      ...(options?.target_face_count ? { target_face_count: options.target_face_count } : {}),
      ...(options?.topology ? { topology: options.topology } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D retopology error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function rigModel(draftTaskId: string, options?: {
  model_version?: string;
}) {
  const res = await fetch(`${TRIPO_API_BASE}/task`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "animate_rig",
      original_model_task_id: draftTaskId,
      ...(options?.model_version ? { out_format: options.model_version } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D rig error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function retargetAnimation(rigTaskId: string, animationName: string) {
  const res = await fetch(`${TRIPO_API_BASE}/task`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "animate_retarget",
      original_model_task_id: rigTaskId,
      animation: animationName,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D retarget error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function textureModel(draftTaskId: string, options?: {
  texture_quality?: string;
  texture_alignment?: string;
}) {
  const res = await fetch(`${TRIPO_API_BASE}/task`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "texture_model",
      original_model_task_id: draftTaskId,
      ...(options?.texture_quality ? { texture_quality: options.texture_quality } : {}),
      ...(options?.texture_alignment ? { texture_alignment: options.texture_alignment } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D texture error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function stylizeModel(draftTaskId: string, style: string) {
  const res = await fetch(`${TRIPO_API_BASE}/task`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "stylize_model",
      original_model_task_id: draftTaskId,
      style,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D stylize error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function convertModel(draftTaskId: string, format: string, options?: {
  quad?: boolean;
  face_limit?: number;
  flatten_bottom?: boolean;
  flatten_bottom_threshold?: number;
  texture_size?: number;
  texture_format?: string;
  pivot_to_center_bottom?: boolean;
}) {
  const res = await fetch(`${TRIPO_API_BASE}/task`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "convert_model",
      original_model_task_id: draftTaskId,
      format,
      ...(options?.quad !== undefined ? { quad: options.quad } : {}),
      ...(options?.face_limit ? { face_limit: options.face_limit } : {}),
      ...(options?.flatten_bottom !== undefined ? { flatten_bottom: options.flatten_bottom } : {}),
      ...(options?.texture_size ? { texture_size: options.texture_size } : {}),
      ...(options?.texture_format ? { texture_format: options.texture_format } : {}),
      ...(options?.pivot_to_center_bottom !== undefined ? { pivot_to_center_bottom: options.pivot_to_center_bottom } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tripo3D convert error: ${res.status} ${err}`);
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

export async function getTripoBalance(): Promise<{ balance: number; frozen: number }> {
  const res = await fetch(`${TRIPO_API_BASE.replace('/openapi', '/openapi')}/user/balance`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) {
    return { balance: 0, frozen: 0 };
  }
  const data = await res.json();
  return data.data || { balance: 0, frozen: 0 };
}

export const TRIPO_ANIMATIONS = [
  { id: "preset:idle", name: "Idle", category: "Básico" },
  { id: "preset:walk", name: "Caminar", category: "Básico" },
  { id: "preset:run", name: "Correr", category: "Básico" },
  { id: "preset:jump", name: "Saltar", category: "Básico" },
  { id: "preset:dance", name: "Bailar", category: "Emociones" },
  { id: "preset:cheer", name: "Celebrar", category: "Emociones" },
  { id: "preset:cry", name: "Llorar", category: "Emociones" },
  { id: "preset:afraid", name: "Miedo", category: "Emociones" },
  { id: "preset:angry", name: "Enfadado", category: "Emociones" },
  { id: "preset:bow", name: "Reverencia", category: "Emociones" },
  { id: "preset:climb", name: "Escalar", category: "Acción" },
  { id: "preset:cast_a_spell", name: "Lanzar Hechizo", category: "Acción" },
  { id: "preset:punch", name: "Puñetazo", category: "Acción" },
  { id: "preset:kick", name: "Patada", category: "Acción" },
  { id: "preset:slash", name: "Espadazo", category: "Acción" },
  { id: "preset:shoot", name: "Disparar", category: "Acción" },
  { id: "preset:throw", name: "Lanzar", category: "Acción" },
  { id: "preset:basketball_shot", name: "Tiro de Baloncesto", category: "Deporte" },
  { id: "preset:boxing", name: "Boxeo", category: "Deporte" },
  { id: "preset:sit", name: "Sentarse", category: "Básico" },
  { id: "preset:wave", name: "Saludar", category: "Emociones" },
  { id: "preset:clap", name: "Aplaudir", category: "Emociones" },
];

export const TRIPO_STYLES = [
  { id: "cartoon", name: "Cartoon", icon: "🎨" },
  { id: "clay", name: "Arcilla / Clay", icon: "🏺" },
  { id: "lego", name: "LEGO", icon: "🧱" },
  { id: "voxel", name: "Voxel", icon: "🎮" },
  { id: "voronoi", name: "Voronoi", icon: "🔷" },
  { id: "minecraft", name: "Minecraft", icon: "⛏️" },
  { id: "christmas", name: "Navidad", icon: "🎄" },
  { id: "steampunk", name: "Steampunk", icon: "⚙️" },
];

export const TRIPO_EXPORT_FORMATS = [
  { id: "glb", name: "GLB (GLTF Binary)", description: "Web, juegos, visor 3D", icon: "🌐" },
  { id: "fbx", name: "FBX", description: "Unity, Unreal Engine, Blender", icon: "🎮" },
  { id: "obj", name: "OBJ", description: "Software 3D genérico", icon: "📦" },
  { id: "stl", name: "STL", description: "Impresión 3D", icon: "🖨️" },
  { id: "usdz", name: "USDZ", description: "Apple AR, Realidad Aumentada", icon: "📱" },
];
