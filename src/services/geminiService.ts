import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface LyricLine {
  text: string;
  duration: number; // in seconds
}

export interface ComfortSong {
  title: string;
  lyrics: LyricLine[];
  endingMessage: string;
}

export async function generateComfortSong(mood: string): Promise<ComfortSong> {
  const prompt = `You are a tiny, awkward, but deeply sincere cartoon blob mascot for a "Cryoke" (Cry + Karaoke) website. 
  The user is feeling: "${mood}".
  Your job is to write a short, funny, and "emotionally illegal" comfort song to sing to them.
  The song should be awkward and use internet meme energy.
  It should NOT be polished or smart. It should be "pathetic but lovable" and 100% sincere.
  
  SINGING STYLE:
  - Mention that you are trying to find a melody but probably failing.
  - Use lots of punctuation for emphasis (e.g., !! ~~~ ...).
  - The song is in English but for a global audience, so use simple but funny words.
  
  Example style:
  - "you survived another dayyyy~ even though life hit you with a chairrr~"
  - "your boss may hate your powerpoint~ but i think your aura is stronggg~"
  
  The output must be a JSON object with:
  - title (funny/awkward name)
  - lyrics (an array of {text, duration} where duration is how long to show the line, approx 3-5s each)
  - endingMessage (a soft, sincere parting thought like "please drink water today")
  
  Make it about 6-8 lines total. Include dramatic punctuation like ~ and extra vowels for "singing" effect.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            lyrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  duration: { type: Type.NUMBER }
                },
                required: ["text", "duration"]
              }
            },
            endingMessage: { type: Type.STRING }
          },
          required: ["title", "lyrics", "endingMessage"]
        }
      }
    });

    const text = response.text;
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to generate song:", error);
    // Fallback song
    return {
      title: "The Panic Song",
      lyrics: [
        { text: "oh noooo you are sad todayyy~", duration: 4 },
        { text: "life is like a wet sock in your shoe~", duration: 4 },
        { text: "but at least you have meeee~", duration: 4 },
        { text: "tiny blob guy for youuuu~", duration: 4 },
        { text: "please don't cry too much because it's messy~", duration: 5 }
      ],
      endingMessage: "i'm not good at this but i like you anyway."
    };
  }
}
