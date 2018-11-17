// process.env.NODE_ENV = 'test'

// var Settings = require('../schema')
// var chai = require('chai')
// var chaiHttp = require('chai-http')
// var server = require('../../../../../server')
// var moment = require('moment')
// require('mongoose')

// chai.should()
// chai.use(chaiHttp)

// describe('Settings', () => {
//   afterEach(done => {
//     Settings.remove({}, (err) => {
//       if (err) { console.warn(err) }
//       done()
//     })
//   })

//   describe('GET /api/settings', () => {
//     it('it should GET all the settings', done => {
//       chai.request(server).get('/api/settings').end((err, res) => {
//         if (err) { console.warn(err) }

//         res.should.have.status(200)
//         res.body.should.be.a('array')
//         res.body.length.should.be.eql(0)
//         done()
//       })
//     })
//   })

//   describe('POST /api/settings', () => {
//     it('can save an setting', done => {
//       var data = { title: 'New Settings' }
//       chai.request(server).post('/api/settings').send(data).end((err, res) => {
//         if (err) { console.warn(err) }

//         res.should.have.status(200)
//         res.body.should.be.a('object')
//         res.body.settings.title.should.eql('New Settings')
//         done()
//       })
//     })

//     it('adds an updated_at, created_at and published field by default', done => {
//       var data = { title: 'New Settings' }
//       chai.request(server).post('/api/settings').send(data).end((err, res) => {
//         if (err) { console.warn(err) }

//         var date = moment().format('YYYY-MM-DD')
//         var created_at = moment(res.body.settings.created_at).format('YYYY-MM-DD')
//         var updated_at = moment(res.body.settings.updated_at).format('YYYY-MM-DD')
//         created_at.should.eql(date)
//         updated_at.should.eql(date)
//         done()
//       })
//     })
//   })
// })
