import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import './Visualizer.css';
const PriorityQueue = require('priorityqueuejs');

const MIN_DELAY = 10;
const MAX_DELAY = 3000;

const GRAPH_INFO = {
  bfs: {
    name: 'Breadth-First Search',
    description:
      'Explores a graph layer by layer, visiting all neighbors of a node before moving to the next level of neighbors. It is often used to find the shortest path in an unweighted graph.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  },
  dfs: {
    name: 'Depth-First Search',
    description:
      'Explores a graph by traversing as far as possible along each branch before backtracking. It is typically used to find cycles or to check for connectivity in a graph.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description:
      'An algorithm for finding the shortest paths between nodes in a graph, which may have weighted edges. It uses a priority queue to always visit the unvisited node with the smallest known distance from the starting node.',
    timeComplexity: 'O(E log V)',
    spaceComplexity: 'O(V + E)',
  },
  aStar: {
    name: 'A* Search Algorithm',
    description:
      "A pathfinding algorithm that is widely used in games and other applications. It uses a heuristic function to estimate the cost to the goal, making it more efficient than Dijkstra's for finding a single destination.",
    timeComplexity: 'O(E)',
    spaceComplexity: 'O(V)',
  },
};

const buildAdjacencyList = (edges, weights) => {
  const newAdjList = new Map();
  const newEdgeWeights = new Map();
  edges.forEach(([u, v]) => {
    if (!newAdjList.has(u)) newAdjList.set(u, []);
    if (!newAdjList.has(v)) newAdjList.set(v, []);
    newAdjList.get(u).push(v);
    newAdjList.get(v).push(u);
  });
  weights.forEach(([u, v, w]) => {
    newEdgeWeights.set(`${u}-${v}`, w);
    newEdgeWeights.set(`${v}-${u}`, w);
  });
  return { newAdjList, newEdgeWeights };
};

const bfs = (adjList, startNode) => {
  const animations = [];
  const queue = [startNode];
  const visited = new Set([startNode]);

  animations.push({
    type: 'visit_start',
    node: startNode,
    text: `Starting BFS at node ${startNode}.`,
    pathAdd: startNode,
  });

  while (queue.length > 0) {
    const u = queue.shift();
    animations.push({
      type: 'visit_node',
      node: u,
      text: `Visiting node ${u}.`,
      pathAdd: u,
    });

    if (adjList.has(u)) {
      for (const v of adjList.get(u)) {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
          animations.push({
            type: 'queue_node',
            node: v,
            text: `Queueing neighbor ${v}.`,
          });
        }
      }
    }
  }
  animations.push({ type: 'complete', text: 'BFS traversal complete.' });
  return { animations };
};

const dfs = (adjList, startNode) => {
  const animations = [];
  const stack = [startNode];
  const visited = new Set([startNode]);

  animations.push({
    type: 'visit_start',
    node: startNode,
    text: `Starting DFS at node ${startNode}.`,
    pathAdd: startNode,
  });

  while (stack.length > 0) {
    const u = stack.pop();
    animations.push({
      type: 'visit_node',
      node: u,
      text: `Visiting node ${u}.`,
      pathAdd: u,
    });

    if (adjList.has(u)) {
      for (let i = adjList.get(u).length - 1; i >= 0; i--) {
        const v = adjList.get(u)[i];
        if (!visited.has(v)) {
          visited.add(v);
          stack.push(v);
          animations.push({
            type: 'stack_node',
            node: v,
            text: `Adding neighbor ${v} to the stack.`,
          });
        }
      }
    }
  }
  animations.push({ type: 'complete', text: 'DFS traversal complete.' });
  return { animations };
};

const dijkstra = (adjList, edgeWeights, startNode, endNode) => {
  const animations = [];
  const distances = new Map();
  const previous = new Map();
  const pq = new PriorityQueue((a, b) => b.distance - a.distance);

  for (const node of adjList.keys()) {
    distances.set(node, Infinity);
  }
  distances.set(startNode, 0);
  pq.enq({ node: startNode, distance: 0 });

  animations.push({
    type: 'start_dijkstra',
    node: startNode,
    text: `Starting Dijkstra's at node ${startNode}.`,
  });

  while (!pq.isEmpty()) {
    const { node: u, distance } = pq.deq();

    if (distance > distances.get(u)) continue;

    animations.push({
      type: 'visit_dijkstra',
      node: u,
      text: `Visiting node ${u} with distance ${distance}.`,
    });

    if (u === endNode) break;

    for (const v of adjList.get(u)) {
      const weight = edgeWeights.get(`${u}-${v}`);
      const newDistance = distances.get(u) + weight;

      if (newDistance < distances.get(v)) {
        distances.set(v, newDistance);
        previous.set(v, u);
        pq.enq({ node: v, distance: newDistance });
        animations.push({
          type: 'update_distance',
          node: v,
          newDistance,
          text: `Updating distance to ${v} to ${newDistance}.`,
        });
      }
    }
  }

  let path = [];
  let current = endNode;
  while (current) {
    path.unshift(current);
    current = previous.get(current);
  }

  animations.push({
    type: 'final_path',
    path,
    text: 'Shortest path found.',
  });
  animations.push({
    type: 'complete',
    text: "Dijkstra's algorithm complete.",
  });
  return { animations, path, distances };
};

const aStar = (adjList, edgeWeights, startNode, endNode, heuristic) => {
  const animations = [];
  const gScores = new Map();
  const fScores = new Map();
  const previous = new Map();
  const pq = new PriorityQueue((a, b) => b.fScore - a.fScore);

  for (const node of adjList.keys()) {
    gScores.set(node, Infinity);
    fScores.set(node, Infinity);
  }
  gScores.set(startNode, 0);
  fScores.set(startNode, heuristic(startNode, endNode));
  pq.enq({ node: startNode, fScore: fScores.get(startNode) });

  animations.push({
    type: 'start_a_star',
    node: startNode,
    text: `Starting A* at node ${startNode}.`,
  });

  while (!pq.isEmpty()) {
    const { node: u } = pq.deq();

    if (u === endNode) {
      animations.push({
        type: 'found_path',
        node: u,
        text: `Path to ${endNode} found!`,
      });
      let path = [];
      let current = endNode;
      while (current) {
        path.unshift(current);
        current = previous.get(current);
      }
      animations.push({
        type: 'final_path',
        path,
        text: 'Shortest path found.',
      });
      animations.push({
        type: 'complete',
        text: 'A* search complete.',
      });
      return { animations, path, distances: gScores };
    }

    animations.push({
      type: 'visit_a_star',
      node: u,
      text: `Visiting node ${u}.`,
    });

    for (const v of adjList.get(u)) {
      const weight = edgeWeights.get(`${u}-${v}`);
      const tentativeGScore = gScores.get(u) + weight;

      if (tentativeGScore < gScores.get(v)) {
        previous.set(v, u);
        gScores.set(v, tentativeGScore);
        fScores.set(v, tentativeGScore + heuristic(v, endNode));
        pq.enq({ node: v, fScore: fScores.get(v) });
        animations.push({
          type: 'update_a_star',
          node: v,
          text: `Updating scores for ${v}.`,
        });
      }
    }
  }

  animations.push({
    type: 'complete',
    text: 'A* search complete. No path found.',
  });
  return { animations, path: [], distances: gScores };
};

const GraphVisualizer = () => {
  const [graphInput, setGraphInput] = useState('A-B, A-C, B-D, C-E');
  const [startNode, setStartNode] = useState('A');
  const [endNode, setEndNode] = useState('');
  const [weightInput, setWeightInput] = useState('A-B:5, A-C:2, B-D:4, C-E:8');
  const [explanation, setExplanation] = useState('Enter a graph and a start node to begin.');
  const [isTraversing, setIsTraversing] = useState(false);
  const [speedSliderValue, setSpeedSliderValue] = useState(500);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs');

  const [adjList, setAdjList] = useState(new Map());
  const [edgeWeights, setEdgeWeights] = useState(new Map());
  const [nodes, setNodes] = useState([]);
  const [nodePositions, setNodePositions] = useState({});
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [queuedNodes, setQueuedNodes] = useState(new Set());
  const [traversalPath, setTraversalPath] = useState([]);
  const [finalPathNodes, setFinalPathNodes] = useState(new Set());
  const [totalWeight, setTotalWeight] = useState(0);

  const timeoutIdRef = useRef(null);
  const animationsRef = useRef([]);
  const currentAnimationIndexRef = useRef(0);
  const svgContainerRef = useRef(null);

  // dynamic dimensions for layout
  const [vizSize, setVizSize] = useState({ width: 800, height: 600 });

  useLayoutEffect(() => {
    const updateSize = () => {
      if (svgContainerRef.current) {
        const rect = svgContainerRef.current.getBoundingClientRect();
        setVizSize({ width: rect.width, height: rect.height });
        generateNodePositions(nodes, rect.width, rect.height);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [nodes]);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Recalculate positions if nodes change
    generateNodePositions(nodes, vizSize.width, vizSize.height);
  }, [nodes, vizSize.width, vizSize.height]);

  const parseGraphInput = () => {
    if (isTraversing) return;
    try {
      const edgeStrings = graphInput.split(',').map((s) => s.trim());
      const edges = edgeStrings.map((s) => {
        const parts = s.split('-');
        if (parts.length !== 2) throw new Error('Invalid edge format');
        return [parts[0], parts[1]];
      });
      const weightStrings = weightInput.split(',').map((s) => s.trim());
      const weights = weightStrings.map((s) => {
        const [edge, w] = s.split(':');
        const parts = edge.split('-');
        if (parts.length !== 2 || isNaN(parseInt(w))) throw new Error('Invalid weight format');
        return [parts[0], parts[1], parseInt(w)];
      });
      const { newAdjList, newEdgeWeights } = buildAdjacencyList(edges, weights);

      const allNodes = Array.from(newAdjList.keys());
      setNodes(allNodes);

      if (startNode && !newAdjList.has(startNode)) {
        setExplanation(
          `Start node ${startNode} not found in the graph. Please choose one of the available nodes.`
        );
        setAdjList(new Map());
        setNodes([]);
        return;
      }

      setAdjList(newAdjList);
      setEdgeWeights(newEdgeWeights);
      generateNodePositions(allNodes, vizSize.width, vizSize.height);
      setExplanation('Graph loaded successfully. Click "Run" to start the visualization.');
    } catch (e) {
      setExplanation(
        'Invalid graph format. Please use "A-B, C-D" and "A-B:5, B-C:2" format.'
      );
      setAdjList(new Map());
      setNodes([]);
    }
  };

  const generateNodePositions = (allNodes, width = 800, height = 600) => {
    if (!allNodes || allNodes.length === 0) return;
    const positions = {};
    const angleStep = (2 * Math.PI) / allNodes.length;

    const padding = 50;
    const effectiveWidth = width - 2 * padding;
    const effectiveHeight = height - 2 * padding;
    const radius = Math.min(effectiveWidth, effectiveHeight) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    allNodes.forEach((node, i) => {
      const angle = i * angleStep;
      positions[node] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
    setNodePositions(positions);
  };

  const handleRunAlgorithm = () => {
    if (adjList.size === 0) {
      setExplanation('Please load a graph first!');
      return;
    }

    setIsTraversing(true);
    setVisitedNodes(new Set());
    setQueuedNodes(new Set());
    setTraversalPath([]);
    setFinalPathNodes(new Set());
    setTotalWeight(0);

    let result;
    if (selectedAlgorithm === 'bfs') {
      result = bfs(adjList, startNode);
    } else if (selectedAlgorithm === 'dfs') {
      result = dfs(adjList, startNode);
    } else if (selectedAlgorithm === 'dijkstra') {
      if (!endNode) {
        setExplanation("Please enter a target node for Dijkstra's.");
        setIsTraversing(false);
        return;
      }
      result = dijkstra(adjList, edgeWeights, startNode, endNode);
    } else if (selectedAlgorithm === 'aStar') {
      if (!endNode) {
        setExplanation("Please enter a target node for A*.");
        setIsTraversing(false);
        return;
      }
      const heuristic = (u, v) => {
        const posU = nodePositions[u];
        const posV = nodePositions[v];
        if (!posU || !posV) return 0;
        return Math.sqrt(
          Math.pow(posU.x - posV.x, 2) + Math.pow(posU.y - posV.y, 2)
        );
      };
      result = aStar(adjList, edgeWeights, startNode, endNode, heuristic);
    }
    animationsRef.current = result.animations;
    currentAnimationIndexRef.current = 0;

    runAnimationStep();
  };

  const runAnimationStep = () => {
    if (currentAnimationIndexRef.current >= animationsRef.current.length) {
      setIsTraversing(false);
      setExplanation('Traversal complete. Click "Run" to start again.');
      return;
    }

    const animation = animationsRef.current[currentAnimationIndexRef.current];
    const { type, node, pathAdd, path: finalPath, text } = animation;
    setExplanation(text);

    if (
      type === 'visit_start' ||
      type === 'visit_node' ||
      type === 'start_dijkstra' ||
      type === 'visit_dijkstra' ||
      type === 'visit_a_star'
    ) {
      setVisitedNodes((prev) => new Set(prev).add(node));
      setQueuedNodes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(node);
        return newSet;
      });
      if (pathAdd) {
        setTraversalPath((prev) => {
          if (!prev.includes(pathAdd)) {
            return [...prev, pathAdd];
          }
          return prev;
        });
      }
    } else if (
      type === 'queue_node' ||
      type === 'stack_node' ||
      type === 'update_distance' ||
      type === 'update_a_star'
    ) {
      setQueuedNodes((prev) => new Set(prev).add(node));
    } else if (type === 'final_path') {
      setFinalPathNodes(new Set(finalPath));
      let weight = 0;
      for (let i = 0; i < finalPath.length - 1; i++) {
        weight += edgeWeights.get(`${finalPath[i]}-${finalPath[i + 1]}`);
      }
      setTotalWeight(weight);
    }

    currentAnimationIndexRef.current++;
    const delay = MAX_DELAY - speedSliderValue + MIN_DELAY;
    timeoutIdRef.current = setTimeout(runAnimationStep, delay);
  };

  const currentAlgorithmInfo = useMemo(
    () => GRAPH_INFO[selectedAlgorithm],
    [selectedAlgorithm]
  );

  const getNodeColor = (node) => {
    if (finalPathNodes.has(node)) return 'purple';
    if (visitedNodes.has(node)) return 'green';
    if (queuedNodes.has(node)) return 'yellow';
    return '#00CED1';
  };
  const getEdgeColor = (u, v) => {
    if (finalPathNodes.has(u) && finalPathNodes.has(v)) {
      return 'purple';
    }
    return '#999';
  };
  const getEdgeStrokeWidth = (u, v) => {
    if (finalPathNodes.has(u) && finalPathNodes.has(v)) {
      return '4';
    }
    return '2';
  };
  const getEdgeWeightText = (u, v) => {
    return edgeWeights.get(`${u}-${v}`);
  };
  const isWeighted = ['dijkstra', 'aStar'].includes(selectedAlgorithm);
  const isPathfinding = ['dijkstra', 'aStar'].includes(selectedAlgorithm);

  return (
    <div className="visualizer-container">
      <div className="input-panel">
        <div className="input-group">
          <input
            type="text"
            placeholder="e.g., A-B, A-C"
            value={graphInput}
            onChange={(e) => setGraphInput(e.target.value)}
            disabled={isTraversing}
          />
        </div>
        {isWeighted && (
          <div className="input-group">
            <input
              type="text"
              placeholder="e.g., A-B:5, B-C:2"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              disabled={isTraversing}
            />
          </div>
        )}
        <button
          onClick={parseGraphInput}
          disabled={isTraversing}
        >
          Load Graph
        </button>
        <button
          onClick={() => {
            setAdjList(new Map());
            setNodes([]);
            setExplanation('Graph cleared.');
          }}
          disabled={isTraversing}
        >
          Clear Graph
        </button>
      </div>
      <div className="control-panel">
        <div className="dropdown-container">
          <label>Algorithm:</label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            disabled={isTraversing}
          >
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="dijkstra">Dijkstra's</option>
            <option value="aStar">A*</option>
          </select>
        </div>
        {isPathfinding && (
          <>
            <div className="search-input-group">
              <label>Target Node:</label>
              <input
                type="text"
                value={endNode}
                onChange={(e) =>
                  setEndNode(e.target.value.toUpperCase())
                }
                disabled={isTraversing}
                style={{ width: '50px', textAlign: 'center' }}
                maxLength="1"
              />
            </div>
            <div className="search-input-group">
              <label>Start Node:</label>
              <input
                type="text"
                value={startNode}
                onChange={(e) =>
                  setStartNode(e.target.value.toUpperCase())
                }
                disabled={isTraversing}
                style={{ width: '50px', textAlign: 'center' }}
                maxLength="1"
              />
            </div>
          </>
        )}
        <button onClick={handleRunAlgorithm} disabled={isTraversing}>
          Run
        </button>
      </div>
      <div className="speed-control">
        <label>Speed</label>
        <input
          type="range"
          min={MIN_DELAY}
          max={MAX_DELAY}
          value={speedSliderValue}
          onChange={(e) => setSpeedSliderValue(parseInt(e.target.value))}
        />
      </div>
      <div className="algorithm-info">
        <h3>{currentAlgorithmInfo.name}</h3>
        <p>
          <strong>Description:</strong> {currentAlgorithmInfo.description}
        </p>
        <div className="complexity-container">
          <p>
            <strong>Time Complexity:</strong>{' '}
            {currentAlgorithmInfo.timeComplexity}
          </p>
          <p>
            <strong>Space Complexity:</strong>{' '}
            {currentAlgorithmInfo.spaceComplexity}
          </p>
        </div>
      </div>
      <div className="traversal-path-box">
        <strong>Path:</strong>{' '}
        {finalPathNodes.size > 0
          ? Array.from(finalPathNodes).join(' -> ')
          : traversalPath.length > 0
          ? traversalPath.join(' -> ')
          : 'N/A'}
        {totalWeight > 0 && <span> (Total Weight: {totalWeight})</span>}
      </div>
      <div
        className="visualization-area"
        ref={svgContainerRef}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${vizSize.width} ${vizSize.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {adjList.size > 0 &&
            nodes.map((u) => {
              const neighbors = adjList.get(u) || [];
              const uPos = nodePositions[u] || { x: 0, y: 0 };
              return neighbors.map((v) => {
                if (u < v) {
                  const vPos = nodePositions[v] || { x: 0, y: 0 };
                  return (
                    <g key={`${u}-${v}`}>
                      <line
                        x1={uPos.x}
                        y1={uPos.y}
                        x2={vPos.x}
                        y2={vPos.y}
                        stroke={getEdgeColor(u, v)}
                        strokeWidth={getEdgeStrokeWidth(u, v)}
                      />
                      <text
                        x={(uPos.x + vPos.x) / 2}
                        y={(uPos.y + vPos.y) / 2}
                        textAnchor="middle"
                        fill="#333"
                        fontSize="16"
                        fontWeight="bold"
                      >
                        {isWeighted ? getEdgeWeightText(u, v) : ''}
                      </text>
                    </g>
                  );
                }
                return null;
              });
            })}
          {nodes.map((node) => {
            const pos = nodePositions[node] || { x: 0, y: 0 };
            return (
              <g
                key={node}
                style={{ cursor: isTraversing ? 'default' : 'pointer' }}
                onClick={() => (isTraversing ? null : setStartNode(node))}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="20"
                  fill={getNodeColor(node)}
                  stroke="#333"
                  strokeWidth="2"
                />
                <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill="black">
                  {node}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="explanation-box">
        <p>{explanation}</p>
      </div>
    </div>
  );
};

export default GraphVisualizer;
