const { generateId, getCredentials, getServerlessSdk, getRole, getRolePolicy } = require('./utils')

// set enough timeout for deployment to finish
jest.setTimeout(30000)

// the yaml file we're testing against
const instanceYaml = {
  org: 'serverlessinc',
  app: 'myApp',
  component: 'aws-iam-role@dev',
  name: `aws-iam-role-integration-tests-${generateId()}`,
  stage: 'dev',
  inputs: {
    service: 'lambda.amazonaws.com',
    policy: {
      arn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
    }
  }
}

// we need to keep the initial instance state after first deployment
// to validate removal later
let firstInstance

// get aws credentials from env
const credentials = getCredentials()

// get serverless access key from env and construct sdk
const sdk = getServerlessSdk(instanceYaml.org)

// clean up the instance after tests
afterAll(async () => {
  await sdk.remove(instanceYaml, credentials)
})

it('should successfully deploy iam role', async () => {
  const instance = await sdk.deploy(instanceYaml, credentials)

  // store the inital state for removal validation later on
  firstInstance = instance

  expect(instance.outputs.name).toBeDefined()
  expect(instance.outputs.arn).toBeDefined()
  expect(instance.outputs.policy.arn).toBeDefined()
})

it('should successfully update role and its service', async () => {
  instanceYaml.inputs.service = ['lambda.amazonaws.com', 'apigateway.amazonaws.com']

  const instance = await sdk.deploy(instanceYaml, credentials)

  const role = await getRole(credentials, instance.outputs.name)

  const fetchedRoleService = JSON.parse(decodeURIComponent(role.Role.AssumeRolePolicyDocument))
    .Statement[0].Principal.Service

  expect(fetchedRoleService.length).toEqual(2)
  expect(fetchedRoleService).toContain(instanceYaml.inputs.service[0])
  expect(fetchedRoleService).toContain(instanceYaml.inputs.service[1])
})

it('should successfully update policy document', async () => {
  instanceYaml.inputs.policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['sts:AssumeRole'],
        Resource: '*'
      },
      {
        Effect: 'Allow',
        Action: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        Resource: '*'
      }
    ]
  }

  const instance = await sdk.deploy(instanceYaml, credentials)

  const policy = await getRolePolicy(credentials, instance.outputs.name)

  const fetchedPolicy = JSON.parse(decodeURIComponent(policy.PolicyDocument))

  expect(policy.PolicyName).toEqual(`${instance.outputs.name}-policy`)
  expect(fetchedPolicy).toMatchObject(instanceYaml.inputs.policy)
})

it('should successfully remove role', async () => {
  await sdk.remove(instanceYaml, credentials)

  // make sure role was actually removed
  let role
  try {
    role = await getRole(credentials, firstInstance.outputs.name)
  } catch (e) {
    if (e.code !== 'NoSuchEntity') {
      throw e
    }
  }

  expect(role).toBeUndefined()
})
