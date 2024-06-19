// controllers/discussionsController.js
"use strict";

const Discussion = require("../models/Discussion"), // 사용자 모델 요청
  getDiscussionParams = (body, user) => {
    return {
      title: body.title,
      description: body.description,
      author: user,
      category: body.category,
      tags: body.tags,
    };
  };

module.exports = {
  new: (req, res) => {
    res.render("discussions/new", {
      page: "new-discussion",
      title: "New Discussion",
    });
  },

  create: (req, res, next) => {
    if (req.skip) return next(); 

    let discussionParams = getDiscussionParams(req.body, req.user); 

    Discussion.create(discussionParams)
      .then((discussion) => {
        res.locals.redirect = `/discussions/${discussion._id}`; 
        res.locals.discussion = discussion;
        next();
      })
      .catch((error) => {
        console.log(`Error creating discussion: ${error.message}`);
        next(error); 
      });
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  index: (req, res, next) => {
    Discussion.find()
      .populate("author")
      .exec()
      .then((discussions) => {
        res.locals.discussions = discussions; 
        next();
      })
      .catch((error) => {
        console.log(`Error fetching discussions: ${error.message}`);
        next(error); 
      });
  },

  indexView: (req, res) => {
    res.render("discussions/index", {
      page: "discussions",
      title: "All Discussions",
      discussions: res.locals.discussions,
    }); 
  },
  
  show: (req, res, next) => {
    let discussionId = req.params.id; 
    Discussion.findById(discussionId)
      .populate("author")
      .populate("comments")
      .exec()
      .then((discussion) => {
        discussion.views++;
        discussion.save().then(() => {
          res.locals.discussion = discussion;
          next();
        });
      })
      .catch((error) => {
        console.log(`Error fetching discussion by ID: ${error.message}`);
        next(error); 
      });
  },

  showView: (req, res) => {
    res.render("discussions/show", {
      page: "discussion-details",
      title: "Discussion Details",
      discussion: res.locals.discussion,
    });
  },

  edit: (req, res, next) => {
    let discussionId = req.params.id;
    Discussion.findById(discussionId)
      .populate("author")
      .populate("comments")
      .exec()
      .then((discussion) => {
        res.render("discussions/edit", {
          discussion: discussion,
          page: "edit-discussion",
          title: "Edit Discussion",
        }); 
      })
      .catch((error) => {
        console.log(`Error fetching discussion by ID: ${error.message}`);
        next(error);
      });
  },

  update: (req, res, next) => {
    let discussionId = req.params.id;
    let discussionParams = getDiscussionParams(req.body, req.user);

    Discussion.findByIdAndUpdate(discussionId, {
      $set: discussionParams,
    })
      .exec() 
      .then((discussion) => {
        res.locals.redirect = `/discussions/${discussionId}`;
        res.locals.discussion = discussion;
        next(); 
      })
      .catch((error) => {
        console.log(`Error updating discussion by ID: ${error.message}`);
        next(error);
      });
  },

  delete: (req, res, next) => {
    let discussionId = req.params.id;
    Discussion.findByIdAndRemove(discussionId) 
      .then(() => {
        res.locals.redirect = "/discussions";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting discussion by ID: ${error.message}`);
        next(error);
      });
  },
};
