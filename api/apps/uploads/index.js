var express = require('express')
var uploads = express.Router()
var aws = require('aws-sdk')
var S3_BUCKET = process.env.S3_BUCKET
aws.config.region = 'eu-west-1'

uploads.route('/')
  // get signature
  .get( (req, res) => {
    var s3 = new aws.S3()
    var fileName = req.query['file-name']
    var fileType = req.query['file-type']
    console.log(fileName)
    console.log(fileType)
    console.log(S3_BUCKET)
    var s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Expires: 60,
      ContentType: fileType,
      ACL: 'public-read'
    }
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if(err){
        console.log(err)
        return res.end()
      }
      var returnData = {
        signedRequest: data,
        url: 'https://${S3_BUCKET}.s3.amazonaws.com/${fileName}'
      }
      res.write(JSON.stringify(returnData))
      res.end()
    });
  });
