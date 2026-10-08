export default function ArchitectureDiagram() {
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl">
      <h3 className="text-center text-white font-semibold text-lg mb-6">ServiceConnect Architecture</h3>
      <svg viewBox="0 0 800 400" className="w-full max-w-3xl mx-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(100,116,139,0.1)" strokeWidth="0.5"/>
          </pattern>
          <linearGradient id="serviceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="proxyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="lbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="800" height="400" fill="url(#grid)" />

        {/* VPC Boundary */}
        <rect x="50" y="30" width="700" height="340" rx="16" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="2" strokeDasharray="8 4"/>
        <text x="70" y="55" fill="#94a3b8" fontSize="12" fontFamily="monospace">VPC</text>

        {/* ALB */}
        <rect x="60" y="150" width="120" height="60" rx="8" fill="url(#lbGrad)" filter="url(#glow)" opacity="0.9"/>
        <text x="120" y="178" fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">Application</text>
        <text x="120" y="195" fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">Load Balancer</text>

        {/* Connection from ALB to Service-B */}
        <line x1="180" y1="180" x2="280" y2="180" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4 2"/>
        <polygon points="275,175 285,180 275,185" fill="#8b5cf6"/>

        {/* Service-B with proxy */}
        <g>
          <rect x="280" y="100" width="180" height="160" rx="12" fill="rgba(30,41,59,0.8)" stroke="rgba(100,116,139,0.3)" strokeWidth="1"/>
          <text x="370" y="125" fill="#e2e8f0" fontSize="12" textAnchor="middle" fontWeight="bold">Service-B</text>
          
          {/* App container */}
          <rect x="300" y="135" width="140" height="45" rx="6" fill="url(#serviceGrad)" opacity="0.9"/>
          <text x="370" y="162" fill="white" fontSize="11" textAnchor="middle">Rust API Container</text>
          
          {/* Envoy proxy */}
          <rect x="300" y="190" width="140" height="45" rx="6" fill="url(#proxyGrad)" opacity="0.9"/>
          <text x="370" y="212" fill="white" fontSize="10" textAnchor="middle">Envoy Proxy</text>
          <text x="370" y="226" fill="white" fontSize="9" textAnchor="middle">(Sidecar)</text>
        </g>

        {/* Service-A with proxy */}
        <g>
          <rect x="530" y="50" width="180" height="130" rx="12" fill="rgba(30,41,59,0.8)" stroke="rgba(100,116,139,0.3)" strokeWidth="1"/>
          <text x="620" y="75" fill="#e2e8f0" fontSize="12" textAnchor="middle" fontWeight="bold">Service-A</text>
          
          <rect x="550" y="85" width="140" height="35" rx="6" fill="url(#serviceGrad)" opacity="0.9"/>
          <text x="620" y="107" fill="white" fontSize="11" textAnchor="middle">Rust API Container</text>
          
          <rect x="550" y="128" width="140" height="35" rx="6" fill="url(#proxyGrad)" opacity="0.9"/>
          <text x="620" y="150" fill="white" fontSize="10" textAnchor="middle">Envoy Proxy</text>
        </g>

        {/* Service-C with proxy */}
        <g>
          <rect x="530" y="220" width="180" height="130" rx="12" fill="rgba(30,41,59,0.8)" stroke="rgba(100,116,139,0.3)" strokeWidth="1"/>
          <text x="620" y="245" fill="#e2e8f0" fontSize="12" textAnchor="middle" fontWeight="bold">Service-C</text>
          
          <rect x="550" y="255" width="140" height="35" rx="6" fill="url(#serviceGrad)" opacity="0.9"/>
          <text x="620" y="277" fill="white" fontSize="11" textAnchor="middle">Rust API Container</text>
          
          <rect x="550" y="298" width="140" height="35" rx="6" fill="url(#proxyGrad)" opacity="0.9"/>
          <text x="620" y="320" fill="white" fontSize="10" textAnchor="middle">Envoy Proxy</text>
        </g>

        {/* Connections from Service-B proxy to Service-A proxy */}
        <path d="M 460 210 Q 500 210 500 145 Q 500 145 530 145" fill="none" stroke="#06b6d4" strokeWidth="2"/>
        <polygon points="525,140 535,145 525,150" fill="#06b6d4"/>
        <text x="490" y="135" fill="#06b6d4" fontSize="9" textAnchor="middle">:8080</text>

        {/* Connections from Service-B proxy to Service-C proxy */}
        <path d="M 460 210 Q 500 210 500 315 Q 500 315 530 315" fill="none" stroke="#06b6d4" strokeWidth="2"/>
        <polygon points="525,310 535,315 525,320" fill="#06b6d4"/>
        <text x="490" y="305" fill="#06b6d4" fontSize="9" textAnchor="middle">:8081</text>

        {/* CloudMap label */}
        <rect x="320" y="340" width="160" height="30" rx="6" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="1"/>
        <text x="400" y="360" fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="bold">☁ AWS CloudMap</text>

        {/* ServiceConnect label */}
        <rect x="250" y="5" width="300" height="22" rx="4" fill="rgba(249,115,22,0.2)" stroke="#f97316" strokeWidth="1"/>
        <text x="400" y="20" fill="#f97316" fontSize="11" textAnchor="middle" fontWeight="bold">ServiceConnect Mesh (Envoy-based)</text>
      </svg>
    </div>
  );
}
