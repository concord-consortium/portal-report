import * as AWS from "aws-sdk/index";

export const S3_BUCKET = "models-resources";
export const S3_DIR_PREFIX = "rubric-resources";
export const S3_REGION = "us-east-1";
export const CLOUDFRONT_URL = "https://models-resources.concord.org";

export function s3Upload({dir, filename, accessKey, secretKey, body, contentType = "", cacheControl = ""}) {
  const s3 = new AWS.S3({
    region: S3_REGION,
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  });
  const key = `${S3_DIR_PREFIX}/${dir}/${filename}`;
  return s3.upload({
    Bucket: S3_BUCKET,
    Key: key,
    Body: body,
    ACL: "public-read",
    ContentType: contentType,
    CacheControl: cacheControl,
  }).promise()
    .then(data => {
      return `${CLOUDFRONT_URL}/${data.Key}`;
    })
    .catch(error => {
      throw(error.message);
    });
}

// In fact it returns Cloudfront URL pointing to a given object in S3 bucket.
export function s3Url({filename, dir}) {
  return `${CLOUDFRONT_URL}/${S3_DIR_PREFIX}/${dir}/${filename}`;
}
