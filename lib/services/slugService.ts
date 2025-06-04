// services/slugService.ts
import axios from "axios";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY; // Add your key to .env

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, "")
    .replace(/\\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function aiSlugify(name: string, description: string) {
  const prompt = `Generate a short, SEO-friendly URL slug for this prompt. Only return the slug, no extra text.\nPrompt Name: ${name}\nPrompt Description: ${description}`;
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 16,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    let slug = response.data.choices[0].message.content.trim();
    slug = slug.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
    return slug || slugify(name);
  } catch (e) {
    return slugify(name);
  }
}