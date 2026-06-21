/**
 * One-time generator: produce Hindi translations for every CAREER_QUESTIONS
 * question and answer option, then print the FULL updated array as TypeScript
 * code you can paste directly into src/services/careerService.ts.
 *
 * Run manually (NOT part of the running server):
 *   npm run generate:hindi-questions
 *
 * This script ONLY reads CAREER_QUESTIONS and prints code to the console.
 * It writes NOTHING to any database and does not touch interest_responses.
 *
 * After it finishes, review the Hindi quality in the printed block, then paste
 * the block (interfaces + array) into careerService.ts.
 */
import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import { CAREER_QUESTIONS } from "../src/services/careerService";

// Same primary model the AI counselling feature uses.
const GEMINI_MODEL = "gemini-2.5-flash";
const DELAY_BETWEEN_CALLS_MS = 1000;

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment");
  }
  return new GoogleGenerativeAI(apiKey);
}

const genAI = getGeminiClient();
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

function buildPrompt(text: string): string {
  return `Translate the following text to simple, clear Hindi using Devanagari script. The audience is school students aged 11-17 in rural India, many in Hindi-medium schools. Keep sentences short and easy to understand. Do not use complex or formal vocabulary. Only return the translated Hindi text, nothing else, no explanation, no quotes.

Text to translate: ${text}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Short option phrases should not end with sentence punctuation. Strip a
// trailing Hindi danda (। / ॥) or Latin .!? — questions keep their punctuation.
function stripTrailingPunctuation(text: string): string {
  return text.replace(/[।॥.!?]+\s*$/u, "").trim();
}

const translationCache = new Map<string, string>();

interface TranslateResult {
  hindi: string;
  ok: boolean;
}

async function translateToHindi(text: string): Promise<TranslateResult> {
  const trimmed = text.trim();
  const cached = translationCache.get(trimmed);
  if (cached !== undefined) {
    return { hindi: cached, ok: true };
  }

  try {
    const result = await model.generateContent(buildPrompt(trimmed));
    const hindi = result.response.text().trim();
    if (!hindi) {
      throw new Error("empty translation");
    }
    translationCache.set(trimmed, hindi);
    await sleep(DELAY_BETWEEN_CALLS_MS);
    return { hindi, ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ! Failed to translate "${trimmed}": ${message}`);
    // Fall back to the English text so the array stays valid; flagged below.
    return { hindi: trimmed, ok: false };
  }
}

interface OutputOption {
  text: string;
  text_hi: string;
}

interface OutputQuestion {
  id: number;
  text: string;
  text_hi: string;
  category: string;
  cluster_tag: string;
  options: OutputOption[];
}

function serializeArray(questions: OutputQuestion[]): string {
  const lines: string[] = [];
  lines.push("export interface QuizOption {");
  lines.push("  text: string;");
  lines.push("  text_hi: string;");
  lines.push("}");
  lines.push("");
  lines.push("export interface CareerQuestion {");
  lines.push("  id: number;");
  lines.push("  text: string;");
  lines.push("  text_hi: string;");
  lines.push("  category: string;");
  lines.push("  cluster_tag: string;");
  lines.push("  options: QuizOption[];");
  lines.push("}");
  lines.push("");
  lines.push("export const CAREER_QUESTIONS: CareerQuestion[] = [");

  for (const q of questions) {
    lines.push("  {");
    lines.push(`    id: ${q.id},`);
    lines.push(`    text: ${JSON.stringify(q.text)},`);
    lines.push(`    text_hi: ${JSON.stringify(q.text_hi)},`);
    lines.push(`    category: ${JSON.stringify(q.category)},`);
    lines.push(`    cluster_tag: ${JSON.stringify(q.cluster_tag)},`);
    lines.push("    options: [");
    for (const opt of q.options) {
      lines.push(
        `      { text: ${JSON.stringify(opt.text)}, text_hi: ${JSON.stringify(opt.text_hi)} },`
      );
    }
    lines.push("    ],");
    lines.push("  },");
  }

  lines.push("];");
  return lines.join("\n");
}

async function main(): Promise<void> {
  console.log(`Generating Hindi for ${CAREER_QUESTIONS.length} questions using "${GEMINI_MODEL}"...\n`);

  const output: OutputQuestion[] = [];
  let failures = 0;
  let translatedStrings = 0;

  for (let i = 0; i < CAREER_QUESTIONS.length; i++) {
    const q = CAREER_QUESTIONS[i];
    const position = `${i + 1}/${CAREER_QUESTIONS.length}`;

    const questionResult = await translateToHindi(q.text);
    translatedStrings++;
    if (!questionResult.ok) failures++;
    console.log(
      `Q ${position}: [${q.text}] -> [${questionResult.hindi}]${questionResult.ok ? "" : "  (FALLBACK: English kept)"}`
    );

    const options: OutputOption[] = [];
    for (const option of q.options) {
      const optionText = option.text;
      const optionResult = await translateToHindi(optionText);
      translatedStrings++;
      if (!optionResult.ok) failures++;
      const optionHindi = stripTrailingPunctuation(optionResult.hindi);
      console.log(
        `    - [${optionText}] -> [${optionHindi}]${optionResult.ok ? "" : "  (FALLBACK: English kept)"}`
      );
      options.push({ text: optionText, text_hi: optionHindi });
    }

    output.push({
      id: q.id,
      text: q.text,
      text_hi: questionResult.hindi,
      category: q.category,
      cluster_tag: q.cluster_tag,
      options,
    });
  }

  console.log("\n========== SUMMARY ==========");
  console.log(`Strings processed : ${translatedStrings}`);
  console.log(`Failures (fallback to English) : ${failures}`);
  console.log("=============================\n");

  console.log("Review the Hindi above, then paste the block below into");
  console.log("src/services/careerService.ts (replacing the current interface + array):\n");
  console.log("// ============ PASTE START ============");
  console.log(serializeArray(output));
  console.log("// ============ PASTE END ============");

  if (failures > 0) {
    console.warn(
      `\nNOTE: ${failures} string(s) failed and kept English as a placeholder. ` +
        "Re-run the script or fix those entries by hand before pasting."
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Script crashed:", err);
    process.exit(1);
  });
