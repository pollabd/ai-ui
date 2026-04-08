import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";
import { APP_LAYOUT_CONFIG_PROMPT } from "@/data/prompt";
import { db } from "@/config/db";
import { ProjectTable, ScreenConfigTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userInput, deviceType, projectId } = await req.json();

    // Inject device type into system prompt
    const systemPrompt = `
${APP_LAYOUT_CONFIG_PROMPT.replace("{deviceType}", deviceType)}

IMPORTANT:
- Return ONLY valid JSON
- No explanation
- No markdown
- No extra text
`;

    const userPrompt = userInput;

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

    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (err) {
      return NextResponse.json(
        {
          error: "Invalid JSON from model",
          raw: cleanText,
        },
        { status: 500 },
      );
    }

    if (parsed) {
      await db
        .update(ProjectTable)
        .set({
          projectVisualDescription: parsed.projectVisualDescription,
          projectName: parsed.projectName,
          theme: parsed.theme,
        })
        .where(eq(ProjectTable.projectId, projectId as string));

      parsed?.screens?.forEach(async (screen: any) => {
        const result = await db.insert(ScreenConfigTable).values({
          projectId: projectId,
          purpose: screen?.purpose,
          screenDescription: screen?.layoutDescription,
          screenId: screen?.id,
          screenName: screen?.name,
        });
      });

      return NextResponse.json(parsed);
    } else {
      return NextResponse.json({ message: "Internal server error!" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { APP_LAYOUT_CONFIG_PROMPT } from "@/data/prompt";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// export async function POST(req: NextRequest) {
//   try {
//     const { userInput, deviceType, projectId } = await req.json();

//     const systemPrompt = APP_LAYOUT_CONFIG_PROMPT.replace("{deviceType}", deviceType);

//     const userPrompt = userInput;

//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash",
//     });

//     const result = await model.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [
//             {
//               text: `${systemPrompt}\n\n${userPrompt}`,
//             },
//           ],
//         },
//       ],
//     });

//     const text = result?.response?.text?.();

//     console.log("Gemini response:", text);

//     return new Response(text);
//   } catch (error: any) {
//     console.error("🔥 GEMINI ERROR:", error);

//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// import { openrouter } from "@/config/openrouter";
// import { APP_LAYOUT_CONFIG_PROMPT } from "@/data/prompt";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { userInput, deviceType, projectId } = await req.json();

//     const aiResult = await openrouter.chat.send({
//       chatRequest: {
//         model: "openai/gpt-5.1-codex-mini",
//         messages: [
//           {
//             role: "system",
//             content: [
//               {
//                 type: "text",
//                 text: APP_LAYOUT_CONFIG_PROMPT.replace("{deviceType}", deviceType),
//               },
//             ],
//           },
//           {
//             role: "user",
//             content: [
//               {
//                 type: "text",
//                 text: userInput,
//               },
//             ],
//           },
//         ],
//         stream: false,
//       },
//     });

//     console.log(aiResult);

//     return new Response(aiResult?.choices[0]?.message?.content);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// import { openrouter } from "@/config/openrouter";
// import { APP_LAYOUT_CONFIG_PROMPT } from "@/data/prompt";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { userInput, deviceType, projectId } = await req.json();

//     if (!userInput || !deviceType) {
//       return NextResponse.json({ error: "Missing userInput or deviceType" }, { status: 400 });
//     }

//     const aiResult = await openrouter.chat.send({
//       chatRequest: {
//         model: "qwen/qwen3-coder:free",
//         messages: [
//           {
//             role: "system",
//             content: APP_LAYOUT_CONFIG_PROMPT.replace("{deviceType}", deviceType),
//           },
//           {
//             role: "user",
//             content: userInput,
//           },
//         ],
//         stream: false,
//       },
//     });

//     console.log("OpenRouter raw response:", aiResult);

//     const content = aiResult?.choices?.[0]?.message?.content;

//     if (!content) {
//       console.error("No content in AI response:", aiResult);
//       return NextResponse.json({ error: "AI returned empty response" }, { status: 502 });
//     }

//     return NextResponse.json({
//       success: true,
//       config: content,
//     });
//   } catch (error: any) {
//     console.error("Generate config error:", error);

//     const status = error.response?.status || 500;
//     const message = error.response?.data?.error?.message || error.message;

//     return NextResponse.json(
//       {
//         error: "Failed to generate config",
//         details: message,
//       },
//       { status },
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { APP_LAYOUT_CONFIG_PROMPT } from "@/data/prompt";

// const apiKey = process.env.GEMINI_API_KEY;

// if (!apiKey) {
//   console.warn("⚠️ GEMINI_API_KEY is missing in environment variables");
// }

// const genAI = new GoogleGenerativeAI(apiKey || "");

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const { userInput, deviceType, projectId } = body;

//     if (!userInput || !deviceType) {
//       return NextResponse.json(
//         { error: "Missing required fields: userInput or deviceType" },
//         { status: 400 },
//       );
//     }

//     if (!apiKey) {
//       throw new Error("GEMINI_API_KEY is not configured");
//     }

//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash",
//     });

//     const systemPrompt = APP_LAYOUT_CONFIG_PROMPT.replace("{deviceType}", deviceType);

//     const finalPrompt = `
// ${systemPrompt}

// User Input:
// ${userInput}
// `;

//     const result = await model.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [{ text: finalPrompt }],
//         },
//       ],
//     });

//     console.log("✅ Gemini raw response:", JSON.stringify(result, null, 2));

//     const text = result?.response?.text?.();

//     if (!text) {
//       throw new Error("Empty response from Gemini");
//     }

//     return new Response(text, {
//       status: 200,
//       headers: {
//         "Content-Type": "text/plain",
//       },
//     });
//   } catch (error: any) {
//     console.error("🔥 GEMINI API ERROR:", error);

//     return NextResponse.json(
//       {
//         error: error?.message || "Internal Server Error",
//         details: error?.response?.data || null,
//       },
//       { status: 500 },
//     );
//   }
// }
