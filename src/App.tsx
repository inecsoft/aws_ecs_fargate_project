import CodeBlock from './components/CodeBlock';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import TableOfContents from './components/TableOfContents';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="font-bold text-lg">CloudNative<span className="text-orange-500">Dev</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 text-xs font-medium">AWS</span>
              <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs font-medium">ECS</span>
              <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-medium">CDK</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium">
                Architecture
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                Serverless
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                Containers
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                ServiceConnect
              </span>
              {' '}with CDK Builds Strong Service Affinity
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-8">
              Explore how AWS ECS ServiceConnect with CDK delivers a simple, yet powerful service mesh experience for your containerized microservices.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600"></div>
                <span>Cloud Native Developer</span>
              </div>
              <span>•</span>
              <span>12 min read</span>
              <span>•</span>
              <span>July 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-12">
          {/* Article Content */}
          <article className="prose prose-invert max-w-none">
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Containers are a fantastic way to package up your application code and its dependencies. I'm on the record as a huge fan and probably write more production code in containers than I do with Lambda Functions. Call me crazy, but I like frameworks like Axum and Actix in Rust. When I'm connecting APIs over either HTTP or gRPC, I generally reach for AWS Elastic Container Service (ECS).
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                I enjoy working with k8s and the plethora of open source tools, but ECS just makes things so simple, highly available, and with the announcement of <strong className="text-orange-400">ServiceConnect in 2022</strong>, more connected. In this article, I'm going to explore ServiceConnect with CDK.
              </p>
            </div>

            {/* Why ServiceConnect */}
            <section id="why-serviceconnect" className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-mono">1</span>
                Why ServiceConnect
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                When working with connected Microservices, there is often a great deal of networking that goes into connecting pieces. Traditionally, this happens with an Application or Network Load Balancer that manages targets, health, and routes. In a simple setup, this might be one load balancer, but in a more complex setup there could be 10s of these or more. It forces your application code to be more aware of the network topology and how to find the services that it needs to communicate with.
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                On top of the networking, there are behaviors that some services do well and others might ignore. I'd call these being a <strong className="text-emerald-400">good neighbor</strong>. A good neighbor in the neighborhood should exhibit these neighborly characteristics:
              </p>

              {/* Good Neighbor Characteristics */}
              <div className="my-8 grid gap-3">
                {[
                  { icon: '🏷️', text: 'Make itself available over a friendly name' },
                  { icon: '🔀', text: 'Abstract itself from the networking topology' },
                  { icon: '🔒', text: 'Allow for secure communication over TLS including restricting who can talk to them' },
                  { icon: '🔄', text: 'Handle graceful retries' },
                  { icon: '⚡', text: 'Shed load so that bad upstream neighbors don\'t make things bad for the whole neighborhood' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed mb-6">
                These are just a few of the abilities that can be addressed with a Service Mesh that offers Service Discovery. The industry added this capability a few years ago when it saw the rise of 100s and 1000s of coordinating Microservices operating at scale.
              </p>

              {/* Quote */}
              <blockquote className="my-8 p-6 rounded-xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border-l-4 border-cyan-500">
                <p className="text-gray-300 italic mb-3">
                  "As on the ground microservice practitioners quickly realize, the majority of operational problems that arise when moving to a distributed architecture are ultimately grounded in two areas: <strong className="text-cyan-400">networking and observability</strong>. It is simply an orders of magnitude larger problem to network and debug a set of intertwined distributed services versus a single monolithic application."
                </p>
                <footer className="text-gray-500 text-sm">— Envoy Project</footer>
              </blockquote>
            </section>

            {/* ServiceConnect with CDK */}
            <section id="serviceconnect-with-cdk" className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-mono">2</span>
                ServiceConnect with CDK
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                This project that I've been working on for a while has grown into multiple repositories, several services, and more than 3 CloudFormation stacks. What I want to walk through today is how to build a connected API with 3 services that talk over a proxy with ServiceConnect and are built with CDK.
              </p>

              {/* Architecture Diagram */}
              <ArchitectureDiagram />

              {/* The Project */}
              <div id="the-project" className="mt-12">
                <h3 className="text-2xl font-bold text-white mb-4">The Project</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  I mentioned above that this project spans multiple repos and parts, so let's dive in and talk through how it comes together. When I'm done, I'll execute a GET on an endpoint that'll yield the below response. That response will be brought together by 3 services: <strong className="text-orange-400">Service-A</strong>, <strong className="text-orange-400">Service-B</strong>, and <strong className="text-orange-400">Service-C</strong>.
                </p>

                {/* Response JSON */}
                <CodeBlock
                  title="API Response"
                  language="json"
                  code={`{
    "key_one": "(Hello)Field 1",
    "key_two": "(Hello)Field 2",
    "key_time": "2024-07-07T02:44:59.984673361Z"
}`}
                />

                {/* File Structure */}
                <div className="my-8 p-6 rounded-xl bg-gray-900/80 border border-gray-800">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    Project Structure
                  </h4>
                  <div className="font-mono text-sm text-gray-400 space-y-1">
                    <div className="text-orange-400">├── BaseInfra/</div>
                    <div className="pl-4">├── lib/</div>
                    <div className="pl-8 text-gray-500">├── infra-stack.ts</div>
                    <div className="pl-8 text-gray-500">├── constructs/</div>
                    <div className="pl-4">└── bin/</div>
                    <div className="text-cyan-400">├── Service-A/</div>
                    <div className="pl-4 text-gray-500">├── lib/</div>
                    <div className="text-purple-400">├── Service-B/</div>
                    <div className="pl-4 text-gray-500">├── lib/</div>
                    <div className="text-emerald-400">└── Service-C/</div>
                    <div className="pl-4 text-gray-500">└── lib/</div>
                  </div>
                </div>
              </div>

              {/* BaseInfra */}
              <div id="baseinfra" className="mt-12">
                <h3 className="text-2xl font-bold text-white mb-4">BaseInfra</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  The BaseInfra project establishes exactly what it sounds like — Base Infrastructure. It will build the following components:
                </p>
                <ul className="list-none space-y-2 mb-6">
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    A VPC with Public, Private, and Isolated Subnets
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    An ECS Cluster for my services
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    The Namespace for that cluster to register my services into
                  </li>
                </ul>

                <CodeBlock
                  title="infra-stack.ts"
                  language="typescript"
                  code={`export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // build the base VPC
    const vpcConstruct = new VpcConstruct(this, 'VpcConstruct');

    // create a new Application Load Balancer
    new LoadBalancerConstruct(
      this,
      'LoadBalancerConstruct',
      {
        vpc: vpcConstruct.vpc
      }
    );

    // Build the ECS Cluster to hold the services
    new EcsClusterConstruct(this, 'EcsClusterConstruct', {
      vpc: vpcConstruct.vpc,
    });
  }
}`}
                />
              </div>

              {/* Service-A and Service-C */}
              <div id="service-a-and-c" className="mt-12">
                <h3 className="text-2xl font-bold text-white mb-4">Service-A and Service-C</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  ServiceConnect offers the option to run services in what it describes as <strong className="text-cyan-400">client</strong> and <strong className="text-cyan-400">client/server</strong> mode. Essentially what this boils down to is whether a service will only send requests or if it will send AND receive requests. For my use case, I'm opting to put all of the services in client/server mode for simplicity.
                </p>
                <p className="text-gray-300 leading-relaxed mb-6">What will happen from there is a few things:</p>
                <ul className="list-none space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="mt-1 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">1</span>
                    A Proxy will be installed next to your ECS Task. Under the hood, it's built on <strong className="text-white">Envoy</strong>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="mt-1 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">2</span>
                    A CloudMap resource will be established for the service and the instances will be registered
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <span className="mt-1 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">3</span>
                    The service will gain a simple name that is resolvable and be attached to a port
                  </li>
                </ul>

                {/* Service-A Code */}
                <h4 className="text-xl font-semibold text-white mt-8 mb-4">Service-A Task Definition</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Let's dive in a bit on the TaskDefinition and the ServiceConnect pieces of building a FargateService. The proxy sidecar is installed by AWS on my behalf — no manual configuration needed!
                </p>

                <CodeBlock
                  title="task-definition.ts"
                  language="typescript"
                  code={`// task definition
this._taskDefinition = new TaskDefinition(scope, 
  \`\${props.service.serviceName}-TaskDefinition\`, {
    cpu: '1024',
    memoryMiB: '2048',
    compatibility: Compatibility.FARGATE,
    runtimePlatform: {
      cpuArchitecture: CpuArchitecture.ARM64,
      operatingSystemFamily: OperatingSystemFamily.LINUX,
    },
    networkMode: NetworkMode.AWS_VPC,
    family: \`\${props.service.serviceName}-task\`,
});

// add the container
const apiContainer = this._taskDefinition.addContainer('rust-api', {
    image: ContainerImage.fromRegistry(
      \`\${service.ecrUri}:\${service.imageTag}\`
    ),
    logging: LogDrivers.awsLogs({ 
      streamPrefix: service.serviceName 
    }),
    environment: {
      BIND_ADDRESS: "0.0.0.0:3000",
      DD_TRACING_ENABLED: "false",
      RUST_LOG: "info"
    },
    containerName: service.apiShortName,
    essential: true,
    cpu: 512,
    memoryReservationMiB: 1024,
});

apiContainer.addPortMappings({
    containerPort: 3000,
    appProtocol: AppProtocol.http,
    name: 'web',
    protocol: Protocol.TCP,
});`}
                />

                <h4 className="text-xl font-semibold text-white mt-8 mb-4">FargateService with ServiceConnect</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The FargateService definition is where ServiceConnect comes into play:
                </p>

                <CodeBlock
                  title="fargate-service.ts"
                  language="typescript"
                  code={`new FargateService(
    scope,
    \`Service-\${props.service.serviceName}\`,
    {
      cluster: props.sharedResources.cluster,
      taskDefinition: props.task,
      desiredCount: 1,
      serviceName: props.service.serviceName,
      securityGroups: [securityGroup],
      serviceConnectConfiguration: {
        logDriver: LogDrivers.awsLogs({
          streamPrefix: props.service.serviceName
        }),
        namespace: 'highlands.local',
        services: [
          {
            portMappingName: 'web',
            dnsName: props.service.apiShortName,
            port: 8080,
            discoveryName: props.service.apiShortName,
            // timeout requests at 10 seconds
            perRequestTimeout: Duration.seconds(10)
          },
        ],
      },
    }
);`}
                />

                {/* ServiceConnect Config Breakdown */}
                <div className="my-8 p-6 rounded-xl bg-gradient-to-br from-orange-500/5 to-amber-500/5 border border-orange-500/20">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    ServiceConnect Configuration Breakdown
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <code className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded text-sm shrink-0">logDriver</code>
                      <span className="text-gray-300 text-sm">Establishing a log driver and where the logs will be delivered</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <code className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded text-sm shrink-0">namespace</code>
                      <span className="text-gray-300 text-sm">A namespace for the service registers into</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <code className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded text-sm shrink-0">portMappingName</code>
                      <span className="text-gray-300 text-sm">Goes along with the DNS name: <code className="text-cyan-400">protocol://&lt;name&gt;:port</code></span>
                    </div>
                    <div className="flex items-start gap-3">
                      <code className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded text-sm shrink-0">perRequestTimeout</code>
                      <span className="text-gray-300 text-sm">Sets a time when the proxy should release the connection if a bad neighbor is occupying threads</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service-B */}
              <div id="service-b" className="mt-12">
                <h3 className="text-2xl font-bold text-white mb-4">Service-B</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  At the heart of this example is Service-B. This is the service that is connected to the Application Load Balancer and uses the CloudMap registry to connect to Service-A and Service-C.
                </p>

                <h4 className="text-xl font-semibold text-white mt-8 mb-4">HTTP Request Code (Rust)</h4>
                <CodeBlock
                  title="service-b/src/handlers.rs"
                  language="rust"
                  code={`let service_a_host: String = std::env::var("SERVICE_A_URL")
    .expect("SERVICE_A_URL Must be Set");

// code omitted for brevity
let url = format!("{}/route?p={}", service_a_host, prefix);
let response = client.get(url.as_str())
    .headers(headers)
    .send()
    .await;

match response {
    Ok(r) => {
        if r.status().is_success() {
            let j: Result<ServiceAModel, Error> = r.json().await;
            match j {
                Ok(m) => Ok(m),
                Err(e) => {
                    tracing::error!("Error parsing: {}", e);
                    Err(StatusCode::BAD_REQUEST)
                }
            }
        } else {
            tracing::error!("Bad request={:?}", r.status());
            Err(StatusCode::BAD_REQUEST)
        }
    }
    Err(e) => {
        tracing::error!("Error requesting: {}", e);
        Err(StatusCode::INTERNAL_SERVER_ERROR)
    }
}`}
                />

                <p className="text-gray-300 leading-relaxed mb-6">
                  What matters in this code is that the <code className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">SERVICE_A_URL</code> is injected into the application via an environment variable. Without ServiceConnect, this might be a CNAME or A RECORD pointing at a load balancer. But in this case, it'll be the ServiceConnect endpoint: <code className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">http://service-a:8080</code>
                </p>

                <h4 className="text-xl font-semibold text-white mt-8 mb-4">Service-B Container Environment</h4>
                <CodeBlock
                  title="service-b-container.ts"
                  language="typescript"
                  code={`addApiContainer = (service: EcsService) => {
  // api container
  const apiContainer = this._taskDefinition.addContainer('rust-api', {
      image: ContainerImage.fromRegistry(
        \`\${service.ecrUri}:\${service.imageTag}\`
      ),
      logging: LogDrivers.awsLogs({ 
        streamPrefix: service.serviceName 
      }),
      environment: {
        BIND_ADDRESS: "0.0.0.0:3000",
        DD_TRACING_ENABLED: "false",
        RUST_LOG: "info",
        SERVICE_A_URL: "http://service-a:8080",
        SERVICE_C_URL: "http://service-c:8081"
      },
      containerName: service.apiShortName,
      essential: true,
      cpu: 512,
      memoryReservationMiB: 1024,
  });
}`}
                />

                <div className="my-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-gray-300 text-sm">
                    💡 <strong className="text-emerald-400">Key Insight:</strong> Notice how we reference services by their discoverable name. Behind that is CloudMap keeping track of the instance IP addresses associated with them. Pretty neat!
                  </p>
                </div>
              </div>

              {/* Testing Connectivity */}
              <div id="testing-connectivity" className="mt-12">
                <h3 className="text-2xl font-bold text-white mb-4">Testing the Connectivity between Services</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  With ServiceConnect and CDK, you can see how easy it is to add advanced service mesh capabilities to any of your ECS services. ServiceConnect is only available for services deployed in ECS. This includes EC2 and Fargate deployment models, but if you have more variety in your compute, you might need to look at including <strong className="text-purple-400">VPC Lattice</strong>.
                </p>

                {/* Curl Response */}
                <div className="my-8 p-6 rounded-xl bg-gray-900 border border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-green-400 text-sm font-mono">Terminal</span>
                  </div>
                  <div className="font-mono text-sm space-y-2">
                    <div className="text-gray-500">$ curl http://alb-endpoint/api</div>
                    <div className="text-gray-300">{`{`}</div>
                    <div className="text-cyan-400 pl-4">{`"key_one": "(Hello)Field 1",`}</div>
                    <div className="text-cyan-400 pl-4">{`"key_two": "(Hello)Field 2",`}</div>
                    <div className="text-orange-400 pl-4">{`"key_time": "2024-07-07T02:44:59.984673361Z"`}</div>
                    <div className="text-gray-300">{`}`}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Observability */}
            <section id="observability" className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-mono">3</span>
                Observability
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                One of the benefits of using a service mesh is the observability gained between the services. Oftentimes, developers and DevOps are unaware of the true requirements and dependencies from service to service. It can also be hard to pinpoint latency and failure when running through single or multiple load balancers.
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                With ServiceConnect, I'm able to see:
              </p>

              <div className="my-8 grid sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="text-white font-semibold text-sm mb-1">Service Dependencies</h4>
                  <p className="text-gray-400 text-xs">See what your service talks to</p>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20">
                  <div className="text-2xl mb-2">⏱️</div>
                  <h4 className="text-white font-semibold text-sm mb-1">Latency Metrics</h4>
                  <p className="text-gray-400 text-xs">Measure latency between each service</p>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                  <div className="text-2xl mb-2">🔍</div>
                  <h4 className="text-white font-semibold text-sm mb-1">Connection Tracking</h4>
                  <p className="text-gray-400 text-xs">Track active connections & health</p>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed mb-6">
                Sure, I do this with Application Performance Monitoring as well, but having them right at hand when working with ECS is nice.
              </p>
            </section>

            {/* Wrapping Up */}
            <section id="wrapping-up" className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-mono">4</span>
                Wrapping Up
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Microservices and containers bring so much power to a builder's toolkit when putting together systems for users. Sometimes these systems have interdependencies that are required and can lead to unintended negative consequences. Service Mesh technologies came out of the need to add observability, service discovery, and simplified networking with additional application-level controls.
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                However, those tools are mostly designed to work with k8s and tend to be complex in setup. If you are running ECS (which I'd recommend most do), how can you benefit from these same capabilities? <strong className="text-orange-400">Enter ECS ServiceConnect</strong> which is built upon the popular Service Mesh Envoy.
              </p>

              {/* Summary Card */}
              <div className="my-8 p-8 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-500/10 border border-orange-500/20">
                <h4 className="text-xl font-bold text-white mb-4">Key Takeaways</h4>
                <ul className="space-y-3">
                  {[
                    'ServiceConnect adds service mesh capabilities to ECS with minimal configuration',
                    'Built on Envoy proxy — industry standard for service mesh',
                    'Service discovery via AWS CloudMap with friendly DNS names',
                    'Built-in observability for inter-service communication',
                    'CDK makes configuration simple with just a few lines of code',
                    'Supports both EC2 and Fargate launch types',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-gray-300 leading-relaxed mb-6">
                ECS workloads with ServiceConnect enable so much power in such a simple and easy-to-configure package. As simple as ServiceConnect with CDK is, I almost describe it as the default for me at this point. With a few lines of configuration code, I gain so many features that I ask the question:
              </p>

              <div className="my-8 text-center p-8 rounded-2xl bg-gray-900 border border-gray-800">
                <p className="text-2xl font-bold text-orange-400 italic">
                  "Why aren't you using ServiceConnect?"
                </p>
              </div>

              <p className="text-gray-400 text-center mt-8">
                Thanks for reading and happy building! 🚀
              </p>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <TableOfContents />
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-amber-600"></div>
                <span className="font-bold text-white">CloudNative<span className="text-orange-500">Dev</span></span>
              </div>
              <p className="text-gray-500 text-sm">
                Exploring cloud-native architectures, containers, and serverless patterns.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Topics</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><span className="hover:text-orange-400 cursor-pointer transition-colors">AWS ECS</span></li>
                <li><span className="hover:text-orange-400 cursor-pointer transition-colors">ServiceConnect</span></li>
                <li><span className="hover:text-orange-400 cursor-pointer transition-colors">AWS CDK</span></li>
                <li><span className="hover:text-orange-400 cursor-pointer transition-colors">Rust</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><span className="hover:text-orange-400 cursor-pointer transition-colors">GitHub Repository</span></li>
                <li><span className="hover:text-orange-400 cursor-pointer transition-colors">AWS Documentation</span></li>
                <li><span className="hover:text-orange-400 cursor-pointer transition-colors">CDK API Reference</span></li>
                <li><span className="hover:text-orange-400 cursor-pointer transition-colors">Envoy Proxy</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-600 text-sm">
            © 2024 CloudNativeDev. Built with ❤️ and containers.
          </div>
        </div>
      </footer>
    </div>
  );
}
