export const maxRecordingMs = 60_000;

export class RecordingLimitError extends Error {
  constructor() {
    super("Recording is over 60 seconds or 10 MB.");
  }
}

// Starts a hold-to-talk recording. onLimit fires once at 60 seconds; the caller
// then calls stop() as it would after a release.
export async function startRecording(
  onLimit: () => void,
): Promise<{ stop: () => Promise<Blob> }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.addEventListener("dataavailable", (e) => chunks.push(e.data));
  const stopped = new Promise<Blob>((resolve) => {
    recorder.addEventListener("stop", () => {
      stream.getTracks().forEach((track) => track.stop());
      resolve(new Blob(chunks, { type: recorder.mimeType }));
    });
  });
  recorder.start();
  const limit = setTimeout(onLimit, maxRecordingMs);
  return {
    stop: () => {
      clearTimeout(limit);
      if (recorder.state !== "inactive") recorder.stop();
      return stopped;
    },
  };
}

// MediaRecorder supplies the recording; decoding locally gives a verifiable WAV
// duration on the server across Safari MP4 and Chromium WebM containers.
export async function recordingWav(blob: Blob): Promise<Blob> {
  const context = new AudioContext();
  try {
    const audio = await context.decodeAudioData(await blob.arrayBuffer());
    if (audio.duration > 60) throw new RecordingLimitError();
    const size = audio.length * 2;
    if (size + 44 > 10 * 1024 * 1024) throw new RecordingLimitError();
    const buffer = new ArrayBuffer(44 + size);
    const v = new DataView(buffer);
    const tag = (offset: number, text: string) =>
      [...text].forEach((c, i) => v.setUint8(offset + i, c.charCodeAt(0)));
    tag(0, "RIFF");
    v.setUint32(4, 36 + size, true);
    tag(8, "WAVE");
    tag(12, "fmt ");
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);
    v.setUint32(24, audio.sampleRate, true);
    v.setUint32(28, audio.sampleRate * 2, true);
    v.setUint16(32, 2, true);
    v.setUint16(34, 16, true);
    tag(36, "data");
    v.setUint32(40, size, true);
    const channels = Array.from({ length: audio.numberOfChannels }, (_, c) =>
      audio.getChannelData(c),
    );
    for (let i = 0; i < audio.length; i++) {
      const mixed = channels.reduce((sum, c) => sum + c[i], 0) / channels.length;
      const sample = Math.max(-1, Math.min(1, mixed));
      v.setInt16(44 + i * 2, sample * (sample < 0 ? 32768 : 32767), true);
    }
    return new Blob([buffer], { type: "audio/wav" });
  } finally {
    await context.close();
  }
}
