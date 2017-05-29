var express = require('express');
var pages = express.Router();
var Page = require('../../models/page');

pages.route('/')
  // create page
  .post(function(req, res) {
    var page = new Page();
    page.name = req.body.name;
    page.save(function(err) {
      if (err)
        res.send(err);
      res.json({ message: 'Page created' });
    });
  })
  // all pages
  .get(function(req, res) {
    Page.find(function(err, pages) {
      if (err)
        res.send(err);
      res.json(pages);
    });
  });

pages.route('/:page_id')
  // single page
  .get(function(req, res) {
    Page.findById(req.params.page_id, function(err, page) {
      if (err)
        res.send(err);
      res.json(page);
    });
  });

module.exports = pages;
