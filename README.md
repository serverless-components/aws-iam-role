# AWS Iam Role

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
