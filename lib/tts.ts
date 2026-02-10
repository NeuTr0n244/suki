import { setGlobalSpeaking } from './speaking-context';

let isSpeaking = false;
let currentAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

// Audio queue for playing multiple messages sequentially
const audioQueue: string[] = [];
let isProcessingQueue = false;

// Clean text for TTS (remove markdown, emojis, special characters)
function cleanTextForTTS(text: string): string {
  return text
    .replace(/[*_~`#\[\]]/g, '') // Remove markdown
    .replace(/[^\w\s.,!?'$%+-]/g, '') // Remove emojis and special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Split text into sentences for faster streaming
function splitIntoSentences(text: string): string[] {
  const sentences = text.match(/[^.!?~]+[.!?~]+/g) || [text];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
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
    console.log('[TTS] Generating speech for:', text.substring(0, 50) + '...');

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
    console.log('[TTS] Speech generated:', blob.size, 'bytes');
    return blob;
  } catch (error) {
    console.error('[TTS] Fetch error:', error);
    return null;
  }
}

// Play audio blob
async function playAudioBlob(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(audioBlob);
    currentAudio = new Audio(url);

    console.log('[TTS] Playing audio...');

    currentAudio.onended = () => {
      console.log('[TTS] Audio playback ended');
      URL.revokeObjectURL(url);
      currentAudio = null;

      // Only stop animation if queue is empty
      if (audioQueue.length === 0) {
        setGlobalSpeaking(false);
      }

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
      audioUnlocked = true;

      // Start animation when audio actually starts playing
      setGlobalSpeaking(true);
    }).catch((error) => {
      console.error('[TTS] Audio play error:', error.message);
      URL.revokeObjectURL(url);
      currentAudio = null;

      // Stop animation on error
      if (audioQueue.length === 0) {
        setGlobalSpeaking(false);
      }

      reject(error);
    });
  });
}

// Process next item in the queue
async function processNextInQueue() {
  if (audioQueue.length === 0) {
    isProcessingQueue = false;
    isSpeaking = false;
    setGlobalSpeaking(false); // Stop animation when queue finishes
    console.log('[TTS] Queue finished');
    return;
  }

  isProcessingQueue = true;
  isSpeaking = true;

  const text = audioQueue.shift();
  if (!text) {
    processNextInQueue();
    return;
  }

  console.log('[TTS] Processing from queue:', text.substring(0, 50) + '...');

  try {
    const audioBlob = await generateSpeech(text);
    if (audioBlob) {
      await playAudioBlob(audioBlob);
    }
  } catch (error) {
    console.error('[TTS] Queue playback error:', error);
  }

  // Play next in queue
  processNextInQueue();
}

// Add text to queue and start processing if not already
function queueSpeech(text: string) {
  audioQueue.push(text);
  console.log('[TTS] Added to queue. Queue length:', audioQueue.length);

  if (!isProcessingQueue) {
    processNextInQueue();
  }
}

// Main speak function - splits text into sentences and queues each one
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

  // Clean text for TTS
  const cleanText = cleanTextForTTS(text);
  if (!cleanText) {
    console.log('[TTS] No text to speak after cleaning');
    return;
  }

  console.log('[TTS] Starting speech process...');
  onStart?.();

  // Split into sentences for faster streaming
  const sentences = splitIntoSentences(cleanText);
  console.log('[TTS] Split into', sentences.length, 'sentences');

  // Add each sentence to the queue
  for (const sentence of sentences) {
    if (sentence.length > 0) {
      queueSpeech(sentence);
    }
  }

  // Call onEnd when the ENTIRE queue is finished (not just this text)
  // For simplicity, we'll call it after a small delay
  // In production, you'd want a more sophisticated callback system
  setTimeout(() => {
    if (!isProcessingQueue) {
      onEnd?.();
    }
  }, 100);
}

// Stop current speech and clear queue
export function stopSpeaking() {
  console.log('[TTS] Stopping all speech and clearing queue');

  // Clear queue
  audioQueue.length = 0;

  // Stop current audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  isProcessingQueue = false;
  isSpeaking = false;

  // Stop animation
  setGlobalSpeaking(false);
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
    return enabled;
  }
  return true;
}
