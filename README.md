# Portfolio
[![Build Status](https://travis-ci.com/eessex/portfolio.svg?branch=master)](https://travis-ci.com/eessex/portfolio)

A portfolio and listings app appropriate for musicians, performing artists, or event presenters.

- API: Express/MongoDB
- Client: React/React Router/Redux

Demo: https://eveessex.herokuapp.com/

#### Features

- Events listing
- Releases/publications
- Projects (make a page for each band you're in)
- Info page with social links
- Optional homepage (defaults to events page)


### Local Installation
Mongodb is required when running locally. To connect to a remote database, update the `MONGODB_URI` field in `./.env`.

```
$ git clone https://github.com/eessex/portfolio.git
$ cd portfolio
$ npm install -g yarn
$ yarn install
$ cp .env.example .env
$ yarn start
$ open http://localhost:3000/
```

### CMS Demo
![Alt text](https://s3.amazonaws.com/eve-portfolio/assets/portfolio-demo.gif  "Demo gif")
