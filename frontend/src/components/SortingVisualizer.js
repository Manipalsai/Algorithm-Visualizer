import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import './Visualizer.css';

const ARRAY_SIZE_LIMIT = 50;
const MIN_DELAY = 10;
const MAX_DELAY = 3000;

// ======================================================================================================
//                              ALGORITHM INFORMATION
// ======================================================================================================
const ALGORITHM_INFO = {
  bubbleSort: {
    name: 'Bubble Sort',
    description:
      'A simple comparison-based algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. It is an in-place sort.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
  },
  selectionSort: {
    name: 'Selection Sort',
    description:
      'An in-place comparison sort that finds the minimum element from the unsorted portion of the list and swaps it with the first element of that portion. This process is repeated until the list is sorted.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
  },
  insertionSort: {
    name: 'Insertion Sort',
    description:
      'Builds the final sorted array one item at a time. It iterates through the input list and removes one element, finding its correct position within the already sorted part of the list. It is efficient for small datasets.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
  },
  quickSort: {
    name: 'Quick Sort',
    description:
      'A "divide-and-conquer" algorithm that picks an element as a pivot and partitions the array around it. It is typically the fastest sorting algorithm in practice, with a worst-case time complexity of O(n²).',
    timeComplexity: 'O(n log n) (Average)',
    spaceComplexity: 'O(log n)',
  },
  mergeSort: {
    name: 'Merge Sort',
    description:
      'A "divide-and-conquer" algorithm that divides the array into halves, sorts them recursively, and then merges the two sorted halves. It is a stable sort with a guaranteed O(n log n) time complexity in all cases.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
  },
  heapSort: {
    name: 'Heap Sort',
    description:
      'An in-place sorting algorithm that treats the input array as a binary heap data structure. It then repeatedly extracts the minimum (or maximum) element from the heap and places it at the end of the array.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
  },
};

// ======================================================================================================
//                              SORTING ALGORITHMS
// ======================================================================================================

const isArraySorted = (array, sortOrder) => {
  if (array.length <= 1) return true;
  for (let i = 1; i < array.length; i++) {
    if (sortOrder === 'ascending') {
      if (array[i - 1] > array[i]) return false;
    } else {
      if (array[i - 1] < array[i]) return false;
    }
  }
  return true;
};

const bubbleSort = (array, sortOrder) => {
  const arr = [...array];
  const animations = [];
  const shouldSwap = (a, b) => (sortOrder === 'ascending' ? a > b : a < b);

  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      animations.push({
        type: 'compare',
        indices: [j, j + 1],
        text: `Comparing adjacent elements ${arr[j]} and ${arr[j + 1]}.`,
      });
      if (shouldSwap(arr[j], arr[j + 1])) {
        animations.push({
          type: 'swap',
          indices: [j, j + 1],
          text: `Swapping ${arr[j]} and ${arr[j + 1]} because they are out of order.`,
        });
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
      animations.push({
        type: 'reset',
        indices: [j, j + 1],
        text: `Pass complete. Elements are now in correct relative order.`,
      });
    }
    animations.push({
      type: 'final_position',
      indices: [arr.length - 1 - i],
      text: `Largest unsorted element ${arr[arr.length - 1 - i]} is now in its final position.`,
    });
  }
  animations.push({
    type: 'final_position',
    indices: [0],
    text: `Array is fully sorted!`,
  });
  return { animations, finalArray: arr };
};

const selectionSort = (array, sortOrder) => {
  const arr = [...array];
  const animations = [];
  const shouldUpdateMinIndex = (a, b) =>
    sortOrder === 'ascending' ? a > b : a < b;

  for (let i = 0; i < arr.length; i++) {
    let minOrMaxIndex = i;
    animations.push({
      type: 'mark_min',
      indices: [i],
      text: `Starting pass ${i + 1}. Assuming ${arr[i]} is the ${
        sortOrder === 'ascending' ? 'minimum' : 'maximum'
      }.`,
    });

    for (let j = i + 1; j < arr.length; j++) {
      animations.push({
        type: 'compare',
        indices: [j, minOrMaxIndex],
        text: `Comparing ${arr[j]} with current ${
          sortOrder === 'ascending' ? 'minimum' : 'maximum'
        } ${arr[minOrMaxIndex]}.`,
      });
      if (shouldUpdateMinIndex(arr[minOrMaxIndex], arr[j])) {
        animations.push({
          type: 'mark_min_change',
          indices: [j, minOrMaxIndex],
          text: `${arr[j]} is the new ${
            sortOrder === 'ascending' ? 'minimum' : 'maximum'
          }.`,
        });
        minOrMaxIndex = j;
      }
      animations.push({
        type: 'reset',
        indices: [j, minOrMaxIndex],
        text: `Comparison complete.`,
      });
    }

    if (minOrMaxIndex !== i) {
      animations.push({
        type: 'swap',
        indices: [i, minOrMaxIndex],
        text: `Swapping ${arr[i]} with the ${
          sortOrder === 'ascending' ? 'minimum' : 'maximum'
        } element ${arr[minOrMaxIndex]}.`,
      });
      [arr[i], arr[minOrMaxIndex]] = [arr[minOrMaxIndex], arr[i]];
    }
    animations.push({
      type: 'final_position',
      indices: [i],
      text: `Element ${arr[i]} is now in its final sorted position.`,
    });
  }
  animations.push({
    type: 'final_position',
    indices: [arr.length - 1],
    text: 'Array is fully sorted!',
  });
  return { animations, finalArray: arr };
};

const insertionSort = (array, sortOrder) => {
  const arr = [...array];
  const animations = [];
  const shouldShift = (a, b) =>
    sortOrder === 'ascending' ? a > b : a < b;

  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    animations.push({
      type: 'mark_key',
      indices: [i],
      text: `Picking up ${key} as the key to insert.`,
    });

    while (j >= 0 && shouldShift(arr[j], key)) {
      animations.push({
        type: 'compare',
        indices: [j, i],
        text: `Comparing ${key} with ${arr[j]}.`,
      });
      animations.push({
        type: 'shift',
        indices: [j, j + 1],
        text: `Shifting ${arr[j]} to the right to make space for the key.`,
      });
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
    animations.push({
      type: 'place',
      indices: [j + 1, i],
      text: `Placing ${key} in its correct sorted position.`,
    });
    animations.push({
      type: 'reset_key',
      indices: [j + 1, i],
      text: `Key placed.`,
    });
  }

  for (let i = 0; i < arr.length; i++) {
    animations.push({
      type: 'final_position',
      indices: [i],
      text: `Element ${arr[i]} is in its final position.`,
    });
  }
  animations.push({
    type: 'final_position',
    indices: [arr.length - 1],
    text: `Array is fully sorted!`,
  });

  return { animations, finalArray: arr };
};

const quickSort = (array, sortOrder) => {
  const arr = [...array];
  const animations = [];
  const shouldPartition = (pivot, element) =>
    sortOrder === 'ascending' ? element <= pivot : element >= pivot;

  const partition = (arr, low, high) => {
    let pivot = arr[high];
    animations.push({
      type: 'mark_pivot',
      indices: [high],
      text: `Selecting ${pivot} as the pivot.`,
    });
    let i = low - 1;

    for (let j = low; j < high; j++) {
      animations.push({
        type: 'compare',
        indices: [j, high],
        text: `Comparing ${arr[j]} with pivot ${pivot}.`,
      });
      if (shouldPartition(pivot, arr[j])) {
        i++;
        animations.push({
          type: 'swap',
          indices: [i, j],
          text: `Swapping ${arr[i]} and ${arr[j]}.`,
        });
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      animations.push({
        type: 'reset_compare',
        indices: [j, high],
        text: `Comparison complete.`,
      });
    }
    animations.push({
      type: 'swap',
      indices: [i + 1, high],
      text: `Swapping pivot ${pivot} to its correct position.`,
    });
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    animations.push({
      type: 'final_position',
      indices: [i + 1],
      text: `Pivot ${arr[i + 1]} is in its final position.`,
    });
    return i + 1;
  };

  const sort = (arr, low, high) => {
    if (low < high) {
      let pi = partition(arr, low, high);
      sort(arr, low, pi - 1);
      sort(arr, pi + 1, high);
    }
  };
  sort(arr, 0, arr.length - 1);

  for (let i = 0; i < arr.length; i++) {
    animations.push({
      type: 'final_position',
      indices: [i],
      text: `Element ${arr[i]} is in its final position.`,
    });
  }
  animations.push({
    type: 'final_position',
    indices: [arr.length - 1],
    text: `Array is fully sorted!`,
  });

  return { animations, finalArray: arr };
};

const mergeSort = (array, sortOrder) => {
  const arr = [...array];
  const animations = [];

  const merge = (arr, l, m, r) => {
    let i = l,
      j = m + 1,
      k = 0;
    let temp = [];
    const shouldSwap = (a, b) =>
      sortOrder === 'ascending' ? a > b : a < b;

    while (i <= m && j <= r) {
      animations.push({
        type: 'compare',
        indices: [i, j],
        text: `Comparing ${arr[i]} and ${arr[j]}.`,
      });
      if (shouldSwap(arr[j], arr[i])) {
        temp[k++] = arr[i++];
      } else {
        temp[k++] = arr[j++];
      }
      animations.push({
        type: 'reset_compare',
        indices: [i - 1, j - 1],
        text: `Comparison complete.`,
      });
    }

    while (i <= m) {
      temp[k++] = arr[i++];
    }

    while (j <= r) {
      temp[k++] = arr[j++];
    }

    for (i = l, k = 0; i <= r; i++, k++) {
      animations.push({
        type: 'overwrite',
        indices: [i, temp[k]],
        text: `Overwriting arr[${i}] with ${temp[k]}.`,
      });
      arr[i] = temp[k];
    }
  };

  const sort = (arr, l, r) => {
    if (l < r) {
      let m = Math.floor(l + (r - l) / 2);
      sort(arr, l, m);
      sort(arr, m + 1, r);
      merge(arr, l, m, r);
    }
  };
  sort(arr, 0, arr.length - 1);

  for (let i = 0; i < arr.length; i++) {
    animations.push({
      type: 'final_position',
      indices: [i],
      text: `Element ${arr[i]} is in its final position.`,
    });
  }
  animations.push({
    type: 'final_position',
    indices: [arr.length - 1],
    text: `Array is fully sorted!`,
  });

  return { animations, finalArray: arr };
};

const heapSort = (array, sortOrder) => {
  const arr = [...array];
  const animations = [];
  const shouldHeapify = (a, b) =>
    sortOrder === 'ascending' ? a > b : a < b;

  const heapify = (arr, n, i) => {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    if (l < n && shouldHeapify(arr[l], arr[largest])) {
      largest = l;
    }
    if (r < n && shouldHeapify(arr[r], arr[largest])) {
      largest = r;
    }

    if (largest !== i) {
      animations.push({
        type: 'compare',
        indices: [i, largest],
        text: `Comparing ${arr[i]} with largest child ${arr[largest]}.`,
      });
      animations.push({
        type: 'swap',
        indices: [i, largest],
        text: `Swapping ${arr[i]} and ${arr[largest]}.`,
      });
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      heapify(arr, n, largest);
    }
  };

  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    heapify(arr, arr.length, i);
  }

  for (let i = arr.length - 1; i > 0; i--) {
    animations.push({
      type: 'swap',
      indices: [0, i],
      text: `Swapping root ${arr[0]} with last element ${arr[i]}.`,
    });
    [arr[0], arr[i]] = [arr[i], arr[0]];
    animations.push({
      type: 'final_position',
      indices: [i],
      text: `Element ${arr[i]} is in its final position.`,
    });
    heapify(arr, i, 0);
  }
  animations.push({
    type: 'final_position',
    indices: [0],
    text: `Element ${arr[0]} is in its final position.`,
  });

  return { animations, finalArray: arr };
};

const Visualizer = () => {
  const [array, setArray] = useState([]);
  const [userArrayInput, setUserArrayInput] = useState('');
  const [explanation, setExplanation] = useState('Welcome! Load an array to begin.');
  const [isSorting, setIsSorting] = useState(false);
  const [speedSliderValue, setSpeedSliderValue] = useState(500);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');
  const [sortOrder, setSortOrder] = useState('ascending');
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  const animationsRef = useRef([]);
  const currentAnimationIndexRef = useRef(0);
  const localArrayRef = useRef([]);
  const timeoutIdRef = useRef(null);

  const vizAreaRef = useRef(null);
  const [vizHeight, setVizHeight] = useState(0);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (vizAreaRef.current) {
        setVizHeight(vizAreaRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const clearArray = () => {
    if (isSorting) return;
    setArray([]);
    setUserArrayInput('');
    setExplanation('Canvas is clear. Input a new array to begin.');
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
  };

  const loadUserArray = () => {
    if (isSorting) return;
    try {
      const newArray = userArrayInput.split(',').map(Number);
      if (newArray.some(isNaN) || newArray.length > ARRAY_SIZE_LIMIT || newArray.length < 2) {
        throw new Error('Invalid input');
      }
      setArray(newArray);
      setExplanation('User array loaded successfully. Click "Sort" to begin!');
    } catch (e) {
      setExplanation(
        `Invalid array. Please use comma-separated numbers (min 2, max ${ARRAY_SIZE_LIMIT} elements).`
      );
    }
  };

  const handleSort = () => {
    if (array.length === 0) {
      setExplanation('Please load an array first!');
      return;
    }

    if (isArraySorted(array, sortOrder)) {
      alert('Array is already sorted!');
      return;
    }

    setIsSorting(true);
    currentAnimationIndexRef.current = 0;
    localArrayRef.current = [...array];

    let result;
    if (selectedAlgorithm === 'bubbleSort') {
      result = bubbleSort(array, sortOrder);
    } else if (selectedAlgorithm === 'selectionSort') {
      result = selectionSort(array, sortOrder);
    } else if (selectedAlgorithm === 'insertionSort') {
      result = insertionSort(array, sortOrder);
    } else if (selectedAlgorithm === 'quickSort') {
      result = quickSort(array, sortOrder);
    } else if (selectedAlgorithm === 'mergeSort') {
      result = mergeSort(array, sortOrder);
    } else if (selectedAlgorithm === 'heapSort') {
      result = heapSort(array, sortOrder);
    }
    animationsRef.current = result.animations;

    runAnimationStep();
  };

  const runAnimationStep = () => {
    if (currentAnimationIndexRef.current >= animationsRef.current.length) {
      setIsSorting(false);
      setExplanation('Array is fully sorted!');
      const arrayBars = document.getElementsByClassName('array-bar');
      for (let i = 0; i < arrayBars.length; i++) {
        arrayBars[i].style.backgroundColor = '#32CD32';
      }
      return;
    }

    const animation = animationsRef.current[currentAnimationIndexRef.current];
    const { type, indices, text } = animation;
    setExplanation(text);

    const arrayBars = document.getElementsByClassName('array-bar');

    for (let i = 0; i < arrayBars.length; i++) {
      arrayBars[i].style.backgroundColor = '#00CED1';
    }

    if (type === 'compare') {
      indices.forEach((index) => {
        if (arrayBars[index]) arrayBars[index].style.backgroundColor = '#FFD700';
      });
    } else if (type === 'mark_min' || type === 'mark_key' || type === 'mark_pivot') {
      if (arrayBars[indices[0]]) arrayBars[indices[0]].style.backgroundColor = '#9370DB';
    } else if (type === 'reset' || type === 'reset_key' || type === 'reset_compare') {
      // nothing extra
    } else if (type === 'swap') {
      const [index1, index2] = indices;

      [localArrayRef.current[index1], localArrayRef.current[index2]] = [
        localArrayRef.current[index2],
        localArrayRef.current[index1],
      ];
      setArray([...localArrayRef.current]);
      if (arrayBars[index1]) arrayBars[index1].style.backgroundColor = '#FF6347';
      if (arrayBars[index2]) arrayBars[index2].style.backgroundColor = '#FF6347';
    } else if (type === 'mark_min_change') {
      if (arrayBars[indices[1]]) arrayBars[indices[1]].style.backgroundColor = '#00CED1';
      if (arrayBars[indices[0]]) arrayBars[indices[0]].style.backgroundColor = '#9370DB';
    } else if (type === 'final_position') {
      if (arrayBars[indices[0]]) arrayBars[indices[0]].style.backgroundColor = '#32CD32';
    } else if (type === 'shift') {
      const [from, to] = indices;
      const newArray = [...localArrayRef.current];
      const barToMove = newArray.splice(from, 1)[0];
      newArray.splice(to, 0, barToMove);
      localArrayRef.current = newArray;
      setArray([...localArrayRef.current]);
    } else if (type === 'place') {
      // handled by state updates
    } else if (type === 'overwrite') {
      const [index, value] = indices;
      localArrayRef.current[index] = value;
      setArray([...localArrayRef.current]);
    }

    currentAnimationIndexRef.current++;
    const delay = MAX_DELAY - speedSliderValue + MIN_DELAY;
    timeoutIdRef.current = setTimeout(runAnimationStep, delay);
  };

  const maxVal = useMemo(() => (array.length > 0 ? Math.max(...array) : 1), [array]);
  const currentAlgorithmInfo = ALGORITHM_INFO[selectedAlgorithm];

  return (
    <div className="visualizer-container">
      <div className="input-panel">
        <div className="input-group">
          <input
            type="text"
            placeholder="e.g., 10,2,50,4"
            value={userArrayInput}
            onChange={(e) => setUserArrayInput(e.target.value)}
            disabled={isSorting}
          />
          <button onClick={loadUserArray} disabled={isSorting}>
            Load Array
          </button>
          <button onClick={clearArray} disabled={isSorting}>
            Clear Array
          </button>
        </div>
      </div>
      <div className="control-panel">
        <div className="dropdown-container">
          <label>Algorithm:</label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            disabled={isSorting}
          >
            <option value="bubbleSort">Bubble Sort</option>
            <option value="selectionSort">Selection Sort</option>
            <option value="insertionSort">Insertion Sort</option>
            <option value="quickSort">Quick Sort</option>
            <option value="mergeSort">Merge Sort</option>
            <option value="heapSort">Heap Sort</option>
          </select>
        </div>
        <div className="dropdown-container">
          <label>Order:</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} disabled={isSorting}>
            <option value="ascending">Ascending</option>
            <option value="descending">Descending</option>
          </select>
        </div>
        <button onClick={handleSort} disabled={isSorting}>
          Sort
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
            <strong>Time Complexity:</strong> {currentAlgorithmInfo.timeComplexity}
          </p>
          <p>
            <strong>Space Complexity:</strong> {currentAlgorithmInfo.spaceComplexity}
          </p>
        </div>
      </div>
      <div className="visualization-area with-bars" ref={vizAreaRef}>
        <div className="array-wrapper">
          {array.map((value, index) => {
            const barHeight =
              vizHeight > 0
                ? Math.max(4, (value / maxVal) * vizHeight * 0.9)
                : 0;
            return (
              <div
                className="array-bar default"
                key={index}
                style={{
                  height: `${barHeight}px`,
                }}
                onMouseEnter={(e) => {
                  const rect = e.target.getBoundingClientRect();
                  setTooltip({
                    visible: true,
                    text: `Value: ${value}`,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() =>
                  setTooltip({ visible: false, text: '', x: 0, y: 0 })
                }
              ></div>
            );
          })}
        </div>
      </div>
      <div className="explanation-box">
        <p>{explanation}</p>
      </div>
      {tooltip.visible && (
        <div className="tooltip" style={{ top: tooltip.y - 40, left: tooltip.x }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default Visualizer;
