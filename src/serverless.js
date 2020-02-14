const { equals, mergeDeepRight } = require('ramda')
const aws = require('aws-sdk')
const {
  createRole,
  deleteRole,
  getRole,
  addRolePolicy,
  removeRolePolicy,
  updateAssumeRolePolicy,
  inputsChanged
} = require('./utils')
const { Component } = require('@serverless/core')

const defaults = {
  service: 'lambda.amazonaws.com',
  policy: {
    arn: null
  },
  region: 'us-east-1'
}

class AwsIamRole extends Component {

  /**
   * Deploy
   * @param {*} inputs 
   */
  async deploy(inputs = {}) {
    inputs = mergeDeepRight(defaults, inputs)
    const iam = new aws.IAM({ region: inputs.region, credentials: this.credentials.aws })

    console.log(`Deploying AWS IAM Role...`)

    inputs.name = this.state.name || inputs.name || Math.random().toString(36).substring(6)

    console.log(`Checking if role ${inputs.name} exists in region ${inputs.region}.`)
    const prevRole = await getRole({ iam, ...inputs })

    // If an inline policy, remove ARN
    if (inputs.policy.Version && inputs.policy.Statement) {
      if (inputs.policy.arn) {
        delete inputs.policy.arn
      }
    }

    if (!prevRole) {
      console.log(`Role doesn't exist.  Creating role ${inputs.name}.`)
      inputs.arn = await createRole({ iam, ...inputs })
      console.log(`Done: ${inputs.arn}`)
    } else {
      inputs.arn = prevRole.arn
      console.log(`Role exists.  Checking if configuration has changed.`)
      if (inputsChanged(prevRole, inputs)) {
        console.log('Configuration has changed.  Updating role...')
        if (prevRole.service !== inputs.service) {
          console.log(`Updating service which has changed from ${prevRole.service} to ${inputs.service}`)
          await updateAssumeRolePolicy({ iam, ...inputs })
        }
        if (!equals(prevRole.policy, inputs.policy)) {
          console.log(`Updating policy for role ${inputs.name}.`)
          await removeRolePolicy({ iam, ...inputs })
          await addRolePolicy({ iam, ...inputs })
        }
      } else {
        console.log('Configuration has not changed')
      }
    }

    // Throw error on name change
    if (this.state.name && this.state.name !== inputs.name) {
      throw new Error(`Changing the name from ${this.state.name} to ${inputs.name} will delete the AWS IAM Role.  Please remove it manually, change the name, then re-deploy.`)
    }

    this.state.name = inputs.name
    this.state.arn = inputs.arn
    this.state.service = inputs.service
    this.state.policy = inputs.policy
    this.state.region = inputs.region

    console.log(`Finished creating/updating role.`)

    return {
      name: inputs.name,
      arn: inputs.arn,
      service: inputs.service,
      policy: inputs.policy
    }
  }

  /**
   * Remove
   */
  async remove() {
    console.log(`Removing AWS IAM Role...`)

    if (!this.state.name) {
      console.log(`Aborting removal. Role name not found in state.`)
      return
    }

    const iam = new aws.IAM({
      region: this.state.region,
      credentials: this.credentials.aws
    })

    console.log(`Removing role ${this.state.name} from region ${this.state.region}.`)
    await deleteRole({ iam, ...this.state })
    console.log(`Role successfully removed.`)

    this.state = {}
    return {}
  }
}

module.exports = AwsIamRole
