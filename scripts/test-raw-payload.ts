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

  const pushEvents = events.filter((e) => e.type === "PushEvent")
  console.log(JSON.stringify(pushEvents, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())