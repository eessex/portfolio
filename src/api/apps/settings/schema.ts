import mongoose from 'mongoose'
const Schema = mongoose.Schema

var SettingsSchema = new Schema({
  title: String,
  description: String,
  meta: {
    description: String,
    image: String
  },
  social: [
    { service: String, profile: String }
  ],
  nav: {
    type: Array,
    default: [
      'events',
      'releases',
      'projects',
      'info'
    ]
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})

export default mongoose.model('Settings', SettingsSchema)
