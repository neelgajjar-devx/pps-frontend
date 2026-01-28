import { Routes, Route } from 'react-router-dom'
import './App.css'
import ArticlesList from './components/ArticlesList'
import ArticleDetail from './components/ArticleDetail'

function App() {
  return (
    <Routes>
      <Route path='/'  element={<ArticlesList />} />
      <Route path='/articles' element={<ArticlesList />} />
      <Route path='/articles/:id' element={<ArticleDetail />} />
    </Routes>
  )
}

export default App
