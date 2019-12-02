import React, { useState } from 'react'

function One() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        You clicked page_one {count} times
      </button>
    </div>
  );
}

export default One