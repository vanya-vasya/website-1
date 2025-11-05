import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

// import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { MODEL_GENERATIONS_PRICE } from "@/constants";

export const maxDuration = 300;

// Retry helper with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx) or rate limits
      if (error?.status && error.status < 500) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(
        `[IMAGE] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
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
    const body = await req.json();
    const {
      prompt,
      amount = 1,
      resolution = "1024x1024",
      model = "dall-e-3",
    } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API Key not configured.", {
        status: 500,
      });
    }

    // Validate and sanitize inputs
    if (!prompt || typeof prompt !== "string") {
      return new NextResponse("Valid prompt is required", { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    if (cleanPrompt.length === 0) {
      return new NextResponse("Prompt cannot be empty", { status: 400 });
    }

    if (cleanPrompt.length > 4000) {
      return new NextResponse("Prompt is too long (max 4000 characters)", {
        status: 400,
      });
    }

    const numImages = parseInt(amount, 10);
    if (isNaN(numImages) || numImages < 1 || numImages > 10) {
      return new NextResponse("Amount must be between 1 and 10", {
        status: 400,
      });
    }

    const validResolutions = ["1024x1024", "1792x1024", "1024x1792"];
    if (!validResolutions.includes(resolution)) {
      return new NextResponse("Invalid resolution", { status: 400 });
    }

    const apiGenerations = await checkApiLimit(
      MODEL_GENERATIONS_PRICE.imageGeneration
    );

    if (!apiGenerations) {
      return new NextResponse(
        "Your generation limit has been reached. Please purchase additional generations.",
        { status: 403 }
      );
    }

    console.log(
      `[IMAGE] Generating ${numImages} image(s) with model: ${model}, resolution: ${resolution}`
    );

    // Use retry logic for OpenAI API call
    const response = await retryWithBackoff(
      async () => {
        return await openai.images.generate({
          prompt: cleanPrompt,
          n: numImages,
          size: resolution as "1024x1024" | "1792x1024" | "1024x1792",
          model: model,
        });
      },
      3,
      1000
    );

    console.log("[IMAGE] Image generation successful");

    await incrementApiLimit(MODEL_GENERATIONS_PRICE.imageGeneration);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("[IMAGE_ERROR]", error);

    // Log detailed error information
    if (error?.status) {
      console.error("[IMAGE_ERROR] Status:", error.status);
      console.error("[IMAGE_ERROR] Request ID:", error.request_id);
    }

    if (error instanceof Error) {
      console.error("[IMAGE_ERROR] Message:", error.message);
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
        "OpenAI service is temporarily unavailable. Please try again in a moment.",
        { status: 503 }
      );
    }

    // Generic error
    return new NextResponse(
      "Failed to generate image. Please try again.",
      { status: 500 }
    );
  }
}
