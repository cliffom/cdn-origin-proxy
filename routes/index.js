const express = require('express')
const router = express.Router()
const got = require('got')

const bucket_legacy = process.env.BUCKET_LEGACY
const bucket_new = process.env.BUCKET_NEW

/* health check */
router.get('/_alive', function(req, res) {
  res.send("I'm still alive")
})

/* Origin searching */
router.get('*', function(req, res) {
  const url_legacy = bucket_legacy + req.url
  const url_new = bucket_new + req.url

  got.head(url_new)
    .then((response) => {
      load_image_from_url(res, url_new)
    })
    .catch(error => {
      got.head(url_legacy)
        .then((response) => {
          load_image_from_url(res, url_legacy)
        })
        .catch(error => {
          console.log(req.url + ' cannot be found.')
          res.status(404).send('Not Found')
        })
    })
})

function load_image_from_url(res, url) {
  res.redirect(url)
}

module.exports = router
