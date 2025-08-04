import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import './Visualizer.css';

const MIN_DELAY = 10;
const MAX_DELAY = 3000;

const TREE_INFO = {
  bst: {
    name: 'Binary Search Tree',
    description:
      'A node-based binary tree data structure where each node has a key, and each key must be greater than all keys in the left sub-tree and less than all keys in the right sub-tree. This allows for efficient searching, insertion, and deletion.',
    timeComplexity: 'O(log n) (Average)',
    spaceComplexity: 'O(n)',
  },
  inOrder: {
    name: 'In-order Traversal',
    description:
      'Visits the left child, then the root, then the right child. This traversal method is particularly useful for printing the values of a BST in sorted order.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) (Worst-case)',
  },
  preOrder: {
    name: 'Pre-order Traversal',
    description:
      'Visits the root, then the left child, then the right child. This traversal is useful for creating a copy of a tree.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) (Worst-case)',
  },
  postOrder: {
    name: 'Post-order Traversal',
    description:
      'Visits the left child, then the right child, then the root. This is often used to delete a tree because it ensures the children are deleted before the parent.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n) (Worst-case)',
  },
};

class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

const insert = (root, value) => {
  if (root === null) {
    return new Node(value);
  }
  let current = root;
  while (true) {
    if (value < current.value) {
      if (current.left === null) {
        current.left = new Node(value);
        break;
      }
      current = current.left;
    } else {
      if (current.right === null) {
        current.right = new Node(value);
        break;
      }
      current = current.right;
    }
  }
  return root;
};

const search = (root, value, animations) => {
  let current = root;
  while (current !== null) {
    animations.push({
      type: 'highlight',
      node: current.value,
      text: `Searching for ${value}. Comparing with current node ${current.value}.`,
    });
    if (value === current.value) {
      animations.push({
        type: 'found',
        node: current.value,
        text: `Value ${value} found!`,
      });
      return true;
    } else if (value < current.value) {
      current = current.left;
    } else {
      current = current.right;
    }
  }
  animations.push({
    type: 'not_found',
    node: null,
    text: `Value ${value} not found in the tree.`,
  });
  return false;
};

const inOrderTraversal = (root, animations) => {
  if (root) {
    inOrderTraversal(root.left, animations);
    animations.push({
      type: 'visit',
      node: root.value,
      text: `Visiting node ${root.value} (In-order).`,
      pathAdd: root.value,
    });
    inOrderTraversal(root.right, animations);
  }
};

const preOrderTraversal = (root, animations) => {
  if (root) {
    animations.push({
      type: 'visit',
      node: root.value,
      text: `Visiting node ${root.value} (Pre-order).`,
      pathAdd: root.value,
    });
    preOrderTraversal(root.left, animations);
    preOrderTraversal(root.right, animations);
  }
};

const postOrderTraversal = (root, animations) => {
  if (root) {
    postOrderTraversal(root.left, animations);
    postOrderTraversal(root.right, animations);
    animations.push({
      type: 'visit',
      node: root.value,
      text: `Visiting node ${root.value} (Post-order).`,
      pathAdd: root.value,
    });
  }
};

/**
 * Dynamic tree rendering using container width to space children.
 * @param {Node} node 
 * @param {number} x center x
 * @param {number} y current y
 * @param {number} level depth
 * @param {Set} highlightedNodes
 * @param {number} containerWidth
 * @param {number} horizontalSpread multiplier for spacing
 */
const renderTreeNodes = (
  node,
  x,
  y,
  level,
  highlightedNodes,
  containerWidth
) => {
  if (!node) return null;
  const isHighlighted = highlightedNodes.has(node.value);

  // compute horizontal offset based on level and container size
  // exponential shrink: root has wide spacing, deeper levels get narrower
  const baseOffset = containerWidth / 4; // for first level
  const xOffset = baseOffset / 2 ** level; // halves each depth
  const childY = y + 80;

  const leftX = x - xOffset;
  const rightX = x + xOffset;

  return (
    <g key={`${node.value}-${level}`}>
      {node.left && (
        <line
          x1={x}
          y1={y}
          x2={leftX}
          y2={childY}
          stroke="#999"
          strokeWidth="2"
        />
      )}
      {node.right && (
        <line
          x1={x}
          y1={y}
          x2={rightX}
          y2={childY}
          stroke="#999"
          strokeWidth="2"
        />
      )}
      <circle
        cx={x}
        cy={y}
        r="20"
        fill={isHighlighted ? 'yellow' : '#00CED1'}
        stroke="#333"
        strokeWidth="2"
      />
      <text x={x} y={y + 5} textAnchor="middle" fill="black">
        {node.value}
      </text>
      {renderTreeNodes(node.left, leftX, childY, level + 1, highlightedNodes, containerWidth)}
      {renderTreeNodes(node.right, rightX, childY, level + 1, highlightedNodes, containerWidth)}
    </g>
  );
};

const TreeVisualizer = () => {
  const [treeValues, setTreeValues] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [explanation, setExplanation] = useState(
    'Enter values to build a BST, then search or traverse.'
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [speedSliderValue, setSpeedSliderValue] = useState(500);
  const [tree, setTree] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [selectedTraversal, setSelectedTraversal] = useState('inOrder');
  const [traversalPath, setTraversalPath] = useState([]);

  const animationsRef = useRef([]);
  const currentAnimationIndexRef = useRef(0);
  const timeoutIdRef = useRef(null);
  const svgContainerRef = useRef(null);

  const [vizSize, setVizSize] = useState({ width: 800, height: 600 });

  useLayoutEffect(() => {
    const updateSize = () => {
      if (svgContainerRef.current) {
        const rect = svgContainerRef.current.getBoundingClientRect();
        setVizSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, []);

  const buildTree = () => {
    if (isAnimating) return;
    setTree(null);
    setExplanation('Building a new tree...');
    const values = treeValues.split(',').map(Number);
    if (values.some(isNaN)) {
      setExplanation('Invalid input. Please use comma-separated numbers.');
      return;
    }

    let newTree = null;
    values.forEach((value) => {
      newTree = insert(newTree, value);
    });
    setTree(newTree);
    setExplanation('Tree built successfully. Now you can search!');
  };

  const handleSearch = () => {
    if (isAnimating || tree === null) return;
    const value = parseInt(searchValue);
    if (isNaN(value)) {
      setExplanation('Please enter a valid number to search for.');
      return;
    }

    setIsAnimating(true);
    setHighlightedNodes(new Set());
    setTraversalPath([]);
    const animations = [];
    search(tree, value, animations);
    animationsRef.current = animations;
    currentAnimationIndexRef.current = 0;

    runAnimationStep();
  };

  const handleTraversal = () => {
    if (isAnimating || tree === null) return;

    setIsAnimating(true);
    setHighlightedNodes(new Set());
    setTraversalPath([]);
    const animations = [];
    if (selectedTraversal === 'inOrder') {
      inOrderTraversal(tree, animations);
    } else if (selectedTraversal === 'preOrder') {
      preOrderTraversal(tree, animations);
    } else if (selectedTraversal === 'postOrder') {
      postOrderTraversal(tree, animations);
    }
    animationsRef.current = animations;
    currentAnimationIndexRef.current = 0;

    runAnimationStep();
  };

  const runAnimationStep = () => {
    if (currentAnimationIndexRef.current >= animationsRef.current.length) {
      setIsAnimating(false);
      setHighlightedNodes(new Set());
      setExplanation('Animation complete.');
      return;
    }

    const animation = animationsRef.current[currentAnimationIndexRef.current];
    const { type, node, text, pathAdd } = animation;
    setExplanation(text);

    if (type === 'highlight' || type === 'found' || type === 'visit') {
      setHighlightedNodes(new Set([node]));
      if (pathAdd) {
        setTraversalPath((prev) => [...prev, pathAdd]);
      }
    } else {
      setHighlightedNodes(new Set());
    }

    currentAnimationIndexRef.current++;
    const delay = MAX_DELAY - speedSliderValue + MIN_DELAY;
    timeoutIdRef.current = setTimeout(runAnimationStep, delay);
  };

  const currentAlgorithmInfo = useMemo(() => {
    if (isAnimating) {
      if (selectedTraversal === 'inOrder') return TREE_INFO.inOrder;
      if (selectedTraversal === 'preOrder') return TREE_INFO.preOrder;
      if (selectedTraversal === 'postOrder') return TREE_INFO.postOrder;
    }
    return TREE_INFO.bst;
  }, [isAnimating, selectedTraversal]);

  // dynamic root position based on container
  const rootX = vizSize.width / 2;
  const rootY = 60;

  return (
    <div className="visualizer-container">
      <div className="input-panel">
        <div className="input-group">
          <input
            type="text"
            placeholder="e.g., 50,25,75,10"
            value={treeValues}
            onChange={(e) => setTreeValues(e.target.value)}
            disabled={isAnimating}
          />
          <button onClick={buildTree} disabled={isAnimating}>
            Build Tree
          </button>
        </div>
        <div className="input-group">
          <input
            type="number"
            placeholder="Search Value"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={isAnimating || tree === null}
          />
          <button onClick={handleSearch} disabled={isAnimating || tree === null}>
            Search
          </button>
        </div>
      </div>
      <div className="control-panel">
        <div className="dropdown-container">
          <label>Traversal:</label>
          <select
            value={selectedTraversal}
            onChange={(e) => setSelectedTraversal(e.target.value)}
            disabled={isAnimating}
          >
            <option value="inOrder">In-order</option>
            <option value="preOrder">Pre-order</option>
            <option value="postOrder">Post-order</option>
          </select>
        </div>
        <button onClick={handleTraversal} disabled={isAnimating || tree === null}>
          Traverse
        </button>
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
      </div>
      <div className="algorithm-info">
        <h3>{currentAlgorithmInfo.name}</h3>
        <p>
          <strong>Description:</strong> {currentAlgorithmInfo.description}
        </p>
        <div className="complexity-container">
          <p>
            <strong>Time Complexity:</strong> {currentAlgorithmInfo.timeComplexity}
          </p>
          <p>
            <strong>Space Complexity:</strong> {currentAlgorithmInfo.spaceComplexity}
          </p>
        </div>
      </div>
      <div className="traversal-path-box">
        <strong>Traversal Path:</strong> {traversalPath.join(' -> ')}
      </div>
      <div
        className="visualization-area"
        ref={svgContainerRef}
        style={{ height: '60vh', position: 'relative', overflow: 'hidden' }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${vizSize.width} ${vizSize.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {tree &&
            renderTreeNodes(
              tree,
              rootX,
              rootY,
              0,
              highlightedNodes,
              vizSize.width
            )}
        </svg>
      </div>
      <div className="explanation-box">
        <p>{explanation}</p>
      </div>
    </div>
  );
};

export default TreeVisualizer;
