import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { athlete } = body;

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile is required" },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",

      instructions: `
You are the planning engine for TriCoach.

Create a safe, realistic 7-day triathlon training plan for an age-group athlete.

The athlete is not a professional. The plan must fit normal life and prioritize consistency.

ATHLETE PROFILE:
Name: ${athlete.name || "Unknown"}
Goal: ${athlete.goal || "Unknown"}
Race date: ${athlete.raceDate || "Unknown"}
Available training time: ${athlete.hoursPerWeek || "Unknown"} hours/week
Weakest discipline: ${athlete.weakestDiscipline || "Unknown"}

PLANNING PRINCIPLES:
- Balance swim, bike, run and recovery.
- Prioritize the weakest discipline where sensible.
- Do not stack unnecessary hard sessions.
- Avoid more than 2 demanding sessions in the week for a beginner/intermediate athlete.
- Include at least 1 proper recovery/rest day.
- Keep total planned training reasonably close to the athlete's available weekly hours.
- For beginner swimmers, prioritize technique and aerobic confidence.
- Long bike sessions are generally safer than very long runs for adding endurance volume.
- Do not prescribe extreme intensity or volume.
- Do not diagnose medical conditions.
- Explain the purpose of each workout clearly.
- Use simple language.

Return ONLY valid JSON.

The JSON must use exactly this structure:

{
  "summary": "Short explanation of the week",
  "totalHours": 8,
  "focus": "Main focus of this week",
  "days": [
    {
      "day": "Monday",
      "sport": "Rest",
      "title": "Recovery day",
      "durationMinutes": 0,
      "intensity": "Rest",
      "purpose": "Why this day is planned this way",
      "details": [
        "Optional mobility",
        "Easy walking if desired"
      ]
    }
  ]
}

Rules:
- Include exactly 7 days, Monday through Sunday.
- sport must be one of: Swim, Bike, Run, Strength, Rest
- durationMinutes must be a number.
- Return no markdown.
- Return no text before or after the JSON.
      `,

      input: `
Create the athlete's first training week now.
      `,
    });

    let plan;

    try {
      plan = JSON.parse(response.output_text);
    } catch {
      console.error("Invalid plan JSON:", response.output_text);

      return NextResponse.json(
        { error: "Coach returned an invalid training plan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      plan,
    });
  } catch (error) {
    console.error("TriCoach plan API error:", error);

    return NextResponse.json(
      { error: "Could not generate training plan" },
      { status: 500 }
    );
  }
}
