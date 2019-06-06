import { Format, Image, Venue } from 'client/typings'

export const links = [
  {
    url: 'http://cool-label.com',
    title: 'Cool label'
  },
  {
    url: 'http://cool-venue.com',
    title: 'Cool venue'
  }
]

export const venue: Venue = {
  country: 'USA',
  state: 'NY',
  city: 'New York',
  address: '15 Gramercy Park S.',
  name: 'National Arts Club'
}

export const internationVenue: Venue = {
  country: 'Belguim',
  city: 'Eupen',
  address: 'Rotenbergplatz 19',
  name: 'Kulturzentrum Alter Schlachthof'
}

export const embed_codes: string[] = [
  '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/136440153&color=%23efefef&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>',
  '<iframe width="560" height="315" src="https://www.youtube.com/embed/ekRYnh-Hhq0?rel=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>',
  '<div style="padding:75% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/68556248?color=ffffff&title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>'
]

export const formats: Format[] = [
  {
    release_year: 2018,
    publisher: 'Soap Library',
    format: 'Cassette',
    featuring: false,
    compilation: false
  },
  {
    release_year: 2018,
    publisher: 'Sky Walking',
    format: 'LP',
    featuring: false,
    compilation: false
  }
]

export const images: Image[] = [
  {
    url: 'https://davidwatsun.s3.amazonaws.com/dwatson_pipes_downtown_net.jpg',
    aspect: 1.36867088607595,
    caption: ''
  },
  {
    url: 'https://davidwatsun.s3.amazonaws.com/DavidWatson_by_PeterGanushkin.jpg',
    aspect: 1.33333333333333,
    caption: '<p>David Watson by Peter Ganushkin</p>'
  },
  {
    url: 'https://davidwatsun.s3.amazonaws.com/David-Watson_curved-steps copy.jpg',
    aspect: 2.43252595155709,
    caption: ''
  }
]

export const imagesLong: Image[] = [
  {
    url: 'https://davidwatsun.s3.amazonaws.com/dwatson_pipes_downtown_net.jpg',
    aspect: 1.36867088607595,
    caption: ''
  },
  {
    url: 'https://davidwatsun.s3.amazonaws.com/DavidWatson_by_PeterGanushkin.jpg',
    aspect: 1.33333333333333,
    caption: ''
  },
  {
    url: 'https://davidwatsun.s3.amazonaws.com/David-Watson_curved-steps copy.jpg',
    aspect: 2.43252595155709,
    caption: ''
  },
  {
    url: 'https://eve-portfolio.s3.amazonaws.com/EveEssex_byLenaShkoda.png',
    aspect: 0.993162393162393,
    caption: '<p>Eve Essex by Lena Shkoda</p>'
  },
  {
    url: 'https://eve-portfolio.s3.amazonaws.com/EveEssex_byAnnaZanes.jpg',
    aspect: 1.49068322981366,
    caption: '<p>Eve Essex by Anna Zanes</p>'
  }
]
