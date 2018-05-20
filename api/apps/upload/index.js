var express = require('express')
var upload = express.Router()
var aws = require('aws-sdk')
var S3_BUCKET = process.env.S3_BUCKET

aws.config.region = 'us-east-1'

upload.route('/')
  .post( (req, res) => {
    var s3 = new aws.S3({
        signatureVersion: 'v4'
    })
    var s3Params = {
      Bucket: S3_BUCKET,
      Key: req.body.fileName,
      Expires: 60,
      ContentType: req.body.fileType,
      ACL: 'public-read'
    }
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if(err){
        console.log(err)
        return res.end()
      }
      var signature = {
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${req.body.fileName}`
      }
      res.json(signature)
    })
  })

module.exports = upload
