# aws-iam-role

Easily provision AWS IAM roles using [Serverless Components](https://github.com/serverless/components).

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)

&nbsp;


### 1. Install

```shell
$ npm install -g @serverless/components
```

### 2. Create

Just create a `serverless.yml` file

```shell
$ touch serverless.yml
$ touch .env      # your development AWS api keys
$ touch .env.prod # your production AWS api keys
```

the `.env` files are not required if you have the aws keys set globally and you want to use a single stage, but they should look like this.

```
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
```

### 3. Configure

```yml
# serverless.yml

name: my-app

myRole:
  component: "@serverless/aws-iam-role"
  inputs:
    name: my-role
    service: lambda.amazonaws.com
    policy:
      arn: arn:aws:iam::aws:policy/AdministratorAccess
    regoin: us-east-1
```

### 4. Deploy

```shell
role (master)$ components

  myRole › outputs:
  name:  'my-role'
  arn:  'arn:aws:iam::552760238299:role/my-test-role'
  service:  'lambda.amazonaws.com'
  policy: 
    arn:  'arn:aws:iam::aws:policy/AdministratorAccess'


  37s › dev › my-app › done

role (master)$
```

&nbsp;

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
