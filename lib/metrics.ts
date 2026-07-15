import { prisma } from "@/lib/prisma"
import { getGithubAccessToken, fetchGithubEvents } from "@/lib/github"

type DayBucket = {
  commits: number
  lateNightCommits: number
  repos: Set<string>
  hourCounts: Record<number, number>
  reviewTurnarounds: number[]
}

function getDateKey(iso: string) {
  return iso.slice(0, 10) // "YYYY-MM-DD"
}

export async function syncDailyMetrics(userId: string) {
  const accessToken = await getGithubAccessToken(userId)
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user?.githubUsername) {
    throw new Error("User has no linked GitHub username")
  }

  const events = await fetchGithubEvents(accessToken, user.githubUsername)
  const buckets = new Map<string, DayBucket>()

  const getBucket = (dateKey: string) => {
    if (!buckets.has(dateKey)) {
      buckets.set(dateKey, {
        commits: 0,
        lateNightCommits: 0,
        repos: new Set(),
        hourCounts: {},
        reviewTurnarounds: [],
      })
    }
    return buckets.get(dateKey)!
  }

  for (const event of events) {
    const createdAt = new Date(event.created_at)
    const dateKey = getDateKey(event.created_at)
    const hour = createdAt.getUTCHours()

    if (event.type === "PushEvent") {
      const bucket = getBucket(dateKey)
      const commitCount = event.payload?.commits?.length ?? 0

      bucket.commits += commitCount
      bucket.repos.add(event.repo.name)
      bucket.hourCounts[hour] = (bucket.hourCounts[hour] ?? 0) + commitCount

      // Approximation: GitHub only gives one timestamp per push,
      // not per individual commit — so all commits in a push
      // are attributed to the push's hour.
      if (hour >= 23 || hour < 5) {
        bucket.lateNightCommits += commitCount
      }
    }

    if (
      event.type === "PullRequestEvent" &&
      event.payload?.action === "closed" &&
      event.payload?.pull_request?.merged
    ) {
      const pr = event.payload.pull_request
      const opened = new Date(pr.created_at).getTime()
      const merged = new Date(pr.merged_at).getTime()
      const turnaroundHours = (merged - opened) / (1000 * 60 * 60)

      const bucket = getBucket(dateKey)
      bucket.reviewTurnarounds.push(turnaroundHours)
      bucket.repos.add(event.repo.name)
    }
  }

  const results = []

  for (const [dateKey, bucket] of buckets) {
    const productivityHour = Object.entries(bucket.hourCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0]

    const avgTurnaround =
      bucket.reviewTurnarounds.length > 0
        ? bucket.reviewTurnarounds.reduce((a, b) => a + b, 0) /
          bucket.reviewTurnarounds.length
        : null

    const metric = await prisma.dailyMetric.upsert({
      where: { userId_date: { userId, date: new Date(dateKey) } },
      create: {
        userId,
        date: new Date(dateKey),
        commits: bucket.commits,
        lateNightCommits: bucket.lateNightCommits,
        reposActive: bucket.repos.size,
        reviewTurnaround: avgTurnaround,
        productivityHour: productivityHour ? parseInt(productivityHour) : null,
      },
      update: {
        commits: bucket.commits,
        lateNightCommits: bucket.lateNightCommits,
        reposActive: bucket.repos.size,
        reviewTurnaround: avgTurnaround,
        productivityHour: productivityHour ? parseInt(productivityHour) : null,
      },
    })

    results.push(metric)
  }

  return results
}