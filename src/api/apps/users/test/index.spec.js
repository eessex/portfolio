// process.env.NODE_ENV = 'test'

// var User = require('../schema')
// var chai = require('chai')
// var chaiHttp = require('chai-http')
// var server = require('../../../../../server')
// require('mongoose')

// chai.should()
// chai.use(chaiHttp)

// describe('Users', () => {
//   afterEach(done => {
//     User.remove({}, (err) => {
//       if (err) {
//         console.error(err.status)
//       }
//       done()
//     })
//   })

//   // describe('GET /api/users', () => {
//   //   it('it should GET all the users', done => {
//   //     chai.request(server).get('/api/users').end((err, res) => {
//   //       if (err) {
//   //         console.error(err.status)
//   //       }
//   //       res.should.have.status(200)
//   //       res.body.should.be.a('array')
//   //       res.body.length.should.be.eql(0)
//   //       done()
//   //     })
//   //   })
//   // })

//   describe('POST /api/users', () => {
//     it('can save a user', done => {
//       var user = {
//         name_first: 'Dolly',
//         name_last: 'Parton',
//         email: 'user@email.com',
//         password: 'asdf123'
//       }
//       chai.request(server).post('/api/users').send(user).end((err, res) => {
//         if (err) {
//           console.error(err.status)
//         }
//         res.should.have.status(200)
//         res.body.should.be.a('object')
//         res.body.message.should.eql('User created')
//         res.body.currentUser.email.should.eql('user@email.com')
//         res.body.currentUser._id.should.be.a('string')
//         res.body.session.should.be.a('string')
//         done()
//       })
//     })

//     it('requires a unique email', done => {
//       var user = {
//         name_first: 'Jonny',
//         name_last: 'Parton',
//         email: 'user@email.com',
//         password: 'password'
//       }
//       chai.request(server).post('/api/users').send(user).end((err, res) => {
//         if (err) {
//           console.error(err.status)
//         }
//         var duplicateUser = {
//           name_first: 'Jonny',
//           name_last: 'Parton',
//           email: 'user@email.com',
//           password: 'password'
//         }
//         chai.request(server).post('/api/users').send(duplicateUser).end((err, res) => {
//           if (err) {
//             console.error(err.status)
//           }
//           res.should.have.status(400)
//           done()
//         })
//       })
//     })
//   })

//   describe('POST /api/users/sessions/create', () => {
//     it('can verify a user login', done => {
//       let user = new User({
//         name_first: 'Dolly',
//         name_last: 'Parton',
//         email: 'user@email.com',
//         password: 'asdf123'
//       })
//       user.save((err, user) => {
//         if (err) {
//           console.error(err.status)
//         }
//         chai.request(server).post(
//           '/api/users/session/create'
//         ).send({
//           email: 'user@email.com',
//           password: 'asdf123'
//         }).end((err, res) => {
//           if (err) {
//             console.error(err.status)
//           }
//           res.should.have.status(200)
//           res.body.should.be.a('object')
//           res.body.currentUser.email.should.eql('user@email.com')
//           res.body.currentUser._id.should.be.a('string')
//           res.body.session.should.be.a('string')
//           done()
//         })
//       })
//     })
//   })

//   xdescribe('GET /api/users/:user_id ', () => {
//     xit('it should GET a user by id', (done) => {
//       let user = new User({
//         name_first: 'Dolly',
//         name_last: 'Parton',
//         email: 'user@email.com',
//         password: 'asdf123'
//       })

//       user.save((err, user) => {
//         if (err) {
//           console.error(err.status)
//         }
//         chai.request(server).get('/api/users/' + user.id).send(user).end((err, res) => {
//           if (err) {
//             console.error(err.status)
//           }
//           res.should.have.status(200)
//           res.body.should.be.a('object')
//           res.body.name_first.should.eql('Dolly')
//           res.body.should.have.property('_id').eql(user.id)
//           done()
//         })
//       })
//     })
//   })

//   describe('PUT /api/users/:user_id', () => {
//     it('it should UPDATE a user by id', (done) => {
//       let user = new User({
//         name_first: 'Dolly',
//         name_last: 'Parton',
//         email: 'user@email.com',
//         password: 'asdf123'
//       })
//       user.save((err, user) => {
//         if (err) {
//           console.error(err.status)
//         }
//         chai.request(server).put('/api/users/' + user.id).send(
//           {name_first: 'Dottie'}
//         ).end((err, res) => {
//           if (err) {
//             console.error(err.status)
//           }
//           res.should.have.status(200)
//           res.body.should.be.a('object')
//           res.body.should.have.property('message').eql('User updated')
//           res.body.user.should.have.property('name_first').eql('Dottie')
//           done()
//         })
//       })
//     })
//   })

//   describe('DELETE /api/users/:user_id user', () => {
//     it('it should DELETE an user by id', (done) => {
//       let user = new User({
//         name_first: 'Dolly',
//         name_last: 'Parton',
//         email: 'user@email.com',
//         password: 'asdf123'
//       })
//       user.save((err, user) => {
//         if (err) {
//           console.error(err.status)
//         }
//         chai.request(server).delete('/api/users/' + user.id).end((err, res) => {
//           if (err) {
//             console.error(err.status)
//           }
//           res.should.have.status(200)
//           res.body.should.be.a('object')
//           res.body.should.have.property('message').eql('User deleted')
//           done()
//         })
//       })
//     })
//   })
// })
