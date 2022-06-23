import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

function App() {
  let article: any
  let setArticle: any
  [article, setArticle] = useState({})

  useEffect(() => {
    setArticle({ title: "Article here" })
  }, [])
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <div className={"comment"} style={{ color: "black" }}>
          <h3>
            {article.title}
          </h3>
        </div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
