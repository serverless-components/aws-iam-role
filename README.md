# AwsIamRole
A serverless component that provisions an IAM Role.

## Usage

### Declarative

```yml

name: my-aws-role
stage: dev

AwsIamRole@0.1.2::my-role:
  name: my-role
  service: lambda.amazonaws.com
  policy:
    arn: arn:aws:iam::aws:policy/AdministratorAccess
  regoin: us-east-1
```

### Programatic

```js
npm i --save @serverless/aws-iam-role
```

```js

const role = await this.load('@serverless/aws-iam-role')

const inputs = {
  name: 'my-role',
  service: 'lambda.amazonaws.com',
  policy: {
    arn: 'arn:aws:iam::aws:policy/AdministratorAccess'
  },
  region: 'us-east-1'
}

await role(inputs)

```
