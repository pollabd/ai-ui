import { db } from "@/config/db";
import { ScreenConfigTable } from "@/config/schema";
import { GENERATE_SCREEN_PROMPT } from "@/data/prompt";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

export async function POST(req: NextRequest) {
  const { projectId, screenId, screenName, purpose, screenDescription, projectVisualDescription } =
    await req.json();

  const userInput = `
    screen Name is : ${screenName}
    screen Purpose : ${purpose}
    screen Description: ${screenDescription}
    `;

  const systemPrompt = GENERATE_SCREEN_PROMPT;

  const userPrompt = userInput;

  try {
    const response = await ollama.chat({
      model: "glm-5.1:cloud",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    let text = response?.message?.content || "";
    const updateResult = await db
      .update(ScreenConfigTable)
      .set({ code: text as string })
      .where(
        and(
          eq(ScreenConfigTable.projectId, projectId),
          eq(ScreenConfigTable.screenId, screenId as string),
        ),
      );

    // console.log(updateResult);

    return NextResponse.json(updateResult);
  } catch (error) {
    NextResponse.json({ message: "Internal server error" });
  }
}
