import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import './Visualizer.css';

const ARRAY_SIZE_LIMIT = 50;
const MIN_DELAY = 10;
const MAX_DELAY = 3000;

// ======================================================================================================
//                              ALGORITHM INFORMATION
// ======================================================================================================
const ALGORITHM_INFO = {
  linearSearch: {
    name: 'Linear Search',
    description:
      'A simple method that checks each element in the list sequentially until a match is found or the entire list has been searched. It is an inefficient algorithm but works on both sorted and unsorted data.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  binarySearch: {
    name: 'Binary Search',
    description:
      'A highly efficient search algorithm that works on a sorted list. It repeatedly divides the search interval in half. If the value of the search key is less than the middle element, it searches the lower half; otherwise, it searches the upper half.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
  },
};

// ======================================================================================================
//                              SEARCHING ALGORITHMS
// ======================================================================================================

const linearSearch = (array, target) => {
  const arr = [...array];
  const animations = [];
  for (let i = 0; i < arr.length; i++) {
    animations.push({
      type: 'compare',
      indices: [i],
      text: `Comparing element at index ${i} (${arr[i]}) with the target (${target}).`,
    });
    if (arr[i] === target) {
      animations.push({
        type: 'found',
        indices: [i],
        text: `Target ${target} found at index ${i}!`,
      });
      return { animations };
    }
  }
  animations.push({
    type: 'not_found',
    indices: [],
    text: `Target ${target} was not found.`,
  });
  return { animations };
};

const binarySearch = (array, target) => {
  const arr = [...array];
  const animations = [];
  let low = 0;
  let high = arr.length - 1;
  let mid;

  while (low <= high) {
    mid = Math.floor((low + high) / 2);
    animations.push({
      type: 'compare_range',
      indices: [low, high],
      text: `Searching in range from index ${low} to ${high}.`,
    });
    animations.push({
      type: 'compare',
      indices: [mid],
      text: `Comparing middle element ${arr[mid]} with target ${target}.`,
    });

    if (arr[mid] === target) {
      animations.push({
        type: 'found',
        indices: [mid],
        text: `Target ${target} found at index ${mid}!`,
      });
      return { animations };
    } else if (arr[mid] < target) {
      low = mid + 1;
      animations.push({
        type: 'adjust_range',
        indices: [mid, low],
        text: `Target is larger. Ignoring left half.`,
      });
    } else {
      high = mid - 1;
      animations.push({
        type: 'adjust_range',
        indices: [mid, high],
        text: `Target is smaller. Ignoring right half.`,
      });
    }
  }

  animations.push({
    type: 'not_found',
    indices: [],
    text: `Target ${target} was not found.`,
  });
  return { animations };
};

const SearchingVisualizer = () => {
  const [array, setArray] = useState([]);
  const [userArrayInput, setUserArrayInput] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [explanation, setExplanation] = useState(
    'Welcome to the Searching Visualizer! Load an array to begin.'
  );
  const [isSearching, setIsSearching] = useState(false);
  const [speedSliderValue, setSpeedSliderValue] = useState(500);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('linearSearch');
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  const animationsRef = useRef([]);
  const currentAnimationIndexRef = useRef(0);
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
    if (isSearching) return;
    setArray([]);
    setTargetValue('');
    setUserArrayInput('');
    setExplanation('Canvas is clear. Input a new array to begin.');
  };

  const loadUserArray = (input) => {
    if (isSearching) return;
    try {
      const newArray = input.split(',').map(Number);
      if (
        newArray.some(isNaN) ||
        newArray.length > ARRAY_SIZE_LIMIT ||
        newArray.length < 2
      ) {
        throw new Error('Invalid input');
      }
      if (selectedAlgorithm === 'binarySearch') {
        newArray.sort((a, b) => a - b);
        setExplanation(
          'Binary Search requires a sorted array. Your array has been sorted automatically.'
        );
      } else {
        setExplanation(
          'User array loaded successfully. Enter a target value and click "Search".'
        );
      }
      setArray(newArray);
    } catch (e) {
      setExplanation(
        `Invalid array. Please use comma-separated numbers (min 2, max ${ARRAY_SIZE_LIMIT} elements).`
      );
    }
  };

  const animateSearching = (animations) => {
    if (isSearching) return;
    setIsSearching(true);
    currentAnimationIndexRef.current = 0;
    animationsRef.current = animations;

    const runAnimationStep = () => {
      if (currentAnimationIndexRef.current >= animationsRef.current.length) {
        setIsSearching(false);
        setExplanation('Search complete.');
        return;
      }

      const animation = animationsRef.current[currentAnimationIndexRef.current];
      const { type, indices, text } = animation;
      setExplanation(text);

      const arrayBars = document.getElementsByClassName('array-bar');
      for (let i = 0; i < arrayBars.length; i++) {
        arrayBars[i].style.backgroundColor = '#00CED1';
      }

      if (type === 'compare' || type === 'compare_range') {
        indices.forEach((index) => {
          if (arrayBars[index]) arrayBars[index].style.backgroundColor = '#FFD700';
        });
      } else if (type === 'found') {
        indices.forEach((index) => {
          if (arrayBars[index]) arrayBars[index].style.backgroundColor = '#32CD32';
        });
        setIsSearching(false);
        setExplanation(text);
        return;
      } else if (type === 'not_found') {
        setIsSearching(false);
        setExplanation(text);
        return;
      } else if (type === 'adjust_range') {
        // explanation only
      }

      currentAnimationIndexRef.current++;
      const delay = MAX_DELAY - speedSliderValue + MIN_DELAY;
      timeoutIdRef.current = setTimeout(runAnimationStep, delay);
    };
    runAnimationStep();
  };

  const handleSearch = () => {
    if (array.length === 0) {
      setExplanation('Please load an array first!');
      return;
    }
    if (targetValue === '' || isNaN(parseInt(targetValue))) {
      setExplanation('Please enter a valid number to search for.');
      return;
    }
    const target = parseInt(targetValue);
    let animations;

    if (selectedAlgorithm === 'linearSearch') {
      animations = linearSearch(array, target).animations;
    } else if (selectedAlgorithm === 'binarySearch') {
      const sortedArray = [...array].sort((a, b) => a - b);
      if (!arraysEqual(array, sortedArray)) {
        setArray(sortedArray);
        alert("Binary search requires a sorted array. The array has been sorted for you.");
      }
      animations = binarySearch(sortedArray, target).animations;
    }
    animateSearching(animations);
  };

  const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
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
            disabled={isSearching}
          />
          <button onClick={() => loadUserArray(userArrayInput)} disabled={isSearching}>
            Load Array
          </button>
          <button onClick={clearArray} disabled={isSearching}>
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
            disabled={isSearching}
          >
            <option value="linearSearch">Linear Search</option>
            <option value="binarySearch">Binary Search</option>
          </select>
        </div>
        <div className="search-input-group">
          <input
            type="number"
            placeholder="Target Value"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            disabled={isSearching}
          />
          <button onClick={handleSearch} disabled={isSearching}>
            Search
          </button>
        </div>
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
                className="array-bar"
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

export default SearchingVisualizer;
