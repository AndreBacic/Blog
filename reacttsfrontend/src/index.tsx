import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import Header from './Header';
import Navbar from './Navbar';
import Main from './Main';
import Home from './Home';
import About from './About';
import Footer from './Footer';
import reportWebVitals from './reportWebVitals';
import UserContext from './UserContext';
import { LS_KEY_user, UserModel } from '.';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

let user: UserModel | null = JSON.parse(localStorage.getItem(LS_KEY_user) as string)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserContext.Provider value={user}>
        <Header />
        <Navbar hasSearch={true} />
        <Routes>
          <Route path="/" element={<Main />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="search/:query" element={<Search />} />
            <Route path="login" element={<Login />} />
            <Route path="editAccount" element={<EditAccount />} />
            <Route path="createArticle" element={<CreateArticle />} />
            <Route path="editArticle" element={<EditArticle />} />
            <Route path="article/:id" element={<Article />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
        <Footer />
      </UserContext.Provider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
