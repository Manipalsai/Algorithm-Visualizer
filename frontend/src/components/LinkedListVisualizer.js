import React, { useState, useEffect, useRef } from 'react';
import './Visualizer.css';

const MIN_DELAY = 10;
const MAX_DELAY = 3000;

const LINKED_LIST_INFO = {
    singlyLinkedList: {
        name: 'Singly Linked List',
        description: 'A linear data structure consisting of nodes where each node has a value and a pointer to the next node in the sequence.',
        timeComplexity: 'O(n) (Search)',
        spaceComplexity: 'O(n)'
    },
    doublyLinkedList: {
        name: 'Doubly Linked List',
        description: 'A list where each node has pointers to both the next and previous nodes. This allows for efficient traversal in both forward and backward directions.',
        timeComplexity: 'O(n) (Search)',
        spaceComplexity: 'O(n)'
    }
};

// ======================================================================================================
//                              LINKED LIST DATA STRUCTURE & ALGORITHMS
// ======================================================================================================

class SinglyNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class DoublyNode {
    constructor(value) {
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

const insert = (head, value, listType) => {
    let newNode;
    if (listType === 'doublyLinkedList') newNode = new DoublyNode(value);
    else newNode = new SinglyNode(value);
    
    if (head === null) {
        return newNode;
    }
    
    let current = head;
    while(current.next !== null){
        current = current.next;
    }
    
    if (listType === 'doublyLinkedList') {
        current.next = newNode;
        newNode.prev = current;
    } else {
        current.next = newNode;
    }
    
    return head;
};

const searchList = (head, value, animations, listType) => {
    let current = head;
    let index = 0;
    while (current !== null) {
        animations.push({ type: 'highlight', node: current.value, text: `Searching for ${value}. Comparing with node ${current.value} at index ${index}.` });
        if (current.value === value) {
            animations.push({ type: 'found', node: current.value, text: `Value ${value} found!` });
            return true;
        }
        current = current.next;
        index++;
    }
    animations.push({ type: 'not_found', node: null, text: `Value ${value} not found in the list.` });
    return false;
};

const deleteNode = (head, value, animations, listType) => {
    if (head === null) {
        animations.push({ type: 'not_found', node: null, text: `List is empty. Cannot delete ${value}.` });
        return head;
    }
    
    if (head.value === value) {
        animations.push({ type: 'delete_head', node: value, text: `Deleting head node ${value}.` });
        let newHead = head.next;
        if(listType === 'doublyLinkedList' && newHead) newHead.prev = null;
        return newHead;
    }
    
    let current = head;
    while(current.next !== null && current.next.value !== value){
        animations.push({ type: 'highlight', node: current.value, text: `Traversing to find the node before ${value}.` });
        current = current.next;
    }
    
    if (current.next !== null && current.next.value === value) {
        animations.push({ type: 'delete', node: value, text: `Deleting node ${value}.` });
        if (listType === 'doublyLinkedList' && current.next.next !== null) {
            current.next.next.prev = current;
        }
        current.next = current.next.next;
    } else {
        animations.push({ type: 'not_found', node: null, text: `Value ${value} not found in the list.` });
    }
    return head;
};

// ======================================================================================================
//                              VISUALIZER COMPONENT
// ======================================================================================================

const LinkedListVisualizer = () => {
    const [listValues, setListValues] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [deleteValue, setDeleteValue] = useState('');
    const [explanation, setExplanation] = useState('Enter values to build a Linked List.');
    const [isAnimating, setIsAnimating] = useState(false);
    const [speedSliderValue, setSpeedSliderValue] = useState(500);
    const [head, setHead] = useState(null);
    const [highlightedNode, setHighlightedNode] = useState(null);
    const [listType, setListType] = useState('singlyLinkedList');
    
    const animationsRef = useRef([]);
    const currentAnimationIndexRef = useRef(0);
    const timeoutIdRef = useRef(null);
    const svgRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
        };
    }, []);

    const buildList = () => {
        if (isAnimating) return;
        setHead(null);
        setExplanation('Building a new Linked List...');
        const values = listValues.split(',').map(Number);
        if (values.some(isNaN)) {
            setExplanation('Invalid input. Please use comma-separated numbers.');
            return;
        }

        let newHead = null;
        values.forEach(value => {
            newHead = insert(newHead, value, listType);
        });
        setHead(newHead);
        setExplanation('Linked List built successfully.');
    };

    const handleSearch = () => {
        if (isAnimating || head === null) return;
        const value = parseInt(searchValue);
        if (isNaN(value)) {
            setExplanation('Please enter a valid number to search for.');
            return;
        }
        setIsAnimating(true);
        setHighlightedNode(null);
        const animations = [];
        searchList(head, value, animations, listType);
        animationsRef.current = animations;
        currentAnimationIndexRef.current = 0;
        runAnimationStep();
    };

    const handleDelete = () => {
        if (isAnimating || head === null) return;
        const value = parseInt(deleteValue);
        if (isNaN(value)) {
            setExplanation('Please enter a valid number to delete.');
            return;
        }
        setIsAnimating(true);
        setHighlightedNode(null);
        const animations = [];
        const newHead = deleteNode(head, value, animations, listType);
        animationsRef.current = animations;
        currentAnimationIndexRef.current = 0;
        setHead(newHead);
        runAnimationStep();
    };

    const runAnimationStep = () => {
        if (currentAnimationIndexRef.current >= animationsRef.current.length) {
            setIsAnimating(false);
            setHighlightedNode(null);
            setExplanation('Animation complete.');
            return;
        }

        const animation = animationsRef.current[currentAnimationIndexRef.current];
        const { type, node, text } = animation;
        setExplanation(text);
        
        if (type === 'highlight' || type === 'found') {
            setHighlightedNode(node);
        } else {
            setHighlightedNode(null);
        }

        currentAnimationIndexRef.current++;
        const delay = MAX_DELAY - speedSliderValue + MIN_DELAY;
        timeoutIdRef.current = setTimeout(runAnimationStep, delay);
    };

    const renderLinkedList = () => {
        let current = head;
        const nodes = [];
        let x = 50;
        let y = 100;
        
        let nodeCount = 0;
        let temp = head;
        while(temp){
            nodeCount++;
            temp = temp.next;
        }
        
        const totalWidth = nodeCount * 80 + (nodeCount - 1) * 40;
        const startX = (800 - totalWidth) / 2;
        if (startX > 0) {
            x = startX;
        }

        const renderNode = (node) => {
             return (
                <g key={node.value}>
                    <rect x={x} y={y} width="80" height="40" stroke="#333" strokeWidth="2" fill={highlightedNode === node.value ? 'yellow' : '#00CED1'} />
                    <text x={x + 40} y={y + 25} textAnchor="middle" fill="black" fontSize="16">{node.value}</text>
                </g>
             );
        };
        
        let prevX = 0;
        
        while (current) {
            nodes.push(renderNode(current));
            prevX = x;
            
            if (listType === 'singlyLinkedList' && current.next) {
                 x += 120;
                 nodes.push(<line key={`arrow-${current.value}`} x1={prevX + 80} y1={y + 20} x2={x} y2={y + 20} stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />);
            } else if (listType === 'doublyLinkedList' && current.next) {
                 x += 120;
                 nodes.push(
                    <>
                    <line key={`arrow-f-${current.value}`} x1={prevX + 80} y1={y + 15} x2={x} y2={y + 15} stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead-f)" />
                    <line key={`arrow-b-${current.next.value}`} x1={x} y1={y + 25} x2={prevX + 80} y2={y + 25} stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead-b)" />
                    </>
                );
            }
            current = current.next;
        }
        
        return nodes;
    };
    
    const currentAlgorithmInfo = LINKED_LIST_INFO[listType];
    const svgWidth = 800;
    const svgHeight = 200;

    return (
        <div className="visualizer-container">
             <div className="input-panel">
                <div className="dropdown-container">
                    <label>List Type:</label>
                    <select value={listType} onChange={(e) => setListType(e.target.value)} disabled={isAnimating}>
                        <option value="singlyLinkedList">Singly Linked List</option>
                        <option value="doublyLinkedList">Doubly Linked List</option>
                    </select>
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="e.g., 10,20,30"
                        value={listValues}
                        onChange={(e) => setListValues(e.target.value)}
                        disabled={isAnimating}
                    />
                    <button onClick={buildList} disabled={isAnimating}>Build List</button>
                </div>
            </div>
            <div className="control-panel">
                <div className="input-group">
                    <input
                        type="number"
                        placeholder="Search Value"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        disabled={isAnimating || head === null}
                    />
                    <button onClick={handleSearch} disabled={isAnimating || head === null}>Search</button>
                </div>
                <div className="input-group">
                     <input
                        type="number"
                        placeholder="Delete Value"
                        value={deleteValue}
                        onChange={(e) => setDeleteValue(e.target.value)}
                        disabled={isAnimating || head === null}
                    />
                    <button onClick={handleDelete} disabled={isAnimating || head === null}>Delete</button>
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
            </div>
            <div className="algorithm-info">
                <h3>{currentAlgorithmInfo.name}</h3>
                <p><strong>Description:</strong> {currentAlgorithmInfo.description}</p>
                <div className="complexity-container">
                    <p><strong>Time Complexity:</strong> {currentAlgorithmInfo.timeComplexity}</p>
                    <p><strong>Space Complexity:</strong> {currentAlgorithmInfo.spaceComplexity}</p>
                </div>
            </div>
            <div className="visualization-area" style={{ height: '30vh', overflowX: 'auto' }}>
                <svg width="100%" height="100%" viewBox="0 0 800 200">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" />
                        </marker>
                        <marker id="arrowhead-f" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" />
                        </marker>
                        <marker id="arrowhead-b" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" />
                        </marker>
                    </defs>
                    {head && renderLinkedList()}
                </svg>
            </div>
            <div className="explanation-box">
                <p>{explanation}</p>
            </div>
        </div>
    );
};

export default LinkedListVisualizer;
