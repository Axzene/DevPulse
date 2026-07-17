import "dotenv/config"
import { prisma } from "../lib/prisma"
import { syncDailyMetrics } from "../lib/metrics"

async function main() {
  const user = await prisma.user.findFirst({
    where: { githubUsername: "Axzene" },
  })

  if (!user) {
    console.error("User not found")
    return
  }

  const results = await syncDailyMetrics(user.id)
  console.log(JSON.stringify(results, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())