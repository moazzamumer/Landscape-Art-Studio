import Create from "pages/Create/index";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "pages/Home";
import MyImages from "pages/MyImages/MyImages";
import { Redirect } from "components/Redirect";
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Redirect/>} />
        <Route path="/create" element={<Create />} />
        <Route path="/my-images" element={<MyImages />} />
        <Route path="*" element={<div className=" text-center text-4xl"> Page Not Found</div>}/>
      </Routes>
    </div>
  );
}

export default App;
