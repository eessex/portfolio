import bcrypt from 'bcrypt'
import postgres from 'postgres'
import {
  venues,
  users
} from '../lib/placeholder-data'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function seedUsers () {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10)
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `
    })
  )

  return insertedUsers
}

async function seedVenues () {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
  await sql`
    CREATE TABLE IF NOT EXISTS venues (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      address VARCHAR(255),
      city VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      state VARCHAR(255),
      country VARCHAR(255)
    );
  `

  const insertedVenues = await Promise.all(
    venues.map(async (venue) => {
      return sql`
        INSERT INTO venues (
          address,
          city,
          country,
          name,
          state
        )
        VALUES (
          ${venue.address || null},
          ${venue.city},
          ${venue.country || null},
          ${venue.name || null},
          ${venue.state || null}
        )
        ON CONFLICT (id) DO NOTHING;
      `
    })
  )

  return insertedVenues
}

export async function GET () {
  try {
    const result = await sql.begin((sql) => [
      seedUsers(),
      seedVenues()
    ])

    return Response.json({ message: 'Database seeded successfully', result: result.flat() })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
