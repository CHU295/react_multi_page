import React, { useState } from 'react'
import ReactDOM from 'react-dom';
import * as serviceWorker from '../../serviceWorker';

function One() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        You clicked page_two {count} times
      </button>
    </div>
  );
}

ReactDOM.render(<One />, document.getElementById('root'));

serviceWorker.unregister();