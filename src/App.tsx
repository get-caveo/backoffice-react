import { useState } from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { Button } from '@/components/ui/button'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Container className="py-5">
      <Row className="justify-content-center mb-4">
        <Col xs="auto">
          <a href="https://vite.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </Col>
      </Row>

      <Row className="justify-content-center mb-4">
        <Col xs="auto">
          <h1 className="text-center">Vite + React</h1>
        </Col>
      </Row>

      <Row className="justify-content-center mb-4">
        <Col xs={12} md={6}>
          <Card className="text-center p-4">
            <Card.Body>
              <div className="d-flex gap-2 justify-content-center mb-3">
                <Button onClick={() => setCount((c) => c + 1)}>Count: {count}</Button>
                <Button variant="secondary" onClick={() => setCount(0)}>
                  Reset
                </Button>
                <Button variant="destructive" onClick={() => setCount((c) => c - 1)}>
                  Decrement
                </Button>
              </div>
              <p className="text-muted">
                Edit <code>src/App.tsx</code> and save to test HMR
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col xs="auto">
          <p className="read-the-docs text-center">
            Click on the Vite and React logos to learn more
          </p>
        </Col>
      </Row>
    </Container>
  )
}

export default App
