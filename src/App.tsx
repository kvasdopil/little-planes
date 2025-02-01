import React, { useState, useEffect } from 'react';
import { Button, Layout, Typography } from 'antd';
import styled from 'styled-components';

const { Content } = Layout;
const { Title } = Typography;

const StyledContent = styled(Content)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

function App() {
  const [count, setCount] = useState(() => {
    const savedCount = localStorage.getItem('counter');
    return savedCount !== null ? parseInt(savedCount, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('counter', count.toString());
  }, [count]);

  return (
    <StyledContent>
      <Title level={1}>{count}</Title>
      <Button type="primary" onClick={() => setCount(count + 1)}>
        Increase Counter
      </Button>
    </StyledContent>
  );
}

export default App;
