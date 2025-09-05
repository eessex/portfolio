// import bcrypt from 'bcrypt'
// import postgres from 'postgres'
// import {
// about,
// siteSettings
// events,
// links
// images,
// venues,
// users
// } from '../../placeholder-data'

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

// async function seedSiteSettings () {
//   // await sql`
//   //   CREATE TABLE IF NOT EXISTS site_settings (
//   //     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//   //     created_at TIMESTAMP NOT NULL,
//   //     cover_image_id UUID,
//   //     description TEXT,
//   //     title VARCHAR(255) NOT NULL,
//   //     updated_at TIMESTAMP
//   //   );
//   // `
//   const insertedSiteSettings = await Promise.all(
//     siteSettings.map(async (a) => {
//       return sql`
//         INSERT INTO site_settings (
//           created_at,
//           cover_image_id,
//           description,
//           title
//         )
//         VALUES (
//           current_timestamp,
//           ${a.coverImageId || null},
//           ${a.description || ''},
//           ${a.title}
//         )
//         ON CONFLICT (id) DO NOTHING;
//       `
//     })
//   )

//   return insertedSiteSettings
// }

// async function seedAbout () {
//   // await sql`
//   //   CREATE TABLE IF NOT EXISTS about (
//   //     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//   //     created_at TIMESTAMP NOT NULL,
//   //     cover_image_id UUID,
//   //     description TEXT,
//   //     slug VARCHAR(255) NOT NULL,
//   //     title VARCHAR(255) NOT NULL,
//   //     updated_at TIMESTAMP
//   //   );
//   // `
//   const insertedAbout = await Promise.all(
//     about.map(async (a) => {
//       return sql`
//         INSERT INTO about (
//           created_at,
//           cover_image_id,
//           description,
//           slug,
//           title
//         )
//         VALUES (
//           current_timestamp,
//           ${a.coverImageId || null},
//           ${a.description || ''},
//           ${a.slug},
//           ${a.title}
//         )
//         ON CONFLICT (id) DO NOTHING;
//       `
//     })
//   )

//   return insertedAbout
// }

// async function seedEvents () {
//   // await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

//   // await sql`
//   //   CREATE TABLE IF NOT EXISTS events (
//   //     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//   //     _id VARCHAR(255) NOT NULL,
//   //     created_at TIMESTAMP NOT NULL,
//   //     end_date TIMESTAMP,
//   //     embed_codes TEXT[] NOT NULL,
//   //     description TEXT,
//   //     image_ids UUID[] NOT NULL,
//   //     is_all_day BOOLEAN,
//   //     is_published BOOLEAN,
//   //     link_ids UUID[] NOT NULL,
//   //     project_ids UUID[] NOT NULL,
//   //     slug VARCHAR(255) NOT NULL,
//   //     start_date TIMESTAMP NOT NULL,
//   //     title VARCHAR(255) NOT NULL,
//   //     updated_at TIMESTAMP,
//   //     venue_id UUID NOT NULL
//   //   );
//   // `
//   const insertedEvents = await Promise.all(
//     events.map(async (event) => {
//       return sql`
//         INSERT INTO events (
//           _id,
//           created_at,
//           end_date,
//           embed_codes,
//           description,
//           image_ids,
//           is_all_day,
//           is_published,
//           link_ids,
//           project_ids,
//           slug,
//           start_date,
//           title,
//           updated_at,
//           venue_id
//         )
//         VALUES (
//           ${event._id},
//           ${event.createdAt},
//           ${event.endDate || null},
//           ${event.embedCodes},
//           ${event.description || null},
//           ${event.imageIds},
//           ${event.isAllDay || false},
//           ${event.isPublished},
//           ${event.linkIds},
//           ${event.projectIds},
//           ${event.slug},
//           ${event.startDate},
//           ${event.title},
//           ${event.updatedAt},
//           ${event.venueId}
//         )
//         ON CONFLICT (id) DO NOTHING;
//       `
//     })
//   )

//   return insertedEvents
// }

// // // async function seedLinks () {
// // //   // await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

// // //   // await sql`
// // //   //   CREATE TABLE IF NOT EXISTS customers (
// // //   //     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
// // //   //     _id VARCHAR(255) NOT NULL,
// // //   //     name VARCHAR(255) NOT NULL,
// // //   //     email VARCHAR(255) NOT NULL,
// // //   //     image_url VARCHAR(255) NOT NULL
// // //   //   );
// // //   // `;

// // //   const insertedLinks = await Promise.all(
// // //     links.map(async (link) => {
// // //       return sql`
// // //         INSERT INTO links (
// // //           is_press,
// // //           is_social_profile,
// // //           title,
// // //           url
// // //         )
// // //         VALUES (
// // //           ${link.isPress || null},
// // //           ${link.isSocialProfile || null},
// // //           ${link.title || null},
// // //           ${link.url}
// // //         )
// // //         ON CONFLICT (id) DO NOTHING;
// // //       `
// // //     })
// // //   )

// // //   return insertedLinks
// // // }

// // // async function seedUsers () {
// // //   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
// // //   await sql`
// // //     CREATE TABLE IF NOT EXISTS users (
// // //       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
// // //       name VARCHAR(255) NOT NULL,
// // //       email TEXT NOT NULL UNIQUE,
// // //       password TEXT NOT NULL
// // //     );
// // //   `

// // //   const insertedUsers = await Promise.all(
// // //     users.map(async (user) => {
// // //       const hashedPassword = await bcrypt.hash(user.password, 10)
// // //       return sql`
// // //         INSERT INTO users (id, name, email, password)
// // //         VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
// // //         ON CONFLICT (id) DO NOTHING;
// // //       `
// // //     })
// // //   )

// // //   return insertedUsers
// // // }

// // // async function seedVenues () {
// // //   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
// // //   await sql`
// // //     CREATE TABLE IF NOT EXISTS venues (
// // //       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
// // //       address VARCHAR(255),
// // //       city VARCHAR(255) NOT NULL,
// // //       name VARCHAR(255),
// // //       state VARCHAR(255),
// // //       country VARCHAR(255)
// // //     );
// // //   `

// // //   const insertedVenues = await Promise.all(
// // //     venues.map(async (venue) => {
// // //       return sql`
// // //         INSERT INTO venues (
// // //           address,
// // //           city,
// // //           country,
// // //           name,
// // //           state
// // //         )
// // //         VALUES (
// // //           ${venue.address || null},
// // //           ${venue.city},
// // //           ${venue.country || null},
// // //           ${venue.name || null},
// // //           ${venue.state || null}
// // //         )
// // //         ON CONFLICT (id) DO NOTHING;
// // //       `
// // //     })
// // //   )

// // //   return insertedVenues
// // // }

// // // async function seedImages () {
// // //   await sql`
// // //     CREATE TABLE IF NOT EXISTS images (
// // //       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
// // //       aspect NUMERIC(5, 4) NOT NULL,
// // //       caption VARCHAR(255),
// // //       url VARCHAR(255) NOT NULL
// // //     );
// // //   `

// // //   const insertedImages = await Promise.all(
// // //     images.map(async (image) => {
// // //       return sql`
// // //         INSERT INTO images (
// // //           aspect,
// // //           caption,
// // //           url
// // //         )
// // //         VALUES (
// // //           ${image.aspect},
// // //           ${image.caption || null},
// // //           ${image.url}
// // //         )
// // //         ON CONFLICT (id) DO NOTHING;
// // //       `
// // //     })
// // //   )

// // //   return insertedImages
// // // }

export async function GET () {
  // try {
  //   const result = await sql.begin((sql) => [
  //   // seedEvents(),
  //   // seedAbout(),
  //   // seedSiteSettings()
  //   // seedImages(),
  //   //   seedUsers(),
  //   //   seedVenues()
  //   ])

  //   return Response.json({ message: 'Database seeded successfully', result: result.flat() })
  // } catch (error) {
  //   return Response.json({ error }, { status: 500 })
  // }
  return Response.json({ ok: true }, { status: 200 })
}
