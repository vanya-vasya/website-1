import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { MODEL_GENERATIONS_PRICE } from "@/constants";

export const maxDuration = 300;

// Retry helper with exponential backoff (same as conversation API)
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  baseDelay = 1500
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error?.status && error.status < 500) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        console.error(
          `[SPEECH] All ${maxRetries} retry attempts failed. Last error:`,
          error?.status,
          error?.request_id
        );
        break;
      }

      // Exponential backoff with jitter: 1.5s, 3s, 6s, 12s
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = delay * 0.2 * (Math.random() - 0.5);
      const finalDelay = Math.round(delay + jitter);

      console.log(
        `[SPEECH] Retry attempt ${attempt + 1}/${maxRetries} after ${finalDelay}ms (OpenAI server error)`
      );
      await new Promise((resolve) => setTimeout(resolve, finalDelay));
    }
  }

  throw lastError;
}

export async function POST(req: Request) {
  try {
    // Lazy initialization of OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 0, // We handle retries manually
      timeout: 60000, // 60 second timeout
    });

    const { userId } = auth();
    console.log("[SPEECH] User ID:", userId);

    const body = await req.json();
    const { prompt, voice = "alloy", model = "tts-1" } = body;

    if (!userId) {
      console.error("[SPEECH] No user ID found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("[SPEECH] OpenAI API key not configured");
      return new NextResponse("OpenAI API Key not configured.", {
        status: 500,
      });
    }

    if (!prompt || typeof prompt !== "string") {
      console.error("[SPEECH] Invalid prompt provided");
      return new NextResponse("Valid prompt is required", { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    if (cleanPrompt.length === 0) {
      return new NextResponse("Prompt cannot be empty", { status: 400 });
    }

    if (cleanPrompt.length > 4096) {
      return new NextResponse("Prompt is too long (max 4096 characters)", {
        status: 400,
      });
    }

    console.log("[SPEECH] Checking API limit for user:", userId);
    const apiGenerations = await checkApiLimit(
      MODEL_GENERATIONS_PRICE.speecGeneration
    );
    console.log("[SPEECH] API limit check result:", apiGenerations);

    if (!apiGenerations) {
      console.error("[SPEECH] User has insufficient credits");
      return new NextResponse(
        "Your generation limit has been reached. Please purchase additional generations.",
        { status: 403 }
      );
    }

    console.log("[SPEECH] Generating speech with OpenAI TTS");

    // Use retry logic for OpenAI TTS API call
    const mp3Response = await retryWithBackoff(
      async () => {
        return await openai.audio.speech.create({
          model: model,
          voice: voice,
          input: cleanPrompt,
        });
      },
      3,
      1000
    );

    console.log("[SPEECH] Speech generation successful");

    // Convert response to buffer and then to base64 for JSON response
    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    const base64Audio = buffer.toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log("[SPEECH] Incrementing API limit");
    await incrementApiLimit(MODEL_GENERATIONS_PRICE.speecGeneration);
    console.log("[SPEECH] API limit incremented successfully");

    return NextResponse.json({ audio: audioUrl });
  } catch (error: any) {
    console.error("[SPEECH_ERROR]", error);

    // Log detailed error information
    if (error?.status) {
      console.error("[SPEECH_ERROR] Status:", error.status);
      console.error("[SPEECH_ERROR] Request ID:", error.request_id);
    }

    if (error instanceof Error) {
      console.error("[SPEECH_ERROR] Message:", error.message);
      console.error("[SPEECH_ERROR] Stack:", error.stack);
    }

    // Handle specific OpenAI errors
    if (error?.status === 400) {
      return new NextResponse(
        error?.error?.message || "Invalid request to OpenAI",
        { status: 400 }
      );
    }

    if (error?.status === 429) {
      return new NextResponse(
        "Rate limit exceeded. Please try again in a moment.",
        { status: 429 }
      );
    }

    if (error?.status === 500 || error?.status === 503) {
      return new NextResponse(
        JSON.stringify({
          error:
            "OpenAI is experiencing temporary server issues. Your credits were NOT charged. Please try again in a few moments.",
          details: "We attempted multiple retries but the service is currently unavailable.",
          requestId: error?.request_id,
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic error
    return new NextResponse(
      JSON.stringify({
        error:
          "Failed to generate speech. Your credits were NOT charged. Please try again.",
        details: error?.message || "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
