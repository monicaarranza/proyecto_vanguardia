import { BrowserRouter, Routes, Route } from "react-router-dom";

import Inventory from "./inventory/inventory";
import Products from "./products/products";
import Tags from "./tags/tags";
import BatchTypes from "./batchTypes/batchTypes";
import Home from "./home/home";
import Login from "./login/login";
import Users from "./users/users";
import Items from "./items/items";
import ProductPassport from "./productPassport/productPassword";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/home" element={<Home />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/products" element={<Products />} />
                <Route path="/tags" element={<Tags />} />
                <Route path="/batch-types" element={<BatchTypes />} />
                <Route path="/users" element={<Users/>}/>
                <Route path="/items" element={<Items/>}/>
                <Route path="/product-passport/:uid" element={<ProductPassport/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;