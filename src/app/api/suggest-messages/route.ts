
import { GoogleGenerativeAI } from '@google/generative-ai';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY is not defined");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = await  genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const message = await req.json();
    const prompt = message.body

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const output = await response.text();
    console.log(result);
    return NextResponse.json({output:output})

  }catch (error: any) {
      console.error("Error in route.ts:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Internal Server Error 2" }),
        { status: 500 }
      );
    }
  }  
  
