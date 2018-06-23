# Portfolio
[![Build Status](https://travis-ci.com/eessex/portfolio.svg?branch=master)](https://travis-ci.com/eessex/portfolio)

A portfolio and listings app appropriate for musicians, performing artists, or event presenters.

Uses a React/Redux/Mongo setup.

Demo: https://eveessex.herokuapp.com/

#### Features

- Events listing
- Releases/publications
- Projects (make a page for each band you're in)
- Info page with social links


### Local Installation
```
$ git clone https://github.com/eessex/portfolio.git
$ cd portfolio
$ npm install -g yarn
$ yarn install
$ cp .env.example .env
```
A functional Mongo database is required to start the server, set the `MONGODB_URI` in the `.env` file.

```
$ yarn dev
$ open http://localhost:3000/
```

![Alt text](https://s3.amazonaws.com/eve-portfolio/assets/portfolio-demo.gif  "Demo gif")
