const { Component } = require('@serverless/core')
const aws = require('@serverless/aws-sdk')

const log = (msg) => console.log(msg) // eslint-disable-line

const sleep = async (wait) => new Promise((resolve) => setTimeout(() => resolve(), wait))

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

    // IAM roles are global and do not require regional selection
    aws.config.update({ credentials: this.credentials.aws })

    log(`Deploying AWS IAM Role "${this.name}"...`)

    const params = {
      name: this.name,
      service: inputs.service,
      policy: inputs.policy
    }

    const { roleArn } = await aws.utils.updateOrCreateRole(params)

    // should we sleep here, or leave that to any component assuming the role?
    // await sleep(15000)

    log(`AWS IAM Role "${this.name}" was successfully deployed.`)

    return {
      name: this.name,
      arn: roleArn
    }
  }

  /**
   * Remove
   */
  async remove() {
    // IAM roles are global and do not require regional selection
    aws.config.update({ credentials: this.credentials.aws })

    log(`Removing AWS IAM Role "${this.name}".`)

    const params = {
      name: this.name
    }

    await aws.utils.deleteRole(params)

    log(`AWS IAM Role "${this.name}" was successfully removed.`)

    this.state = {}
    return {}
  }
}

module.exports = AwsIamRole
