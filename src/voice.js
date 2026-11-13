// Read aloud: the browser's own text-to-speech (the Web Speech API's speechSynthesis) reads a step
// to you. It's off until you turn it on with the 🔊 button at the top of a lesson, and the choice is
// remembered in this browser. Nothing is sent anywhere: the voice comes from your computer or phone.

export const VOICE_KEY = 'codeforge.voice';

/**
 * Turns a step's Markdown into plain sentences worth hearing: code blocks are skipped (reading code
 * symbol by symbol helps no one), a diagram becomes "Diagram: <caption>", and links, bold, headings,
 * table pipes and list markers are dropped so only the words are left.
 */
export function speakableText(md = '') {
  const out = [];
  const lines = String(md).split('\n');
  for (let i = 0; i < lines.length; i++) {
    const fence = lines[i].match(/^```(\w*)\s*(.*)$/);
    if (fence) {
      if (fence[1] === 'svg' && fence[2].trim()) out.push(`Diagram: ${fence[2].trim()}.`);
      for (i++; i < lines.length && !/^```\s*$/.test(lines[i]); i++);
      continue;
    }
    let l = lines[i];
    if (/^\s*\|?[\s:-]+\|[\s|:-]*$/.test(l)) continue;                 // a table's --- divider row
    l = l.replace(/^\s{0,3}#{1,6}\s+/, '')                              // headings
      .replace(/^\s*>\s?/, '')                                          // tips
      .replace(/^\s*(?:[-*+]|\d+\.)\s+/, '')                            // list markers
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')                         // images: their alt text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')                          // links: their words
      .replace(/(\*\*|__|\*|_)(\S(?:.*?\S)?)\1/g, '$2')                 // bold and italics
      .replace(/`([^`]+)`/g, '$1')                                      // inline code: the word itself
      .replace(/\s*\|\s*/g, ', ').replace(/^,\s*|,\s*$/g, '')           // table cells, read as a list
      .trim();
    if (l) out.push(l);
  }
  return out.join('\n').replace(/\n{2,}/g, '\n').trim();
}

/**
 * Splits text into pieces short enough to speak in one go. Some browsers stop a long utterance
 * partway, so each sentence (or a long one cut at a comma or space) is queued on its own.
 */
export function chunks(text, max = 220) {
  const pieces = [];
  for (const line of String(text).split('\n')) {
    for (let s of line.match(/[^.!?]+[.!?]*\s*/g) ?? []) {
      s = s.trim();
      while (s.length > max) {
        let cut = s.lastIndexOf(', ', max);
        if (cut < max / 2) cut = s.lastIndexOf(' ', max);
        if (cut < 1) cut = max;
        pieces.push(s.slice(0, cut + 1).trim());
        s = s.slice(cut + 1).trim();
      }
      if (s) pieces.push(s);
    }
  }
  return pieces;
}

/** The on/off switch and the speaking itself. `synth` is window.speechSynthesis (or a fake in tests). */
export class Voice {
  constructor(storage, synth = globalThis.speechSynthesis, Utterance = globalThis.SpeechSynthesisUtterance) {
    this.storage = storage;
    this.synth = synth;
    this.Utterance = Utterance;
  }

  /** True when this browser can speak. */
  get supported() { return Boolean(this.synth && this.Utterance); }

  /** Whether read aloud is turned on (off until you choose it). */
  get on() {
    try { return this.storage?.getItem(VOICE_KEY) === 'on'; } catch { return false; }
  }

  set on(value) {
    try { this.storage?.setItem(VOICE_KEY, value ? 'on' : 'off'); } catch { /* the choice just isn't remembered */ }
    if (!value) this.stop();
  }

  /** Reads the text from the start, replacing anything already being read. */
  speak(text) {
    if (!this.supported) return 0;
    this.stop();
    const parts = chunks(text);
    for (const part of parts) {
      const u = new this.Utterance(part);
      u.rate = 1;
      this.synth.speak(u);
    }
    return parts.length;
  }

  stop() { if (this.supported) this.synth.cancel(); }
}
