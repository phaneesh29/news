import { db } from '../db/index.js'
import { adminWhitelist } from '../db/schema.js'

async function seed() {
  const emailToWhitelist = 'sreephaneesha2005@gmail.com'
  console.log(`Seeding whitelist with: ${emailToWhitelist}`)
  try {
    await db.insert(adminWhitelist).values({
      email: emailToWhitelist
    }).onConflictDoNothing()
    console.log('Whitelist seeded successfully')
  } catch (error) {
    console.error('Error seeding whitelist:', error)
  }
}

seed().then(() => process.exit(0)).catch(() => process.exit(1))
