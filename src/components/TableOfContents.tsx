interface TocItem {
  id: string;
  title: string;
  level: number;
}

const tocItems: TocItem[] = [
  { id: 'why-serviceconnect', title: 'Why ServiceConnect', level: 1 },
  { id: 'serviceconnect-with-cdk', title: 'ServiceConnect with CDK', level: 1 },
  { id: 'the-project', title: 'The Project', level: 2 },
  { id: 'baseinfra', title: 'BaseInfra', level: 2 },
  { id: 'service-a-and-c', title: 'Service-A and Service-C', level: 2 },
  { id: 'service-b', title: 'Service-B', level: 2 },
  { id: 'testing-connectivity', title: 'Testing Connectivity', level: 2 },
  { id: 'observability', title: 'Observability', level: 1 },
  { id: 'wrapping-up', title: 'Wrapping Up', level: 1 },
];

export default function TableOfContents() {
  return (
    <nav className="sticky top-24">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        On This Page
      </h4>
      <ul className="space-y-1">
        {tocItems.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block py-1.5 text-sm transition-colors duration-200 hover:text-orange-400 ${
                item.level === 1
                  ? 'text-gray-300 font-medium'
                  : 'text-gray-500 pl-4'
              }`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
