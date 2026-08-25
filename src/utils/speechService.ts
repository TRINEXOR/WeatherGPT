// Speech synthesis utility for multilingual natural weather briefings

export interface VoiceInfo {
  lang: string;
  voice: SpeechSynthesisVoice | null;
}

// Clean markdown and convert weather symbols/units to natural spoken language
export function cleanTextForSpeech(text: string, isHindiOrDevanagari: boolean): string {
  if (!text) return '';

  let cleaned = text;

  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');

  // Remove emojis and common weather icons
  cleaned = cleaned.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1FA70}-\u{1FAFF}]/gu,
    ''
  );

  // Remove markdown blockquotes markers (> ⚠️, > 💡, >, etc.)
  cleaned = cleaned.replace(/^>\s*(⚠️|💡|✅|🚨)?\s*/gm, '');

  // Remove markdown headings (###, ##, #)
  cleaned = cleaned.replace(/^#{1,6}\s*/gm, '');

  // Remove markdown bold, italic, code markers
  cleaned = cleaned.replace(/[*_~`]/g, '');

  // Remove markdown horizontal rules
  cleaned = cleaned.replace(/^---$/gm, '');

  // Convert table separators
  cleaned = cleaned.replace(/\|/g, ', ');

  // Natural pronunciation for units based on language
  if (isHindiOrDevanagari) {
    cleaned = cleaned
      .replace(/(\d+)\s*°C/gi, '$1 डिग्री सेल्सियस')
      .replace(/(\d+)\s*°F/gi, '$1 डिग्री फ़ारेनहाइट')
      .replace(/(\d+)\s*km\/h/gi, '$1 किलोमीटर प्रति घंटा')
      .replace(/(\d+)\s*किमी\/घंटा/gi, '$1 किलोमीटर प्रति घंटा')
      .replace(/(\d+)\s*hPa/gi, '$1 हेक्टोपास्कल')
      .replace(/(\d+)\s*mm/gi, '$1 मिलीमीटर')
      .replace(/(\d+)\s*मिमी/gi, '$1 मिलीमीटर')
      .replace(/(\d+)\s*%/g, '$1 प्रतिशत')
      .replace(/PM\s*2\.5/gi, 'पी एम 2.5')
      .replace(/PM\s*10/gi, 'पी एम 10')
      .replace(/AQI/gi, 'ए क्यू आई')
      .replace(/UV/gi, 'यू वी')
      .replace(/IMD/gi, 'आई एम डी')
      .replace(/WMO/gi, 'डब्लू एम ओ');
  } else {
    cleaned = cleaned
      .replace(/(\d+)\s*°C/gi, '$1 degrees Celsius')
      .replace(/(\d+)\s*°F/gi, '$1 degrees Fahrenheit')
      .replace(/(\d+)\s*km\/h/gi, '$1 kilometers per hour')
      .replace(/(\d+)\s*hPa/gi, '$1 hectopascals')
      .replace(/(\d+)\s*mm/gi, '$1 millimeters')
      .replace(/(\d+)\s*%/g, '$1 percent')
      .replace(/PM\s*2\.5/gi, 'P M 2.5')
      .replace(/PM\s*10/gi, 'P M 10')
      .replace(/AQI/gi, 'A Q I')
      .replace(/UV/gi, 'U V');
  }

  // Convert bullet points to natural commas and pauses
  cleaned = cleaned.replace(/^[-•*]\s+/gm, '');

  // Normalize multiple spaces and extra linebreaks into single pauses
  cleaned = cleaned
    .replace(/\n+/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\.{2,}/g, '.')
    .trim();

  return cleaned;
}

// Detect language and find the most natural matching voice
export function detectLanguageAndVoice(text: string): { lang: string; voice: SpeechSynthesisVoice | null } {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { lang: 'en-IN', voice: null };
  }

  const voices = window.speechSynthesis.getVoices() || [];
  const textSample = text.slice(0, 500);

  // 1. Check for Devanagari script (Hindi / Marathi)
  const isDevanagari = /[\u0900-\u097F]/.test(textSample);

  if (isDevanagari) {
    const isMarathi = /आहे|नाही|पाऊस|हवामान|उद्या|शेतकरी|पडेल|दिनांक/.test(textSample);
    const targetLang = isMarathi ? 'mr-IN' : 'hi-IN';

    // Priority 1: Exact language match (e.g. hi-IN or mr-IN)
    let matched = voices.find(
      (v) => v.lang.toLowerCase() === targetLang.toLowerCase()
    );

    // Priority 2: Any Hindi/Indian regional voice
    if (!matched) {
      matched = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('हिन्दी') ||
          v.name.toLowerCase().includes('hemant') ||
          v.name.toLowerCase().includes('swara') ||
          v.name.toLowerCase().includes('lekha') ||
          v.name.toLowerCase().includes('madhav') ||
          v.name.toLowerCase().includes('kalpana')
      );
    }

    // Priority 3: Marathi voice if available
    if (!matched && isMarathi) {
      matched = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('mr') ||
          v.name.toLowerCase().includes('marathi')
      );
    }

    // Fallback: If no dedicated Hindi voice is installed locally, hi-IN lang tag triggers browser cloud TTS
    return {
      lang: targetLang,
      voice: matched || null,
    };
  }

  // 2. Check for other Indian regional scripts
  if (/[\u0980-\u09FF]/.test(textSample)) {
    // Bengali
    const matched = voices.find((v) => v.lang.toLowerCase().startsWith('bn'));
    return { lang: 'bn-IN', voice: matched || null };
  }
  if (/[\u0B80-\u0BFF]/.test(textSample)) {
    // Tamil
    const matched = voices.find((v) => v.lang.toLowerCase().startsWith('ta'));
    return { lang: 'ta-IN', voice: matched || null };
  }
  if (/[\u0C00-\u0C7F]/.test(textSample)) {
    // Telugu
    const matched = voices.find((v) => v.lang.toLowerCase().startsWith('te'));
    return { lang: 'te-IN', voice: matched || null };
  }
  if (/[\u0A80-\u0AFF]/.test(textSample)) {
    // Gujarati
    const matched = voices.find((v) => v.lang.toLowerCase().startsWith('gu'));
    return { lang: 'gu-IN', voice: matched || null };
  }
  if (/[\u0C80-\u0CFF]/.test(textSample)) {
    // Kannada
    const matched = voices.find((v) => v.lang.toLowerCase().startsWith('kn'));
    return { lang: 'kn-IN', voice: matched || null };
  }
  if (/[\u0D00-\u0D7F]/.test(textSample)) {
    // Malayalam
    const matched = voices.find((v) => v.lang.toLowerCase().startsWith('ml'));
    return { lang: 'ml-IN', voice: matched || null };
  }
  if (/[\u0A00-\u0A7F]/.test(textSample)) {
    // Punjabi
    const matched = voices.find((v) => v.lang.toLowerCase().startsWith('pa'));
    return { lang: 'pa-IN', voice: matched || null };
  }

  // 3. Check for Romanized Hindi keywords
  const isRomanizedHindi = /\b(namaste|barish|mausam|garmi|tapman|kaisa|aaj|kal|hawa|pradushan|paus|havaman)\b/i.test(
    textSample
  );
  if (isRomanizedHindi) {
    const matched = voices.find(
      (v) =>
        v.lang.toLowerCase() === 'hi-in' ||
        v.lang.toLowerCase().startsWith('hi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.lang.toLowerCase() === 'en-in'
    );
    return { lang: 'hi-IN', voice: matched || null };
  }

  // 4. Default English: Prefer Indian English (en-IN), then natural English
  const englishVoice =
    voices.find((v) => v.lang.toLowerCase() === 'en-in') ||
    voices.find((v) => v.name.toLowerCase().includes('india')) ||
    voices.find((v) => v.lang.toLowerCase() === 'en-gb') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    null;

  return {
    lang: 'en-IN',
    voice: englishVoice,
  };
}
