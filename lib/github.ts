import { prisma } from "@/lib/prisma"

export async function getGithubAccessToken(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  })

  if (!account?.access_token) {
    throw new Error("No GitHub access token found for user")
  }

  return account.access_token
}
const GITHUB_API = "https://api.github.com"

export async function fetchGithubEvents(accessToken: string, username: string) {
  const events: any[] = []

  for (let page = 1; page <= 3; page++) {
    const res = await fetch(
      `${GITHUB_API}/users/${username}/events?per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    )

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
    }

    const pageData = await res.json()
    if (pageData.length === 0) break
    events.push(...pageData)
  }

  return events
}
export async function fetchCommitsBetween(
  accessToken: string,
  repoFullName: string,
  base: string,
  head: string
) {
  const res = await fetch(
    `${GITHUB_API}/repos/${repoFullName}/compare/${base}...${head}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  )

  if (!res.ok) {
    // Can happen for force-pushes, deleted branches, etc. — treat as no data
    return []
  }

  const data = await res.json()
  return data.commits ?? []
}