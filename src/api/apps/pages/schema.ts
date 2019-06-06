import mongoose from 'mongoose'
import slug from 'mongoose-slug-generator'

const Schema = mongoose.Schema
mongoose.plugin(slug)

const PageSchema = new Schema({
  title: String,
  description: String,
  lead_text: String,
  slug: {
    type: String,
    slug: ['title'],
    slug_padding_size: 2,
    unique: true
  },
  images: { type: Array, default: [] },
  embed_codes: [],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }
})

export default mongoose.model('Page', PageSchema)
