import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'


const darkMode = localStorage.getItem("darkMode");
if (darkMode === "true") {
  document.documentElement.classList.add("dark");
} else if (darkMode === "false") {
  document.documentElement.classList.remove("dark");
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
