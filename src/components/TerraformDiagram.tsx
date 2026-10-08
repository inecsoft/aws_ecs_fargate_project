export default function TerraformDiagram() {
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl">
      <h3 className="text-center text-white font-semibold text-lg mb-6">Terraform Multi-Environment Architecture</h3>
      <svg viewBox="0 0 820 440" className="w-full max-w-4xl mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tfGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(100,116,139,0.08)" strokeWidth="0.5"/>
          </pattern>
          <linearGradient id="devGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="prodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="moduleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
          <linearGradient id="tfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <filter id="tfGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="820" height="440" fill="url(#tfGrid)" />

        {/* Terraform Root */}
        <rect x="310" y="10" width="200" height="40" rx="8" fill="url(#tfGrad)" filter="url(#tfGlow)" opacity="0.9"/>
        <text x="410" y="35" fill="white" fontSize="13" textAnchor="middle" fontWeight="bold">🏗️ Terraform Root</text>

        {/* Arrow down from root */}
        <line x1="410" y1="50" x2="410" y2="75" stroke="#7c3aed" strokeWidth="2"/>
        <polygon points="405,72 410,82 415,72" fill="#7c3aed"/>

        {/* Shared VPC Module */}
        <rect x="280" y="80" width="260" height="50" rx="10" fill="url(#moduleGrad)" opacity="0.85"/>
        <text x="410" y="103" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">modules/vpc</text>
        <text x="410" y="120" fill="rgba(255,255,255,0.7)" fontSize="10" textAnchor="middle">VPC • Subnets • NAT • IGW</text>

        {/* Arrows to environments */}
        <path d="M 340 130 Q 200 160 200 180" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 2"/>
        <polygon points="195,176 200,186 205,176" fill="#22d3ee"/>
        <path d="M 480 130 Q 620 160 620 180" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="4 2"/>
        <polygon points="615,176 620,186 625,176" fill="#f97316"/>

        {/* Dev Environment */}
        <rect x="50" y="180" width="300" height="240" rx="12" fill="rgba(30,41,59,0.8)" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="6 3"/>
        <rect x="50" y="180" width="300" height="32" rx="12" fill="rgba(34,211,238,0.15)"/>
        <text x="200" y="201" fill="#22d3ee" fontSize="13" textAnchor="middle" fontWeight="bold">🔧 environments/dev</text>

        {/* Dev VPC */}
        <rect x="70" y="225" width="120" height="40" rx="6" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="1"/>
        <text x="130" y="250" fill="#22d3ee" fontSize="10" textAnchor="middle">VPC 10.0.0.0/16</text>

        {/* Dev Cluster */}
        <rect x="200" y="225" width="130" height="40" rx="6" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="1"/>
        <text x="265" y="250" fill="#22d3ee" fontSize="10" textAnchor="middle">ECS Cluster</text>

        {/* Dev Services */}
        <rect x="70" y="280" width="80" height="35" rx="5" fill="rgba(34,211,238,0.1)" stroke="rgba(34,211,238,0.4)" strokeWidth="1"/>
        <text x="110" y="302" fill="#22d3ee" fontSize="9" textAnchor="middle">Svc-A</text>

        <rect x="160" y="280" width="80" height="35" rx="5" fill="rgba(34,211,238,0.1)" stroke="rgba(34,211,238,0.4)" strokeWidth="1"/>
        <text x="200" y="302" fill="#22d3ee" fontSize="9" textAnchor="middle">Svc-B</text>

        <rect x="250" y="280" width="80" height="35" rx="5" fill="rgba(34,211,238,0.1)" stroke="rgba(34,211,238,0.4)" strokeWidth="1"/>
        <text x="290" y="302" fill="#22d3ee" fontSize="9" textAnchor="middle">Svc-C</text>

        {/* Dev ServiceConnect */}
        <rect x="70" y="330" width="260" height="30" rx="5" fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.3)" strokeWidth="1"/>
        <text x="200" y="350" fill="rgba(34,211,238,0.8)" fontSize="10" textAnchor="middle">ServiceConnect • dev.highlands.local</text>

        {/* Dev Config */}
        <rect x="70" y="375" width="260" height="30" rx="5" fill="rgba(100,116,139,0.1)" stroke="rgba(100,116,139,0.3)" strokeWidth="1"/>
        <text x="200" y="395" fill="#94a3b8" fontSize="9" textAnchor="middle">dev.tfvars • 1 task each • t4g.micro</text>

        {/* Prod Environment */}
        <rect x="470" y="180" width="300" height="240" rx="12" fill="rgba(30,41,59,0.8)" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 3"/>
        <rect x="470" y="180" width="300" height="32" rx="12" fill="rgba(249,115,22,0.15)"/>
        <text x="620" y="201" fill="#f97316" fontSize="13" textAnchor="middle" fontWeight="bold">🚀 environments/prod</text>

        {/* Prod VPC */}
        <rect x="490" y="225" width="120" height="40" rx="6" fill="rgba(249,115,22,0.15)" stroke="#f97316" strokeWidth="1"/>
        <text x="550" y="250" fill="#f97316" fontSize="10" textAnchor="middle">VPC 10.1.0.0/16</text>

        {/* Prod Cluster */}
        <rect x="620" y="225" width="130" height="40" rx="6" fill="rgba(249,115,22,0.15)" stroke="#f97316" strokeWidth="1"/>
        <text x="685" y="250" fill="#f97316" fontSize="10" textAnchor="middle">ECS Cluster</text>

        {/* Prod Services */}
        <rect x="490" y="280" width="80" height="35" rx="5" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.4)" strokeWidth="1"/>
        <text x="530" y="302" fill="#f97316" fontSize="9" textAnchor="middle">Svc-A x3</text>

        <rect x="580" y="280" width="80" height="35" rx="5" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.4)" strokeWidth="1"/>
        <text x="620" y="302" fill="#f97316" fontSize="9" textAnchor="middle">Svc-B x3</text>

        <rect x="670" y="280" width="80" height="35" rx="5" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.4)" strokeWidth="1"/>
        <text x="710" y="302" fill="#f97316" fontSize="9" textAnchor="middle">Svc-C x3</text>

        {/* Prod ServiceConnect */}
        <rect x="490" y="330" width="260" height="30" rx="5" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.3)" strokeWidth="1"/>
        <text x="620" y="350" fill="rgba(249,115,22,0.8)" fontSize="10" textAnchor="middle">ServiceConnect • prod.highlands.local</text>

        {/* Prod Config */}
        <rect x="490" y="375" width="260" height="30" rx="5" fill="rgba(100,116,139,0.1)" stroke="rgba(100,116,139,0.3)" strokeWidth="1"/>
        <text x="620" y="395" fill="#94a3b8" fontSize="9" textAnchor="middle">prod.tfvars • 3 tasks each • t4g.medium</text>

        {/* Shared module label */}
        <text x="410" y="435" fill="#94a3b8" fontSize="10" textAnchor="middle" fontStyle="italic">Shared modules are reused across environments with different variable values</text>
      </svg>
    </div>
  );
}
