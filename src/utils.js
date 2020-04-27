const { isEmpty } = require('ramda')

const log = (msg) => console.log(msg) // eslint-disable-line

const sleep = async (wait) => new Promise((resolve) => setTimeout(() => resolve(), wait))

const addRolePolicy = async ({ iam, name, policy }) => {
  if (policy.arn) {
    await iam
      .attachRolePolicy({
        RoleName: name,
        PolicyArn: policy.arn
      })
      .promise()
  } else if (!isEmpty(policy)) {
    await iam
      .putRolePolicy({
        RoleName: name,
        PolicyName: `${name}-policy`,
        PolicyDocument: JSON.stringify(policy)
      })
      .promise()
  }

  return sleep(15000)
}

const detachRolePolicyIfExists = async ({ iam, name, policy }) => {
  try {
    await iam
      .detachRolePolicy({
        RoleName: name,
        PolicyArn: policy.arn
      })
      .promise()
  } catch (e) {
    if (e.code !== 'NoSuchEntity') {
      throw e
    }
  }
}

const deleteRolePolicyIfExists = async ({ iam, name }) => {
  try {
    await iam
      .deleteRolePolicy({
        RoleName: name,
        PolicyName: `${name}-policy`
      })
      .promise()
  } catch (e) {
    if (e.code !== 'NoSuchEntity') {
      throw e
    }
  }
}

const removeRolePolicy = async ({ iam, name, policy }) => {
  if (policy.arn) {
    await detachRolePolicyIfExists({ iam, name, policy })
  } else if (!isEmpty(policy)) {
    await deleteRolePolicyIfExists({ iam, name })
  }
}

const createRole = async ({ iam, name, service, policy }) => {
  const assumeRolePolicyDocument = {
    Version: '2012-10-17',
    Statement: {
      Effect: 'Allow',
      Principal: {
        Service: service
      },
      Action: 'sts:AssumeRole'
    }
  }
  const roleRes = await iam
    .createRole({
      RoleName: name,
      Path: '/',
      AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicyDocument)
    })
    .promise()

  await addRolePolicy({
    iam,
    name,
    policy
  })

  return roleRes.Role.Arn
}

const deleteRole = async ({ iam, name, policy }) => {
  try {
    await removeRolePolicy({
      iam,
      name,
      policy
    })
    await iam
      .deleteRole({
        RoleName: name
      })
      .promise()
  } catch (error) {
    if (error.message !== `Policy ${policy.arn} was not found.` && error.code !== 'NoSuchEntity') {
      throw error
    }
  }
}

const getRole = async ({ iam, name }) => {
  try {
    const res = await iam.getRole({ RoleName: name }).promise()
    return {
      name: res.Role.RoleName,
      arn: res.Role.Arn,
      service: JSON.parse(decodeURIComponent(res.Role.AssumeRolePolicyDocument)).Statement[0]
        .Principal.Service
    }
  } catch (e) {
    if (e.message.includes('cannot be found')) {
      return null
    }
    throw e
  }
}

const updateAssumeRolePolicy = async ({ iam, name, service }) => {
  const assumeRolePolicyDocument = {
    Version: '2012-10-17',
    Statement: {
      Effect: 'Allow',
      Principal: {
        Service: service
      },
      Action: 'sts:AssumeRole'
    }
  }
  await iam
    .updateAssumeRolePolicy({
      RoleName: name,
      PolicyDocument: JSON.stringify(assumeRolePolicyDocument)
    })
    .promise()
}

module.exports = {
  log,
  createRole,
  deleteRole,
  getRole,
  addRolePolicy,
  removeRolePolicy,
  updateAssumeRolePolicy
}
