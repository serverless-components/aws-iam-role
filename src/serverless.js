'use strict';

// eslint-disable-next-line import/no-unresolved
const { Component } = require('@serverless/core');
const aws = require('@serverless/aws-sdk');

const log = (msg) => console.log(msg); // eslint-disable-line

class AwsIamRole extends Component {
  /**
   * Deploy
   * @param {*} inputs
   */
  async deploy(inputs = {}) {
    // IAM roles are global and do not require regional selection
    aws.config.update({ credentials: this.credentials.aws });

    const params = {
      name: inputs.name || this.name,
      service: inputs.service,
      policy: inputs.policy,
    };

    log(`Deploying AWS IAM Role "${params.name}"...`);

    const { roleArn } = await aws.utils.updateOrCreateRole(params);

    this.state.name = params.name;
    this.state.arn = roleArn;

    // should we sleep here, or leave that to any component assuming the role?
    // await sleep(15000)

    log(`AWS IAM Role "${params.name}" was successfully deployed.`);

    return {
      name: params.name,
      arn: roleArn,
    };
  }

  /**
   * Remove
   */
  async remove() {
    // IAM roles are global and do not require regional selection
    aws.config.update({ credentials: this.credentials.aws });

    log(`Removing AWS IAM Role "${this.state.name}".`);

    // Skip removal if no name is in state
    if (!this.state.name) {
      console.log('AWS IAM Role has no "name" in state.  Skipping removal of this resource.');
      this.state = {};
      return {};
    }

    const params = {
      name: this.state.name,
    };

    await aws.utils.deleteRole(params);

    log(`AWS IAM Role "${this.state.name}" was successfully removed.`);

    this.state = {};
    return {};
  }
}

module.exports = AwsIamRole;
