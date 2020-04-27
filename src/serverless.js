const { equals, mergeDeepRight } = require('ramda')
const aws = require('aws-sdk')
const {
  log,
  createRole,
  deleteRole,
  getRole,
  addRolePolicy,
  removeRolePolicy,
  updateAssumeRolePolicy
} = require('./utils')
const { Component } = require('@serverless/core')

const defaults = {
  service: 'lambda.amazonaws.com',
  policy: {
    arn: 'arn:aws:iam::aws:policy/AdministratorAccess'
  }
}

class AwsIamRole extends Component {
  /**
   * Deploy
   * @param {*} inputs
   */
  async deploy(inputs = {}) {
    // this error message assumes that the user is running via the CLI though...
    if (Object.keys(this.credentials.aws).length === 0) {
      const msg = `Credentials not found. Make sure you have a .env file in the cwd. - Docs: https://git.io/JvArp`
      throw new Error(msg)
    }

    inputs = mergeDeepRight(defaults, inputs)

    // IAM roles are global and do not require regional selection
    const iam = new aws.IAM({ credentials: this.credentials.aws })

    log(`Deploying AWS IAM Role...`)

    inputs.name =
      this.state.name ||
      this.name ||
      Math.random()
        .toString(36)
        .substring(6)

    if (
      !inputs.policy ||
      (!inputs.policy.arn && (!inputs.policy.Version || !inputs.policy.Statement))
    ) {
      throw new Error(
        `Invalid policy in inputs. Please provide either an ARN or a valid policy document.`
      )
    }

    // If an inline policy, remove ARN
    if (inputs.policy.Version && inputs.policy.Statement) {
      if (inputs.policy.arn) {
        delete inputs.policy.arn
      }
    }

    log(`Checking if role ${inputs.name} exists.`)
    const prevRole = await getRole({ iam, ...inputs })

    if (!prevRole) {
      log(`Role doesn't exist. Creating role ${inputs.name}.`)
      inputs.arn = await createRole({ iam, ...inputs })
      log(`Done: ${inputs.arn}`)

      this.state.name = inputs.name
      this.state.arn = inputs.arn
      this.state.service = inputs.service
      this.state.policy = inputs.policy
    } else {
      inputs.arn = prevRole.arn
      this.state.name = inputs.name
      this.state.arn = inputs.arn

      if (prevRole.service !== inputs.service) {
        log(`Updating service which has changed from ${prevRole.service} to ${inputs.service}`)
        await updateAssumeRolePolicy({ iam, ...inputs })
        this.state.service = inputs.service
      }

      if (!equals(this.state.policy, inputs.policy)) {
        log(`Updating policy for role ${inputs.name}.`)

        // remove old policy if found
        if (this.state.policy) {
          await removeRolePolicy({ iam, ...this.state })
        }

        // add the new policy
        await addRolePolicy({ iam, ...inputs })
        this.state.policy = inputs.policy
      }
    }

    log(`Finished creating/updating role.`)

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
    log(`Removing AWS IAM Role...`)

    if (!this.state.name) {
      log(`Aborting removal. Role name not found in state.`)
      return
    }

    const iam = new aws.IAM({
      credentials: this.credentials.aws
    })

    log(`Removing role ${this.state.name}.`)
    await deleteRole({ iam, ...this.state })
    log(`Role successfully removed.`)

    this.state = {}
    return {}
  }
}

module.exports = AwsIamRole
