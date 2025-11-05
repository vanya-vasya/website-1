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

      // Don't retry on client errors (4xx)
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
        `[CONVERSATION] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`
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
    console.log("[CONVERSATION] User ID:", userId);

    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      console.error("[CONVERSATION] No user ID found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("[CONVERSATION] OpenAI API key not configured");
      return new NextResponse("OpenAI API Key not configured.", {
        status: 500,
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("[CONVERSATION] Invalid messages provided");
      return new NextResponse("Valid messages array is required", {
        status: 400,
      });
    }

    console.log("[CONVERSATION] Checking API limit for user:", userId);
    const apiGenerations = await checkApiLimit(
      MODEL_GENERATIONS_PRICE.conversation
    );
    console.log("[CONVERSATION] API limit check result:", apiGenerations);

    if (!apiGenerations) {
      console.error("[CONVERSATION] User has insufficient credits");
      return new NextResponse(
        "Your generation limit has been reached. Please purchase additional generations.",
        { status: 403 }
      );
    }

    console.log("[CONVERSATION] Calling OpenAI API");

    // Use retry logic for OpenAI API call
    const response = await retryWithBackoff(
      async () => {
        return await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages,
        });
      },
      3,
      1000
    );

    console.log("[CONVERSATION] OpenAI API response received");

    console.log("[CONVERSATION] Incrementing API limit");
    await incrementApiLimit(MODEL_GENERATIONS_PRICE.conversation);
    console.log("[CONVERSATION] API limit incremented successfully");

    return NextResponse.json(response.choices[0].message);
  } catch (error: any) {
    console.error("[CONVERSATION_ERROR]", error);

    // Log detailed error information
    if (error?.status) {
      console.error("[CONVERSATION_ERROR] Status:", error.status);
      console.error("[CONVERSATION_ERROR] Request ID:", error.request_id);
    }

    if (error instanceof Error) {
      console.error("[CONVERSATION_ERROR] Message:", error.message);
      console.error("[CONVERSATION_ERROR] Stack:", error.stack);
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
      "Failed to process conversation. Please try again.",
      { status: 500 }
    );
  }
}
