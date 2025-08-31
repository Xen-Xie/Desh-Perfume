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
import ProductDetails from "./pages/subpages/ProductDetails";
import AllPerfumeOilsCollections from "./pages/subpages/AllPerfumeOilsCollections";
import MalePerfumeOils from "./pages/subpages/MalePerfumeOils";
import FemalePerfumeOils from "./pages/subpages/FemalePerfumeOils";
import BearedHairSkinCare from "./pages/subpages/BearedHairSkinCare";
import PerfumeCombo from "./pages/subpages/PerfumeCombo";
import MensJwewlry from "./pages/subpages/MensJwewlry";
import DashOriginals from "./pages/subpages/DashOriginals";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/store/product/:id" element={<ProductDetails />} />
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
          <Route path="/store/allperfumeoils" element={<AllPerfumeOilsCollections />} />
          <Route path="/store/malperfumeoils" element={<MalePerfumeOils />} />
          <Route path="/store/femaleperfumeoils" element={<FemalePerfumeOils />} />
          <Route path="/store/bearddhairandskincare" element={<BearedHairSkinCare />} />
          <Route path="/store/perfumecombo" element={<PerfumeCombo />} />
          <Route path="/store/mensjewellery" element={<MensJwewlry />} />
          <Route path="/store/dashoriginals" element={<DashOriginals />} />


          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
