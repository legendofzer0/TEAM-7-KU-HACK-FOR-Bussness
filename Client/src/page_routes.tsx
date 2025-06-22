import { Routes, Route } from "react-router-dom";
import ChatWindow from "./components/ChatWindow";

function PageRoutes() {
  return (
    <Routes>
      <Route path="/c/:chat_record_id" element={<ChatWindow />} />
    </Routes>
  );
}

export default PageRoutes;
