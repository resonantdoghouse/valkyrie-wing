#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node ua-arch-analyze.js <input.json> <output.json>');
  process.exit(1);
}

let input;
try {
  input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
} catch (e) {
  console.error('Failed to read input:', e.message);
  process.exit(1);
}

const { fileNodes, importEdges, allEdges } = input;

// ---- A. Common prefix & Directory Grouping ----
function getSegments(filePath) {
  return filePath.split('/').filter(Boolean);
}

function commonPrefix(paths) {
  if (!paths.length) return '';
  const segs = paths.map(getSegments);
  const minLen = Math.min(...segs.map(s => s.length));
  let prefix = [];
  for (let i = 0; i < minLen - 1; i++) {
    const seg = segs[0][i];
    if (segs.every(s => s[i] === seg)) prefix.push(seg);
    else break;
  }
  return prefix.join('/');
}

const allPaths = fileNodes.map(n => n.filePath);
const prefix = commonPrefix(allPaths);
const prefixSegs = prefix ? prefix.split('/').filter(Boolean) : [];

function getGroupKey(filePath) {
  const segs = getSegments(filePath);
  const afterPrefix = segs.slice(prefixSegs.length);
  if (afterPrefix.length === 0) return 'root';
  if (afterPrefix.length === 1) return 'root';
  return afterPrefix[0];
}

const directoryGroups = {};
for (const node of fileNodes) {
  const key = getGroupKey(node.filePath);
  if (!directoryGroups[key]) directoryGroups[key] = [];
  directoryGroups[key].push(node.id);
}

// ---- B. Node Type Grouping ----
const nodeTypeGroups = {};
for (const node of fileNodes) {
  const t = node.type || 'file';
  if (!nodeTypeGroups[t]) nodeTypeGroups[t] = [];
  nodeTypeGroups[t].push(node.id);
}

// ---- C. Import adjacency (fan-in / fan-out) ----
const fanOut = {};
const fanIn = {};
for (const node of fileNodes) {
  fanOut[node.id] = 0;
  fanIn[node.id] = 0;
}
for (const edge of importEdges) {
  if (fanOut[edge.source] !== undefined) fanOut[edge.source]++;
  if (fanIn[edge.target] !== undefined) fanIn[edge.target]++;
}

// ---- D. Cross-category dependency analysis ----
const nodeTypeMap = {};
for (const node of fileNodes) nodeTypeMap[node.id] = node.type || 'file';

const crossCategoryMap = {};
for (const edge of allEdges) {
  const fromType = nodeTypeMap[edge.source] || 'unknown';
  const toType = nodeTypeMap[edge.target] || 'unknown';
  if (fromType === toType) continue;
  const key = `${fromType}->${toType}:${edge.type}`;
  if (!crossCategoryMap[key]) crossCategoryMap[key] = { fromType, toType, edgeType: edge.type, count: 0 };
  crossCategoryMap[key].count++;
}
const crossCategoryEdges = Object.values(crossCategoryMap);

// ---- E. Inter-group import frequency ----
const idToGroup = {};
for (const [group, ids] of Object.entries(directoryGroups)) {
  for (const id of ids) idToGroup[id] = group;
}

const interGroupMap = {};
for (const edge of importEdges) {
  const from = idToGroup[edge.source];
  const to = idToGroup[edge.target];
  if (!from || !to || from === to) continue;
  const key = `${from}->${to}`;
  if (!interGroupMap[key]) interGroupMap[key] = { from, to, count: 0 };
  interGroupMap[key].count++;
}
const interGroupImports = Object.values(interGroupMap).sort((a, b) => b.count - a.count);

// ---- F. Intra-group import density ----
const intraGroupDensity = {};
for (const group of Object.keys(directoryGroups)) {
  const groupSet = new Set(directoryGroups[group]);
  let internalEdges = 0;
  let totalEdges = 0;
  for (const edge of importEdges) {
    const srcInGroup = groupSet.has(edge.source);
    const tgtInGroup = groupSet.has(edge.target);
    if (srcInGroup || tgtInGroup) totalEdges++;
    if (srcInGroup && tgtInGroup) internalEdges++;
  }
  intraGroupDensity[group] = {
    internalEdges,
    totalEdges,
    density: totalEdges > 0 ? parseFloat((internalEdges / totalEdges).toFixed(3)) : 0
  };
}

// ---- G. Directory pattern matching ----
const PATTERN_MAP = {
  routes: 'api', api: 'api', controllers: 'api', endpoints: 'api', handlers: 'api',
  serializers: 'api', blueprints: 'api', routers: 'api', controller: 'api',
  services: 'service', core: 'service', lib: 'service', domain: 'service', logic: 'service',
  composables: 'service', mailers: 'service', jobs: 'service', channels: 'service',
  signals: 'service', internal: 'service',
  models: 'data', db: 'data', data: 'data', persistence: 'data', repository: 'data',
  entities: 'data', migrations: 'data', entity: 'data', sql: 'data', database: 'data', schema: 'data',
  components: 'ui', views: 'ui', pages: 'ui', ui: 'ui', layouts: 'ui', screens: 'ui',
  middleware: 'middleware', plugins: 'middleware', interceptors: 'middleware', guards: 'middleware',
  utils: 'utility', helpers: 'utility', common: 'utility', shared: 'utility', tools: 'utility',
  pkg: 'utility', templatetags: 'utility',
  config: 'config', constants: 'config', env: 'config', settings: 'config',
  management: 'config', commands: 'config',
  '__tests__': 'test', test: 'test', tests: 'test', spec: 'test', specs: 'test',
  types: 'types', interfaces: 'types', schemas: 'types', contracts: 'types', dtos: 'types',
  dto: 'types', request: 'types', response: 'types',
  hooks: 'hooks',
  store: 'state', state: 'state', reducers: 'state', actions: 'state', slices: 'state',
  assets: 'assets', static: 'assets', public: 'assets',
  docs: 'documentation', documentation: 'documentation', wiki: 'documentation',
  deploy: 'infrastructure', deployment: 'infrastructure', infra: 'infrastructure',
  infrastructure: 'infrastructure', k8s: 'infrastructure', kubernetes: 'infrastructure',
  helm: 'infrastructure', charts: 'infrastructure', terraform: 'infrastructure',
  tf: 'infrastructure', docker: 'infrastructure',
  '.github': 'ci-cd', '.gitlab': 'ci-cd', '.circleci': 'ci-cd',
  bin: 'entry', cmd: 'entry',
  debug: 'debug',
  features: 'feature'
};

const patternMatches = {};
for (const group of Object.keys(directoryGroups)) {
  patternMatches[group] = PATTERN_MAP[group.toLowerCase()] || 'unknown';
}

// ---- H. Deployment topology ----
const allFilePaths = fileNodes.map(n => n.filePath);
const deploymentTopology = {
  hasDockerfile: allFilePaths.some(p => /Dockerfile/.test(p)),
  hasCompose: allFilePaths.some(p => /docker-compose/.test(p)),
  hasK8s: allFilePaths.some(p => /k8s|kubernetes|\.yaml$/.test(p)),
  hasTerraform: allFilePaths.some(p => /\.tf$|\.tfvars$/.test(p)),
  hasCI: allFilePaths.some(p => /\.github|\.gitlab|Jenkinsfile/.test(p)),
  infraFiles: allFilePaths.filter(p =>
    /Dockerfile|docker-compose|\.tf$|\.tfvars$|\.github\/workflows|Jenkinsfile|Makefile/.test(p)
  )
};

// ---- I. Data pipeline detection ----
const dataPipeline = {
  schemaFiles: allFilePaths.filter(p => /\.(graphql|gql|proto|sql|prisma)$/.test(p)),
  migrationFiles: allFilePaths.filter(p => /migration/.test(p)),
  dataModelFiles: allFilePaths.filter(p => /model|entity|schema/.test(p.toLowerCase())),
  apiHandlerFiles: allFilePaths.filter(p => /route|controller|endpoint|handler/.test(p.toLowerCase()))
};

// ---- J. Documentation coverage ----
const groupKeys = Object.keys(directoryGroups);
const docNodes = fileNodes.filter(n => n.type === 'document' || /\.md$|\.rst$/.test(n.filePath));
const groupsWithDocs = groupKeys.filter(g => {
  const groupIds = directoryGroups[g];
  return groupIds.some(id => {
    const node = fileNodes.find(n => n.id === id);
    return node && (node.type === 'document' || /\.md$|\.rst$/.test(node.filePath));
  });
});
const docCoverage = {
  groupsWithDocs: groupsWithDocs.length,
  totalGroups: groupKeys.length,
  coverageRatio: parseFloat((groupsWithDocs.length / groupKeys.length).toFixed(2)),
  undocumentedGroups: groupKeys.filter(g => !groupsWithDocs.includes(g))
};

// ---- K. Dependency direction ----
const dependencyDirection = interGroupImports
  .filter(e => e.from !== e.to)
  .map(e => ({ dependent: e.from, dependsOn: e.to }));

// ---- File stats ----
const filesPerGroup = {};
for (const [g, ids] of Object.entries(directoryGroups)) filesPerGroup[g] = ids.length;
const nodeTypeCounts = {};
for (const [t, ids] of Object.entries(nodeTypeGroups)) nodeTypeCounts[t] = ids.length;

const result = {
  scriptCompleted: true,
  directoryGroups,
  nodeTypeGroups,
  crossCategoryEdges,
  interGroupImports,
  intraGroupDensity,
  patternMatches,
  deploymentTopology,
  dataPipeline,
  docCoverage,
  dependencyDirection,
  fileStats: {
    totalFileNodes: fileNodes.length,
    filesPerGroup,
    nodeTypeCounts
  },
  fileFanIn: fanIn,
  fileFanOut: fanOut
};

try {
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log('Analysis complete. Output written to', outputPath);
  process.exit(0);
} catch (e) {
  console.error('Failed to write output:', e.message);
  process.exit(1);
}
