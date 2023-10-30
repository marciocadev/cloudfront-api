import * as cdk from 'aws-cdk-lib';
import { LambdaIntegration, LambdaRestApi, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { CloudFrontAllowedMethods, CloudFrontWebDistribution, Distribution, OriginProtocolPolicy, SSLMethod, SecurityPolicyProtocol, SourceConfiguration, ViewerCertificate } from 'aws-cdk-lib/aws-cloudfront';
import { RestApiOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { ARecord, CfnRecordSet, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import { join } from 'path';

export class CloudfrontApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, "Lambda", {
      entry: join(__dirname, "lmb/index.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_18_X,
    });

    const gateway = new RestApi(this, "RestApi");

    const resource = gateway.root.addResource("teste");
    resource.addMethod("GET", new LambdaIntegration(lambda));

    const certificateArn = process.env.CERTIFICATE_ARN!;
    const certificate = Certificate.fromCertificateArn(this, "DomainCertificate", certificateArn);

    const recordName = "api";
    const domainName = "lazinessdevs.com";

    const distribution = new Distribution(this, "Distribution", {
      certificate: certificate,
      defaultBehavior: {
        origin: new RestApiOrigin(gateway)
      },
      domainNames: [[recordName, domainName].join(".")],
    });

    const hostedZoneId = process.env.HOSTED_ZONE_ID!;

    new CfnRecordSet(this, "ARecord", {
      hostedZoneId: hostedZoneId,
      type: "A",
      name: [recordName, domainName].join("."),
      aliasTarget: {
        dnsName: distribution.distributionDomainName,
        hostedZoneId: "Z2FDTNDATAQYW2"
      }
    });
  }
}
