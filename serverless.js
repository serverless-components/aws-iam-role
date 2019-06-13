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
  name: 'serverless-new-cli',
  service: 'lambda.amazonaws.com',
  policy: {
    arn: 'arn:aws:iam::aws:policy/AdministratorAccess'
  },
  region: 'us-east-1'
}

class AwsIamRole extends Component {
  async default(inputs = {}) {
    inputs = mergeDeepRight(defaults, inputs)
    const iam = new aws.IAM({ region: inputs.region, credentials: this.context.credentials.aws })

    this.context.status(`Deploying`)

    const prevRole = await getRole({ iam, ...inputs })

    // If an inline policy, remove ARN
    if (inputs.policy.Version && inputs.policy.Statement) {
      if (inputs.policy.arn) {
        delete inputs.policy.arn
      }
    }

    if (!prevRole) {
      this.context.status(`Creating`)
      inputs.arn = await createRole({ iam, ...inputs })
    } else {
      inputs.arn = prevRole.arn

      if (inputsChanged(prevRole, inputs)) {
        this.context.status(`Updating`)
        if (prevRole.service !== inputs.service) {
          await updateAssumeRolePolicy({ iam, ...inputs })
        }
        if (!equals(prevRole.policy, inputs.policy)) {
          await removeRolePolicy({ iam, ...inputs })
          await addRolePolicy({ iam, ...inputs })
        }
      }
    }

    if (this.state.name && this.state.name !== inputs.name) {
      this.context.status(`Replacing`)
      await deleteRole({ iam, name: this.state.name, policy: inputs.policy })
    }

    this.state.arn = inputs.arn
    this.state.name = inputs.name
    await this.save()

    const outputs = {
      name: inputs.name,
      arn: inputs.arn,
      service: inputs.service,
      policy: inputs.policy
    }

    this.context.log()
    this.context.output('name', `   ${inputs.name}`)
    this.context.output('arn', `    ${inputs.arn}`)
    this.context.output('service', `${inputs.service}`)
    return outputs
  }

  async remove(inputs = {}) {
    inputs = mergeDeepRight(defaults, inputs)
    inputs.name = inputs.name || this.state.name || defaults.name

    const iam = new aws.IAM({ region: inputs.region, credentials: this.context.credentials.aws })
    this.context.status(`Removing`)
    await deleteRole({ iam, ...inputs })

    this.state = {}
    await this.save()

    const outputs = {
      name: inputs.name
    }

    return outputs
  }
}

module.exports = AwsIamRole
