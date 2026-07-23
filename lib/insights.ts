import { prisma } from "@/lib/prisma";

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function generateInsight(userId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const metrics = await prisma.dailyMetric.findMany({
    where: { userId, date: { gte: sevenDaysAgo } },
    orderBy: { date: "asc" },
  });

  if (metrics.length === 0) {
    throw new Error("No recent activity to generate an insight from.");
  }

  const totalCommits = metrics.reduce((sum, m) => sum + m.commits, 0);
  const totalLateNight = metrics.reduce((sum, m) => sum + m.lateNightCommits, 0);
  const activeDays = metrics.filter((m) => m.commits > 0).length;
  const avgCommitsPerActiveDay = activeDays > 0 ? (totalCommits / activeDays).toFixed(1) : "0";
  const lateNightRatio = totalCommits > 0 ? Math.round((totalLateNight / totalCommits) * 100) : 0;

  const dailyBreakdown = metrics
    .map((m) => `${m.date.toISOString().slice(0, 10)}: ${m.commits} commits`)
    .join(", ");

  const prompt = `Here is a developer's GitHub activity for the past 7 days:
- Total commits: ${totalCommits}
- Active days: ${activeDays} of ${metrics.length}
- Average commits per active day: ${avgCommitsPerActiveDay}
- Late-night (23:00-05:00 UTC) commit ratio: ${lateNightRatio}%
- Daily breakdown: ${dailyBreakdown}

Write a 2-3 sentence observational summary of this week's activity pattern.
Rules:
- Only describe what the data shows. Do not give advice, suggestions, or recommendations.
- Do not use words like "should," "try," "consider," or "recommend."
- Do not restate every number — synthesize a pattern (e.g. consistency, clustering, timing) in plain language.
- When referring to the late-night metric, call it "late-night (UTC)" or "UTC late-night hours" — do not imply it reflects the developer's local time.
- Neutral, factual tone — not motivational or judgmental.`;

  const content = await callGeminiWithRetry(prompt);
  const weekOf = getStartOfWeek(new Date());

  const insight = await prisma.insight.upsert({
    where: { userId_weekOf: { userId, weekOf } },
    update: { content },
    create: { userId, weekOf, content },
  });

  return insight;
}
async function callGeminiWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY as string,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!content) throw new Error("Gemini returned no content.");
      return content;
    }

    // Only retry on transient errors — overloaded (503) or rate-limited (429).
    // Anything else (bad key, bad request, quota) won't fix itself by waiting.
    if (response.status === 503 || response.status === 429) {
      const errText = await response.text();
      lastError = new Error(`Gemini API error: ${response.status} ${errText}`);
      if (attempt < maxRetries) {
        const delayMs = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
    } else {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errText}`);
    }
  }

  throw lastError ?? new Error("Gemini API failed after retries.");
}