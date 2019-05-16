import { s3Upload, s3Url, CLOUDFRONT_URL, S3_BUCKET, S3_DIR_PREFIX } from '../../js/util/s3-helpers'
import * as AWS from 'aws-sdk'
import sinon from 'sinon'

describe('S3 helpers', () => {
  describe('s3Upload', () => {
    beforeEach(() => {
      AWS.S3.prototype.upload = sinon.spy((params) => {
        return {
          promise: () => new Promise(resolve => {
            resolve({Key: `${params.Key}`})
          })
        }
      })
    })

    it('should call AWS.S3.upload with correct arguments and return Cloudfront URL', async () => {
      const params = {
        dir: 'test',
        filename: 'test.txt',
        accessKey: '123',
        secretKey: 'abc',
        body: 'test',
        cacheControl: 'max-age=123',
        contentType: 'application/test'
      }
      const url = await s3Upload(params)
      const expectedKey = `${S3_DIR_PREFIX}/${params.dir}/${params.filename}`
      expect(AWS.S3.prototype.upload.calledOnceWithExactly({
        Bucket: S3_BUCKET,
        Key: expectedKey,
        Body: params.body,
        ACL: 'public-read',
        ContentType: params.contentType,
        CacheControl: params.cacheControl
      })).toBe(true)
      expect(url).toBe(`${CLOUDFRONT_URL}/${expectedKey}`)
    })
  })

  describe('s3Url', () => {
    describe('it should return Cloudfront URL for a given file and directory', () => {
      expect(s3Url({filename: 'test.abc', dir: 'dir'})).toBe(`${CLOUDFRONT_URL}/${S3_DIR_PREFIX}/dir/test.abc`)
    })
  })
})
