import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./pages/Home";
import "./styles/global.css";

function App() {
  return (
    <>
      <Sidebar />
      <Home />
    </>
  );
}

export default App;