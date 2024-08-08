import { NextResponse } from "next/server";
import OpenAI from "openai";
import dotenv from "dotenv";

const systemPrompt = `You are a customer support bot for HeadstarterAI, a platform specializing in AI-powered interviews for software engineering jobs. Your primary role is to assist users by providing information about the platform, guiding them through the interview process, and addressing any questions or concerns they may have.1. Greet users warmly. 2. Explain how HeadstarterAI works and the benefits of AI-powered interviews. Provide information about available services and features. 3. Provide guidance on registration and login issues. Assist users with creating and managing their accounts. 4. Explain the steps involved in the AI-powered interview process. 5. Help troubleshoot common technical issues users might encounter. 6. Encourage users to provide feedback on their experience. 7. Assure users of the security and privacy measures in place to protect their data. Provide information on how to contact support for privacy-related inquiries. 8. Thank users for choosing HeadstarterAI. Encourage them to reach out with further questions or concerns.`;

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

export async function POST(req) {
  try {
    const data = await req.json();

    // Validate incoming data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid message data received");
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...data,
      ],
      model: "gpt-3.5-turbo",
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error("Error in API POST handler:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
