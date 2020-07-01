[![Serverless Components](https://s3.amazonaws.com/public.assets.serverless.com/images/readme_serverless_components.gif)](http://serverless.com)

<br/>

<p align="center">
  <b><a href="https://github.com/serverless-components/aws-iam-role/tree/v1">Click Here for Version 1.0</a></b>
</p>

<br/>

**AWS IAM Role Component** ⎯⎯⎯ The easiest way to deploy and manage AWS IAM Roles, powered by [Serverless Components](https://github.com/serverless/components/tree/cloud).

<br/>

- [x] **Minimal Configuration** - Abstracts IAM roles complexity.
- [x] **Fast Deployments** - IAM roles are deploys in seconds via our cloud engine.
- [x] **Team Collaboration** - Simply share IAM role arn and other outputs with your team's components.
- [x] **Easy Management** - Easily manage your IAM roles with the Serverless Dashboard

<br/>

<img src="/assets/deploy-demo.gif" height="250" align="right">

1. [**Install**](#1-install)
2. [**Create**](#2-create)
3. [**Deploy**](#3-deploy)
4. [**Configure**](#4-configure)
5. [**Develop**](#5-develop)
6. [**Monitor**](#6-monitor)
7. [**Remove**](#7-remove)

&nbsp;

### 1. Install

To get started with component, install the latest version of the Serverless Framework:

```
$ npm install -g serverless
```

### 2. Create

You can easily create a new `aws-iam-role` instance just by using the following command and template url.

```
$ serverless create --template-url https://github.com/serverless/components/tree/master/templates/aws-iam-role
$ cd aws-iam-role
```

Then, create a new `.env` file in the root of the `aws-iam-role` directory right next to `serverless.yml`, and add your AWS access keys:

```
# .env
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
```

You should now have a directory that looks something like this:

```
|- serverless.yml
|- .env
```

### 3. Deploy

Once you have the directory set up, you're now ready to deploy. Just run the following command from within the directory containing the `serverless.yml` file:

```
$ serverless deploy
```

Your first deployment might take a little while, but subsequent deployment would just take few seconds. For more information on what's going on during deployment, you could specify the `--debug` flag, which would view deployment logs in realtime:

```
$ serverless deploy --debug
```

### 4. Configure

The `aws-iam-role` component requires a minimal set of configuration with sane defaults that makes working with IAM roles easier. Here's a complete reference of the `serverless.yml` file for the `aws-iam-role` component:

```yml
component: aws-iam-role             # (required) name of the component. In that case, it's aws-iam-role.
name: my-role                       # (required) name of your component instance.
org: serverlessinc                  # (optional) serverless dashboard org. default is the first org you created during signup.
app: myApp                          # (optional) serverless dashboard app. default is the same as the name property.
stage: dev                          # (optional) serverless dashboard stage. default is dev.

inputs:
  name: my-role                     # (optional) role name. default is the component instance name above.
  service: lambda.amazonaws.com     # (optional) service that assumes this role. default is lambda.amazonaws.com.
  policy:                           # (optional) inline policy statement, or managed policy arn. default is the admin arn.
    - Effect: Allow
      Action:
        - sts:AssumeRole
      Resource: '*'
    - Effect: Allow
      Action:
        - logs:CreateLogGroup
        - logs:CreateLogStream
        - logs:PutLogEvents
      Resource: '*'
```

You can also provide a managed policy ARN string instead of an inline policy statement:

```yml
component: aws-iam-role
name: my-role

inputs:
  service: lambda.amazonaws.com
  policy: arn:aws:iam::aws:policy/AdministratorAccess
```

Once you've chosen your configuration, run `serverless deploy` again (or simply just `serverless`) to deploy your changes.

### 5. Develop

Instead of having to run `serverless deploy` everytime you make changes you wanna test, you could enable dev mode, which allows the CLI to watch for changes in your config (for example, your policy document) in real time, and deploy instantly on save.

To enable dev mode, just run the following command:

```
$ serverless dev
```

### 6. Monitor

Anytime you need to know more about your running `aws-iam-role` instance, you can run the following command to view the most critical info.

```
$ serverless info
```

This is especially helpful when you want to know the outputs of your instances so that you can reference them in another instance. It also shows you the status of your instance, when it was last deployed, and how many times it was deployed. You will also see a url where you'll be able to view more info about your instance on the Serverless Dashboard.

To digg even deeper, you can pass the `--debug` flag to view the state of your component instance in case the deployment failed for any reason.

```
$ serverless info --debug
```

### 7. Remove

If you wanna tear down your entire `aws-iam-role` infrastructure that was created during deployment, just run the following command in the directory containing the `serverless.yml` file.

```
$ serverless remove
```

The `aws-iam-role` component will then use all the data it needs from the built-in state storage system to delete only the relavent cloud resources that it created. Just like deployment, you could also specify a `--debug` flag for realtime logs from the website component running in the cloud.

```
$ serverless remove --debug
```
