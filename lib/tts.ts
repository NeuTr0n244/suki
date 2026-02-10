let isSpeaking = false;
let currentAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

// Clean text for TTS (remove markdown, emojis, special characters)
function cleanTextForTTS(text: string): string {
  return text
    .replace(/[*_~`#\[\]]/g, '') // Remove markdown
    .replace(/[^\w\s.,!?'$%+-]/g, '') // Remove emojis and special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Unlock audio context (needed for autoplay on most browsers)
export function unlockAudio() {
  if (audioUnlocked) return;

  try {
    // Create and play a silent audio to unlock autoplay
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    silentAudio.play().then(() => {
      audioUnlocked = true;
      console.log('[TTS] Audio unlocked successfully');
    }).catch(() => {
      console.warn('[TTS] Audio unlock failed - user interaction may be needed');
    });
  } catch (error) {
    console.warn('[TTS] Audio unlock error:', error);
  }
}

// Call ElevenLabs TTS API via our backend endpoint
async function generateSpeech(text: string): Promise<Blob | null> {
  try {
    console.log('[TTS] Generating speech for text:', text.substring(0, 50) + '...');

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TTS] API error:', response.status, errorText);
      return null;
    }

    const blob = await response.blob();
    console.log('[TTS] Speech generated successfully:', blob.size, 'bytes');
    return blob;
  } catch (error) {
    console.error('[TTS] Fetch error:', error);
    return null;
  }
}

// Play audio blob
async function playAudio(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(audioBlob);
    currentAudio = new Audio(url);

    console.log('[TTS] Attempting to play audio...');

    currentAudio.onended = () => {
      console.log('[TTS] Audio playback ended');
      URL.revokeObjectURL(url);
      currentAudio = null;
      resolve();
    };

    currentAudio.onerror = (error) => {
      console.error('[TTS] Audio playback error:', error);
      URL.revokeObjectURL(url);
      currentAudio = null;
      reject(error);
    };

    currentAudio.play().then(() => {
      console.log('[TTS] Audio playing successfully');
      audioUnlocked = true; // Mark as unlocked after successful play
    }).catch((error) => {
      console.error('[TTS] Audio play error (likely autoplay blocked):', error.message);
      URL.revokeObjectURL(url);
      currentAudio = null;
      reject(error);
    });
  });
}

// Main speak function using ElevenLabs
export async function speak(text: string, onStart?: () => void, onEnd?: () => void) {
  // Only run on client-side
  if (typeof window === 'undefined') {
    console.log('[TTS] Skipping - not on client-side');
    return;
  }

  // Check if sound is enabled
  if (!isSoundEnabled()) {
    console.log('[TTS] Sound is disabled by user');
    return;
  }

  // Stop any currently playing audio
  stopSpeaking();

  // Clean text for TTS
  const cleanText = cleanTextForTTS(text);
  if (!cleanText) {
    console.log('[TTS] No text to speak after cleaning');
    return;
  }

  console.log('[TTS] Starting speech process...');

  try {
    isSpeaking = true;
    onStart?.();

    // Generate speech using ElevenLabs
    const audioBlob = await generateSpeech(cleanText);

    if (audioBlob) {
      await playAudio(audioBlob);
    } else {
      console.error('[TTS] No audio blob generated');
    }
  } catch (error) {
    console.error('[TTS] Speech error:', error);
  } finally {
    isSpeaking = false;
    onEnd?.();
  }
}

// Stop current speech
export function stopSpeaking() {
  if (currentAudio) {
    console.log('[TTS] Stopping current audio');
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
    console.log('[TTS] Sound enabled set to:', on);
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const enabled = localStorage.getItem('suki-sound') !== 'false';
    console.log('[TTS] Sound enabled:', enabled);
    return enabled;
  }
  return true;
}
