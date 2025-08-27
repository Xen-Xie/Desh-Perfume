import "./App.css";
import { Route, Routes } from "react-router";
import Layout from "./utlities/Layout";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Account from "./pages/Account";
import Login from "./components/Login";
import Error from "./pages/Error";
import ProductPanel from "./pages/ProductPanel";
import AdminRoute from "./routes/AdminRoute";
import CheckOut from "./pages/CheckOut";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/productpanel"
            element={
              <AdminRoute>
                <ProductPanel />
              </AdminRoute>
            }
          />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
