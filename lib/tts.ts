let isSpeaking = false;
let currentAudio: HTMLAudioElement | null = null;

// Clean text for TTS (remove markdown, emojis, special characters)
function cleanTextForTTS(text: string): string {
  return text
    .replace(/[*_~`#\[\]]/g, '') // Remove markdown
    .replace(/[^\w\s.,!?'$%+-]/g, '') // Remove emojis and special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Call ElevenLabs TTS API via our backend endpoint
async function generateSpeech(text: string): Promise<Blob | null> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error('TTS API error:', response.status);
      return null;
    }

    return await response.blob();
  } catch (error) {
    console.error('TTS fetch error:', error);
    return null;
  }
}

// Play audio blob
async function playAudio(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(audioBlob);
    currentAudio = new Audio(url);

    currentAudio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      resolve();
    };

    currentAudio.onerror = (error) => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      console.error('Audio playback error:', error);
      reject(error);
    };

    currentAudio.play().catch((error) => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      console.error('Audio play error:', error);
      reject(error);
    });
  });
}

// Main speak function using ElevenLabs
export async function speak(text: string, onStart?: () => void, onEnd?: () => void) {
  // Only run on client-side
  if (typeof window === 'undefined') return;

  // Check if sound is enabled
  if (!isSoundEnabled()) return;

  // Stop any currently playing audio
  stopSpeaking();

  // Clean text for TTS
  const cleanText = cleanTextForTTS(text);
  if (!cleanText) return;

  try {
    isSpeaking = true;
    onStart?.();

    // Generate speech using ElevenLabs
    const audioBlob = await generateSpeech(cleanText);

    if (audioBlob) {
      await playAudio(audioBlob);
    }
  } catch (error) {
    console.error('Speech error:', error);
  } finally {
    isSpeaking = false;
    onEnd?.();
  }
}

// Stop current speech
export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  isSpeaking = false;
}

// Get speaking status
export function getIsSpeaking() {
  return isSpeaking;
}

// Sound settings (stored in localStorage)
export function setSoundEnabled(on: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('suki-sound', String(on));
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('suki-sound') !== 'false';
  }
  return true;
}
