# aws-sam-cli-lambda-deployment
deploying lambda functions with ease by AWS SAM

---

# SmartChart Export Service

This project contains source code and supporting files for a serverless application that you can deploy with the SAM CLI.

To use the SAM CLI, you need the following tools:

* AWS CLI - [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) and [configure it with your AWS credentials].
* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 10](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

Before first build remember to install dependencies using `npm run i` command.

## Local debugging

1. Build your application with the `npm run build` command. Use `npm run watch` for automatic rebuilding. The command will also generate VSCode debugging configs.
2. Run functions locally and invoke them with the `sam local invoke {FUNCTION_NAME} -d 5858 -e events/default.json --template-file .aws-sam/build/template.yaml` command.
   The function name is the one defined in template YAML. The event file contains an exmaple request specification. ENV can be either DVL, STG or PROD.
3. Add breakpoints to app.ts files in /src folder.
4. Run debug session using previously generated config file.

If you don't need to use breakpoints you can run all functions locally and make requests to them using other tools (like for example Fiddler).
To do that use `sam local start-api --template-file .aws-sam/build/template.yaml` command.

## Environmental variables

Environmental variables are defined in YAML templates per environment. You can access them on the Lambda side using process.env.{VARIABLE_NAME}.

## Deployment

To deploy changes use CI plan. If you have the right credentials you can also do it locally:
`sam deploy --template-file .aws-sam/build/template.yaml --region us-east-1 --stack-name execution-function-stack --s3-bucket desired-s3-bucket-static-backup --s3-prefix prefix-name  --capabilities CAPABILITY_IAM --no-confirm-changeset`