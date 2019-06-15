import mongoose from 'mongoose'
import slug from 'mongoose-slug-generator'

const Schema = mongoose.Schema
mongoose.plugin(slug)

const ProjectSchema = new Schema({
  active: Boolean,
  created_at: { type: Date, default: Date.now },
  description: String,
  embed_codes: [String],
  end_date: Date,
  images: [
    {
      caption: { type: String },
      url: { type: String },
      aspect: { type: Number }
    }
  ],
  links: [
    {
      title: { type: String },
      url: { type: String }
    }
  ],
  published: { type: Boolean, default: false },
  start_date: Date,
  slug: {
    type: String,
    slug: ['title'],
    slug_padding_size: 2,
    unique: true
  },
  title: String,
  updated_at: { type: Date, default: Date.now },
  list_index: Number
})

export default mongoose.model('Project', ProjectSchema)
