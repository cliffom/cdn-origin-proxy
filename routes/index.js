const express = require("express")
const got = require("got")
const router = express.Router()
const winston = require("winston")
winston.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "debug"

const bucket_legacy = process.env.BUCKET_LEGACY
const bucket_new = process.env.BUCKET_NEW

/* health check */
router.get("/_alive", function(req, res) {
  res.send("I'm still alive")
})

/* Origin searching */
router.get("*", function(req, res) {
  const url_legacy = bucket_legacy + req.url
  const url_new = bucket_new + req.url

  got.head(url_new)
    .then((response) => {
      res.redirect(response.requestUrl)
    })
    .catch(error => {
      winston.log("info", error.path + " not found on bucket_new")
      got.head(url_legacy)
        .then((response) => {
          res.redirect(response.requestUrl)
        })
        .catch(error => {
          winston.log("info", error.path + " not found on bucket_legacy")
          res.status(error.statusCode).send(error.statusMessage)
        })
    })
})

module.exports = router
