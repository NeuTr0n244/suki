let isSpeaking = false;

function splitText(text: string, max = 180): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > max) {
      if (current) chunks.push(current.trim());
      current = s;
    } else current += s;
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

async function playChunk(text: string): Promise<void> {
  return new Promise((resolve) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}

export async function speak(text: string, onStart?: () => void, onEnd?: () => void) {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('suki-sound') === 'false') return;

  // Clean text: remove emoji, markdown, special chars for cleaner speech
  const clean = text.replace(/[^\w\s.,!?'$%+-]/g, '').replace(/\s+/g, ' ').trim();
  if (!clean) return;

  const chunks = splitText(clean);
  isSpeaking = true;
  onStart?.();

  for (const chunk of chunks) {
    await playChunk(chunk);
  }

  isSpeaking = false;
  onEnd?.();
}

export function getIsSpeaking() {
  return isSpeaking;
}

export function setSoundEnabled(on: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('suki-sound', String(on));
  }
}

export function isSoundEnabled() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('suki-sound') !== 'false';
  }
  return true;
}
