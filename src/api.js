import { MAIN_API } from './config/api';

export function apiBase() {
  return MAIN_API;
}

function endpoint(path) {
  return `${apiBase()}${path}`;
}

export function toAssetUrl(path) {
  if (!path) {
    return "";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${apiBase()}${path}`;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  // Increase timeout to 120 seconds for catalogue operations (embeddings + Pinecone can be slow)
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      ...options
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError" || err.message.includes("abort")) {
      throw new Error("Request timed out after 120s. Backend is slow or disconnected.");
    } else {
      throw new Error(err.message || "Failed to connect to backend");
    }
  }
}

export async function detectTiles(file) {
  const fd = new FormData();
  fd.append("image", file);

  const url = endpoint("/api/v1/detect_tiles");
  console.log("[detectTiles] Sending POST to:", url);
  console.log("[detectTiles] API Base:", apiBase());
  console.log("[detectTiles] File:", file.name, file.size);

  return fetchWithTimeout(url, {
    method: "POST",
    body: fd,
  });
}

export async function findSimilarByCrop(crop, topK = 5) {
  const fd = new FormData();
  fd.append("crop", crop);
  fd.append("top_k", String(topK));

  return fetchWithTimeout(endpoint("/api/v1/find_similar"), {
    method: "POST",
    body: fd,
  });
}

export async function getCatalogueStats() {
  return fetchWithTimeout(endpoint("/api/v1/catalogue/stats"));
}

export async function addSingleTile({ imageFile, img_name, img_url, size, texture, color }) {
  const fd = new FormData();
  fd.append("image", imageFile);
  fd.append("img_name", img_name || "");
  fd.append("img_url", img_url || "");
  fd.append("size", size || "");
  fd.append("texture", texture || "");
  fd.append("color", color || "");

  return fetchWithTimeout(endpoint("/api/v1/catalogue/add"), {
    method: "POST",
    body: fd,
  });
}

export async function addBatchTiles({ images, csvFile }) {
  const fd = new FormData();
  images.forEach((img) => fd.append("images", img));
  fd.append("csv_file", csvFile);

  return fetchWithTimeout(endpoint("/api/v1/catalogue/add"), {
    method: "POST",
    body: fd,
  });
}

export async function addZipTiles({ zipFile }) {
  const fd = new FormData();
  fd.append("zip_file", zipFile);

  return fetchWithTimeout(endpoint("/api/v1/catalogue/add"), {
    method: "POST",
    body: fd,
  });
}

export async function searchCatalogueByName(query, limit = 20) {
  return fetchWithTimeout(
    endpoint(`/api/v1/catalogue/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  );
}

export async function getCatalogueTile(faissId) {
  return fetchWithTimeout(endpoint(`/api/v1/catalogue/tile/${faissId}`));
}

export async function updateCatalogueTile(faissId, updates) {
  const fd = new FormData();
  if (updates.img_url !== undefined) fd.append("img_url", updates.img_url);
  if (updates.size !== undefined) fd.append("size", updates.size);
  if (updates.texture !== undefined) fd.append("texture", updates.texture);
  if (updates.color !== undefined) fd.append("color", updates.color);

  return fetchWithTimeout(endpoint(`/api/v1/catalogue/tile/${faissId}`), {
    method: "PUT",
    body: fd,
  });
}

export async function deleteCatalogueTile(faissId) {
  return fetchWithTimeout(endpoint(`/api/v1/catalogue/tile/${faissId}`), {
    method: "DELETE",
  });
}
