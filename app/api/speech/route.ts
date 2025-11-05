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

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!duration) {
      return new NextResponse("Duration is required", { status: 400 });
    }

    const apiGenerations = await checkApiLimit(
      MODEL_GENERATIONS_PRICE.speecGeneration
    );

    if (!apiGenerations) {
      return new NextResponse(
        "Your generation limit has been reached. Please purchase additional generations.",
        { status: 403 }
      );
    }

    console.log("[SPEECH] Generating speech - Duration:", duration, "seconds");

    // Use Bark TTS model - duration controls audio length
    const response = await replicate.run(
      "suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787",
      {
        input: {
          prompt: prompt,
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
    console.log("[SPEECH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
