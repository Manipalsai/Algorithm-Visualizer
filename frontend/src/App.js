import React, { useState } from 'react';
import SortingVisualizer from './components/SortingVisualizer';
import SearchingVisualizer from './components/SearchingVisualizer';
import GraphVisualizer from './components/GraphVisualizer';
import TreeVisualizer from './components/TreeVisualizer';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import './App.css';

function App() {
  const [activeVisualizer, setActiveVisualizer] = useState('sorting');

  const renderVisualizer = () => {
    switch (activeVisualizer) {
      case 'sorting':
        return <SortingVisualizer />;
      case 'searching':
        return <SearchingVisualizer />;
      case 'graphs':
        return <GraphVisualizer />;
      case 'trees':
        return <TreeVisualizer />;
      case 'linkedList':
        return <LinkedListVisualizer />;
      default:
        return <SortingVisualizer />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Algorithm Visualizer</h1>
        <div className="visualizer-selector">
          <button onClick={() => setActiveVisualizer('sorting')}>Sorting Algorithms</button>
          <button onClick={() => setActiveVisualizer('searching')}>Searching Algorithms</button>
          <button onClick={() => setActiveVisualizer('graphs')}>Graph Traversal</button>
          <button onClick={() => setActiveVisualizer('trees')}>Tree Algorithms</button>
          <button onClick={() => setActiveVisualizer('linkedList')}>Linked Lists</button>
        </div>
      </header>
      {renderVisualizer()}
    </div>
  );
}

export default App;