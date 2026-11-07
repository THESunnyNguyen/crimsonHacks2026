// Downscale on the phone before upload: a 12 MP photo becomes ~300 KB, which
// uploads fast on a hotspot and stays under Vercel's 4.5 MB body limit. The
// server resizes again with sharp, so this is only an optimization.
const MAX_SIDE = 1024;

export async function shrinkPhoto(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    return blob && blob.size > 0 && blob.size < file.size ? blob : file;
  } catch {
    return file; // e.g. a format the browser can't decode; the server tries
  }
}
