/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var Issue = require('../models/Issue');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res, next){
      var project = req.params.project;
      var query = req.query;
      query.project = project;

      Issue.find(query, function(err, foundIssues) {
        if(err) {
          next(err);
        }

        if (foundIssues) {
          res.json(foundIssues);
        }

      });
      
    })
    
    .post(function (req, res, next){

      var project = req.params.project;
      var { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      var newIssue = new Issue({project, issue_title, issue_text, created_by, assigned_to, status_text});

      newIssue.save(function(err, savedIssue) {

        if (err) {
          if(err.name === "ValidationError" && err.errors.created_by.kind === "required") {
            return res.send("missing inputs");
          };

          return next(err);
        }

        res.json(savedIssue);
      });
      
    })
    
    .put(function (req, res, next){
      var project = req.params.project;
      var _id = req.body._id;
      var update = req.body;
      delete update._id;

      if ( Object.keys(update).length == 0 ) {
        return res.send("no updated field sent");
      }

      var updated_on = new Date();

      Issue.findOneAndUpdate({ _id, project }, update, { new: true }, function(err, data) {

        if(err) {
          next(err);
        }

        var message;

        if (data) {
          message = "successfully updated";
        } else {
          message = "could not update " + _id;
        }

        res.send(message);
      });
    })
    
    .delete(function (req, res, next){
      var project = req.params.project;
      var { _id } = req.body;

      if (typeof _id === "undefined") {
        return res.send("_id error");
      }

      Issue.findOneAndDelete( { _id, project }, function(err, deleted) {

        if(err) {
          next(err);
        }

        var message;

        if (deleted) {
          message =  "deleted " + deleted._id;
        } else {
          message = "could not delete " + _id;
        }
        
        res.send(message);
      })
    });
    
};
