import Replicate from "replicate";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { MODEL_GENERATIONS_PRICE } from "@/constants";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, duration } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt || typeof prompt !== "string") {
      return new NextResponse("Valid text prompt is required", { status: 400 });
    }

    // Sanitize and validate input
    const cleanText = prompt.trim();
    if (cleanText.length === 0) {
      return new NextResponse("Prompt cannot be empty", { status: 400 });
    }

    if (cleanText.length > 5000) {
      return new NextResponse("Prompt is too long (max 5000 characters)", {
        status: 400,
      });
    }

    // Validate duration
    const validDurations = ["5", "10", "20", "30", "60"];
    const speechDuration = duration && validDurations.includes(duration) ? parseInt(duration) : 5;

    const apiGenerations = await checkApiLimit(
      MODEL_GENERATIONS_PRICE.speecGeneration
    );

    if (!apiGenerations) {
      return new NextResponse(
        "Your generation limit has been reached. Please purchase additional generations.",
        { status: 403 }
      );
    }

    console.log("[SPEECH] Generating speech for text length:", cleanText.length, "Duration:", speechDuration);

    // Use a more stable TTS model with better error handling
    const response = await replicate.run(
      "suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787",
      {
        input: {
          prompt: cleanText,
          text_temp: 0.7,
          waveform_temp: 0.7,
          output_full: false,
        },
      }
    );

    console.log("[SPEECH] Speech generation successful");

    await incrementApiLimit(MODEL_GENERATIONS_PRICE.speecGeneration);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[SPEECH_ERROR]", error);
    
    // Provide more detailed error information
    if (error instanceof Error) {
      console.error("[SPEECH_ERROR] Message:", error.message);
      console.error("[SPEECH_ERROR] Stack:", error.stack);

      // Check for specific Replicate errors
      if (error.message.includes("Prediction failed")) {
        return new NextResponse(
          "Speech generation failed. Please try again with different text.",
          { status: 500 }
        );
      }
    }

    return new NextResponse("Speech generation error. Please try again.", {
      status: 500,
    });
  }
}
