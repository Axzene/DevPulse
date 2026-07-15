import "dotenv/config"
import { prisma } from "../lib/prisma"
import { getGithubAccessToken, fetchGithubEvents } from "../lib/github"

async function main() {
  const user = await prisma.user.findFirst({
    where: { githubUsername: "Axzene" },
  })

  if (!user) {
    console.error("User not found")
    return
  }

  const accessToken = await getGithubAccessToken(user.id)
  const events = await fetchGithubEvents(accessToken, user.githubUsername!)

  console.log("Total events fetched:", events.length)
  console.log("Event types:", [...new Set(events.map((e) => e.type))])
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())