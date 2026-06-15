import JSZip from "jszip";

export const compressBlob = async (
  blob: Blob,
  qualityPercent: number
): Promise<Blob> => {
  if (qualityPercent >= 100) return blob;

  const quality = qualityPercent / 100;
  const img = new Image();
  const url = URL.createObjectURL(blob);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  // Заливка белым, чтобы PNG не ложился на чёрный фон
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);

  const outType = blob.type === "image/webp" ? "image/webp" : "image/jpeg";

  return new Promise((resolve) => {
    canvas.toBlob(
      (b) => resolve(b || blob),
      outType,
      quality
    );
  });
};

export const extractDocxImages = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const images: { path: string; blob: Blob; size: number }[] = [];

  const entries = Object.entries(zip.files).filter(
    ([path, entry]) => path.startsWith("word/media/") && !entry.dir
  );

  for (const [path, entry] of entries) {
    const blob = await entry.async("blob");
    images.push({ path, blob, size: blob.size });
  }

  images.sort((a, b) => a.path.localeCompare(b.path));

  return { zip, images };
};
