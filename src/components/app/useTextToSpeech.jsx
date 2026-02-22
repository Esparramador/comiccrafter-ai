import { useCallback, useState } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  const speak = useCallback(async (text, options = {}) => {
    try {
      setIsPlaying(true);
      setError(null);
      
      await TextToSpeech.speak({
        text,
        lang: options.lang || 'es-ES',
        rate: options.rate || 1.0,
        pitch: options.pitch || 1.0,
        volume: options.volume || 1.0,
      });
      
      setIsPlaying(false);
    } catch (err) {
      setError(err.message);
      setIsPlaying(false);
      console.error('TTS Error:', err);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await TextToSpeech.stop();
      setIsPlaying(false);
    } catch (err) {
      console.error('Stop TTS Error:', err);
    }
  }, []);

  return { speak, stop, isPlaying, error };
};