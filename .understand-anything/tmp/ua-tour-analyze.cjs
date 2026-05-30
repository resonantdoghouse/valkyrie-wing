#!/usr/bin/env node
'use strict';

const fs = require('fs');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node ua-tour-analyze.js <input.json> <output.json>');
  process.exit(1);
}

let input;
try {
  input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
} catch (e) {
  console.error('Failed to read/parse input:', e.message);
  process.exit(1);
}

const { nodes, edges, layers } = input;

// Build node map for quick lookup
const nodeMap = {};
for (const n of nodes) {
  nodeMap[n.id] = n;
}

// ── A. Fan-In Ranking ────────────────────────────────────────────────────────
const fanIn = {};
const fanOut = {};
for (const n of nodes) {
  fanIn[n.id] = 0;
  fanOut[n.id] = 0;
}
for (const e of edges) {
  if (fanIn[e.target] !== undefined) fanIn[e.target]++;
  if (fanOut[e.source] !== undefined) fanOut[e.source]++;
}

const fanInRanking = Object.entries(fanIn)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([id, count]) => ({ id, fanIn: count, name: nodeMap[id]?.name || id }));

// ── B. Fan-Out Ranking ───────────────────────────────────────────────────────
const fanOutRanking = Object.entries(fanOut)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([id, count]) => ({ id, fanOut: count, name: nodeMap[id]?.name || id }));

// ── C. Entry Point Candidates ────────────────────────────────────────────────
const entryFileNames = [
  'index.ts','index.js','main.ts','main.js','app.ts','app.js',
  'server.ts','server.js','mod.rs','main.go','main.py','main.rs',
  'manage.py','app.py','wsgi.py','asgi.py','run.py','__main__.py',
  'Application.java','Main.java','Program.cs','config.ru','index.php',
  'App.swift','Application.kt','main.cpp','main.c',
  // React/Vite specifics
  'main.tsx','App.tsx','app.tsx','index.tsx'
];

const totalNodes = nodes.length;
const fanOutValues = Object.values(fanOut).sort((a, b) => a - b);
const top10PctThreshold = fanOutValues[Math.floor(totalNodes * 0.9)] || 0;
const bottom25PctThreshold = fanOutValues[Math.floor(totalNodes * 0.25)] || 0;

const entryScores = [];
for (const n of nodes) {
  let score = 0;
  const name = n.name || '';
  const path = n.filePath || '';

  if (n.type === 'document') {
    if (name === 'README.md' && !path.includes('/')) score += 5;
    else if (name.endsWith('.md') && !path.includes('/')) score += 2;
  } else {
    // code file scoring
    if (entryFileNames.includes(name)) score += 3;
    const depth = (path.match(/\//g) || []).length;
    if (depth <= 1) score += 1;
    if (fanOut[n.id] >= top10PctThreshold) score += 1;
    if (fanIn[n.id] <= bottom25PctThreshold) score += 1;
  }

  if (score > 0) {
    entryScores.push({ id: n.id, score, name, summary: n.summary || '' });
  }
}
entryScores.sort((a, b) => b.score - a.score);
const entryPointCandidates = entryScores.slice(0, 5);

// ── D. BFS Traversal ─────────────────────────────────────────────────────────
// Find top code entry point (skip documents)
const topCodeEntry = entryScores.find(e => {
  const n = nodeMap[e.id];
  return n && n.type !== 'document';
});

const bfsResult = { startNode: null, order: [], depthMap: {}, byDepth: {} };

if (topCodeEntry) {
  bfsResult.startNode = topCodeEntry.id;
  const visited = new Set();
  const queue = [{ id: topCodeEntry.id, depth: 0 }];
  visited.add(topCodeEntry.id);

  // Build adjacency for imports/calls
  const adj = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    if ((e.type === 'imports' || e.type === 'calls') && adj[e.source]) {
      adj[e.source].push(e.target);
    }
  }

  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    bfsResult.order.push(id);
    bfsResult.depthMap[id] = depth;
    if (!bfsResult.byDepth[depth]) bfsResult.byDepth[depth] = [];
    bfsResult.byDepth[depth].push(id);

    for (const neighbor of (adj[id] || [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ id: neighbor, depth: depth + 1 });
      }
    }
  }
}

// ── E. Non-Code File Inventory ───────────────────────────────────────────────
const nonCodeFiles = { documentation: [], infrastructure: [], data: [], config: [] };
const docTypes = new Set(['document']);
const infraTypes = new Set(['service', 'pipeline', 'resource']);
const dataTypes = new Set(['table', 'schema', 'endpoint']);
const configTypes = new Set(['config']);

for (const n of nodes) {
  const entry = { id: n.id, name: n.name, type: n.type, summary: n.summary || '' };
  if (docTypes.has(n.type)) nonCodeFiles.documentation.push(entry);
  else if (infraTypes.has(n.type)) nonCodeFiles.infrastructure.push(entry);
  else if (dataTypes.has(n.type)) nonCodeFiles.data.push(entry);
  else if (configTypes.has(n.type)) nonCodeFiles.config.push(entry);
}

// ── F. Tightly Coupled Clusters ──────────────────────────────────────────────
// Find bidirectional pairs first
const edgeSet = new Set();
for (const e of edges) {
  edgeSet.add(`${e.source}||${e.target}`);
}

const biPairs = [];
for (const e of edges) {
  if (edgeSet.has(`${e.target}||${e.source}`) && e.source < e.target) {
    biPairs.push([e.source, e.target]);
  }
}

// Build clusters by expanding pairs
const clusters = [];
for (const [a, b] of biPairs) {
  // Try to find an existing cluster containing a or b
  let foundCluster = null;
  for (const c of clusters) {
    if (c.nodes.includes(a) || c.nodes.includes(b)) {
      foundCluster = c;
      break;
    }
  }
  if (foundCluster) {
    if (!foundCluster.nodes.includes(a)) foundCluster.nodes.push(a);
    if (!foundCluster.nodes.includes(b)) foundCluster.nodes.push(b);
    foundCluster.edgeCount++;
  } else {
    clusters.push({ nodes: [a, b], edgeCount: 1 });
  }
}

// Expand clusters: add nodes connected to 2+ cluster members
for (const cluster of clusters) {
  for (const n of nodes) {
    if (cluster.nodes.includes(n.id)) continue;
    let connections = 0;
    for (const member of cluster.nodes) {
      if (edgeSet.has(`${n.id}||${member}`) || edgeSet.has(`${member}||${n.id}`)) {
        connections++;
      }
    }
    if (connections >= 2) {
      cluster.nodes.push(n.id);
    }
  }
}

// Count total edges within each cluster
for (const cluster of clusters) {
  let count = 0;
  for (let i = 0; i < cluster.nodes.length; i++) {
    for (let j = i + 1; j < cluster.nodes.length; j++) {
      if (edgeSet.has(`${cluster.nodes[i]}||${cluster.nodes[j]}`) ||
          edgeSet.has(`${cluster.nodes[j]}||${cluster.nodes[i]}`)) {
        count++;
      }
    }
  }
  cluster.edgeCount = count;
}

clusters.sort((a, b) => b.edgeCount - a.edgeCount);
const topClusters = clusters.slice(0, 10);

// ── G. Layer List ─────────────────────────────────────────────────────────────
const layerInfo = {
  count: layers.length,
  list: layers.map(l => ({ id: l.id, name: l.name, description: l.description }))
};

// ── H. Node Summary Index ─────────────────────────────────────────────────────
const nodeSummaryIndex = {};
for (const n of nodes) {
  nodeSummaryIndex[n.id] = { name: n.name, type: n.type, summary: n.summary || '' };
}

// ── Output ────────────────────────────────────────────────────────────────────
const result = {
  scriptCompleted: true,
  entryPointCandidates,
  fanInRanking,
  fanOutRanking,
  bfsTraversal: bfsResult,
  nonCodeFiles,
  clusters: topClusters,
  layers: layerInfo,
  nodeSummaryIndex,
  totalNodes: nodes.length,
  totalEdges: edges.length
};

try {
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`Analysis complete. ${nodes.length} nodes, ${edges.length} edges.`);
} catch (e) {
  console.error('Failed to write output:', e.message);
  process.exit(1);
}

process.exit(0);
