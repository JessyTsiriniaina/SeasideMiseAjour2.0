import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Dashboard from './screens/Dashboard'
import Login from './screens/Login'
import ProtectedRoutes from './utils/ProtectedRoutes'
import NotFoundPage from './screens/NotFoundPage'
import EventDetails from './screens/EventDetails'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Login/>} path='/login'/>
          <Route element={<ProtectedRoutes/>}>
            <Route element={<Dashboard/>} path='/'/>
            <Route element={<Dashboard/>} path='/dashboard'/>
            <Route element={<EventDetails/>} path='/event/:eventId'/>
          </Route>
          <Route element={<NotFoundPage/>} path='*'/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
