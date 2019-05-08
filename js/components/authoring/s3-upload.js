import React, { PureComponent } from 'react'
import config from '../../config'
import { s3Url, s3Upload } from '../../util/s3-helpers'

import '../../../css/authoring/s3-upload.less'

// Keys used to obtain dat from URL or local storage.
const RESOURCE_NAME = 'rubric'
const USERNAME = 'username'
const S3_ACCESS = 's3AccessKey'
const S3_SECRET = 's3SecretKey'

const getStatusTxt = (msg) => `[${(new Date()).toLocaleTimeString()}] ${msg}`

class S3Upload extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      resourceName: config(RESOURCE_NAME) || '',
      username: config(USERNAME) || window.localStorage.getItem(USERNAME) || '',
      s3AccessKey: config(S3_ACCESS) || window.localStorage.getItem(S3_ACCESS) || '',
      // Don't let users set S3 Secret Key using URL, so they don't share it by accident.
      s3SecretKey: window.localStorage.getItem(S3_SECRET) || '',
      s3ActionInProgress: false,
      s3Status: ''
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.uploadJSONToS3 = this.uploadJSONToS3.bind(this)
    this.loadJSONFromS3 = this.loadJSONFromS3.bind(this)
  }

  get s3FeaturesAvailable () {
    const { s3ActionInProgress, resourceName, username, s3AccessKey, s3SecretKey } = this.state
    return !s3ActionInProgress && resourceName && username && s3AccessKey && s3SecretKey
  }

  get resourceFileName () {
    const { resourceName } = this.state
    if (!resourceName) {
      return null
    }
    return resourceName.endsWith('.json') ? resourceName : `${resourceName}.json`
  }

  get resourceUrl () {
    const { username } = this.state
    if (!username || !this.resourceFileName) {
      return null
    }
    return s3Url({dir: username, filename: this.resourceFileName})
  }

  componentDidMount () {
    if (this.resourceUrl) {
      this.loadJSONFromS3()
    }
  }

  async loadJSONFromS3 () {
    const { onLoad } = this.props

    this.setState({
      s3ActionInProgress: true,
      s3Status: getStatusTxt('Loading JSON...')
    })
    try {
      const response = await window.fetch(this.resourceUrl)
      if (response.status !== 200) {
        this.setState({
          s3ActionInProgress: false,
          s3Status: getStatusTxt('Loading JSON failed')
        })
        return
      }
      try {
        const textResponse = await response.text()
        onLoad(textResponse)
        JSON.parse(textResponse) // parse just to check for errors and potentially display error msg
        this.setState({
          s3ActionInProgress: false,
          s3Status: getStatusTxt('Loading JSON: success!')
        })
      } catch (parseError) {
        this.setState({
          s3ActionInProgress: false,
          s3Status: getStatusTxt('Loading JSON failed: unexpected/malformed content')
        })
      }
    } catch (fetchError) {
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt('Loading JSON failed: fetch error')
      })
    }
  }

  uploadJSONToS3 () {
    const {username} = this.state
    const {resourceJSON} = this.props

    this.setState({
      s3ActionInProgress: true,
      s3Status: getStatusTxt('Uploading JSON to S3...')
    })
    const {s3AccessKey, s3SecretKey} = this.state
    s3Upload({
      dir: username,
      filename: this.resourceFileName,
      accessKey: s3AccessKey,
      secretKey: s3SecretKey,
      body: resourceJSON,
      contentType: 'application/json',
      cacheControl: 'no-cache'
    }).then((url) => {
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt('Uploading JSON to S3: success!'),
        resourceUrl: url
      })
    }).catch(err => {
      this.setState({
        s3ActionInProgress: false,
        s3Status: getStatusTxt(err)
      })
    })
  }

  handleInputChange (event) {
    const value = event.target.value
    const name = event.target.name
    switch (name) {
      case 'resourceName':
        this.setState({resourceName: value})
        window.localStorage.setItem(RESOURCE_NAME, value)
        break
      case 'username':
        this.setState({username: value})
        window.localStorage.setItem(USERNAME, value)
        break
      case 's3AccessKey':
        this.setState({s3AccessKey: value})
        window.localStorage.setItem(S3_ACCESS, value)
        break
      case 's3SecretKey':
        this.setState({s3SecretKey: value})
        window.localStorage.setItem(S3_SECRET, value)
        break
    }
  }

  render () {
    const { resourceName, username, s3AccessKey, s3SecretKey, s3Status } = this.state
    const resource = RESOURCE_NAME.charAt(0).toUpperCase() + RESOURCE_NAME.slice(1)
    const resourceUrl = this.resourceUrl
    const exampleLink = window.location.href + '?rubric=test&username=joe&s3AccessKey=ABCXYZ'
    return (
      <div>
        <div className='s3Details'>
          <table>
            <tbody>
              <tr className='name'>
                <td>{ resource } Name</td>
                <td>
                  <input
                    value={resourceName}
                    type='text'
                    name='resourceName'
                    onChange={this.handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Username</td>
                <td><input value={username} type='text' name='username' onChange={this.handleInputChange} /></td>
              </tr>
              <tr>
                <td>S3 Access Key</td>
                <td><input value={s3AccessKey} type='text' name='s3AccessKey' onChange={this.handleInputChange} /></td>
              </tr>
              <tr>
                <td>S3 Secret Key</td>
                <td><input value={s3SecretKey} type='text' name='s3SecretKey' onChange={this.handleInputChange} /></td>
              </tr>
            </tbody>
          </table>
          <p>
            <button disabled={!this.s3FeaturesAvailable} data-cy='save' onClick={this.uploadJSONToS3}>
              Save
            </button>
            <button disabled={!username || !resourceName} data-cy='load' onClick={this.loadJSONFromS3}>
              Load
            </button>
          </p>
          <div className='s3Status'>
            {s3Status}
          </div>
          {
            resourceUrl &&
            <div className='url'>
              { resource } URL: <a href={resourceUrl} target='_blank'>{ resourceUrl }</a>
            </div>
          }
          <div className='help'>
            <p>This authoring page supports following URL parameters:</p>
            <ul>
              <li>rubric</li>
              <li>username</li>
              <li>s3AccessKey</li>
            </ul>
            <p>They can be used to set the initial value of text inputs above. E.g.:</p>

            <p><a href={exampleLink} target='_blank'>{exampleLink}</a></p>

            <p>Authors should use IAM account that belongs this group:</p>

            <a href='https://console.aws.amazon.com/iam/home#/groups/Rubric-S3-Access' target='_blank'>https://console.aws.amazon.com/iam/home#/groups/Rubric-S3-Access</a>

            <p>It limits access to their own directory based on the username (IAM username and username on the authoring page have to match).</p>
          </div>
        </div>
      </div>
    )
  }
}

export default S3Upload
