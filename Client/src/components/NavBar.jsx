/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useTheme } from "../context/useTheme";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../context/UseCart";

function NavBar() {
  const { user, logout } = useAuth();
  const navItems = [
    { name: "Home", path: "/" },
    {
      name: "Store",
      path: "/store",
      subItems: [
        {
          name: "All Perfume Oil Collections",
          path: "/allperfumeoilcollections",
        },
        { name: "Male Perfume Oils", path: "/malperfumeoils" },
        { name: "Female Perfume Oils", path: "/femaleperfumeoils" },
        { name: "Men's Jewellery", path: "/mensjewellery" },
        { name: "Ladies' Jewellery", path: "/ladiesjewellery" },
        { name: "Brand Hair and Skin Care", path: "/brandhairandskincare" },
      ],
    },
    { name: "Account", path: "/account" },
    ...(user?.role === "admin"
      ? [{ name: "Product Panel", path: "/productpanel" }]
      : []),
  ];

  const [open, setOpen] = useState(false);
  // Submenu state
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const navigate = useNavigate();

  const handleSubMenuClick = (index, hasSubItems, path, e) => {
    if (hasSubItems) {
      if (openSubMenu === index) {
        // If already open, close and navigate to main page (About)
        setOpenSubMenu(null);
        navigate(path);
      } else {
        // First click: just open submenu
        e.preventDefault();
        setOpenSubMenu(index);
      }
    } else {
      // Normal menu item: close submenu
      setOpenSubMenu(null);
      setOpen(false); // close mobile sidebar
    }
  };
  // Cart State
  const { totalCount, clearCart } = useCart();
  const handleLogout = () => {
    logout();
    clearCart();
  };

  // Dark Mode State
  const { darkMode, setDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="font-secondary">
        <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center bg-transparent shadow-lg mx-auto px-4 py-2 md:px-12 xl:px-20 dark:shadow-lg backdrop-blur-md">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            {user && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                title="Logout"
                className="text-xl hidden sm:flex cursor-pointer"
              >
                <i className="fa-solid fa-right-from-bracket hover:text-melty dark:hover:text-primary text-[27px] transition-colors duration-300" />
              </motion.button>
            )}
            <a href="/home">
              {darkMode ? (
                <img src="/DashLogoD.png" alt="" className="w-15" />
              ) : (
                <img src="/DashLogo.png" alt="" className="w-15" />
              )}
            </a>
          </div>
          <div>
            {/* Desktop Navigation Items */}
            <ul className=" hidden md:flex items-center gap-6">
              {navItems.map((items, i) => (
                <li
                  key={i}
                  className="text-primarytext text-lg font-semibold relative"
                >
                  <Link
                    to={items.path}
                    onClick={(e) =>
                      handleSubMenuClick(i, !!items.subItems, items.path, e)
                    }
                    className="relative after:block after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {items.name} {/* Show dropdown arrow only for "Store" */}
                    {items.name === "Store" && (
                      <i
                        className={`fa-solid fa-caret-down text-primarytext ml-1 inline-block transition-transform duration-300 ${
                          openSubMenu === i ? "rotate-180" : "rotate-0"
                        }`}
                      ></i>
                    )}
                  </Link>

                  {items.subItems && (
                    <ul
                      className={`absolute left-0 top-full bg-cardbg shadow-xl rounded-md py-2 mt-2 w-48 z-50 transition-all duration-200 backdrop-blur-lg ${
                        openSubMenu === i ? "block" : "hidden"
                      }`}
                    >
                      {items.subItems.map((sub, j) => (
                        <li key={j} className="text-lg font-bold">
                          <Link
                            to={sub.path}
                            onClick={() => setOpenSubMenu(null)}
                            className="block px-4 py-2 text-sm text-secondarytext hover:bg-primarytext/25 transition-all duration-300 delay-200"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {/* Rightside Menu*/}
          <div className="flex items-center gap-4">
            {/*Cart Icon*/}
            <Link to="/checkout">
              <motion.button className="relative">
                <i className="fa-solid fa-cart-shopping text-[25px] mt-[5px] cursor-pointer text-primarytext"></i>

                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-danger/85 text-primarybg dark:text-primarytext text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {totalCount}
                  </span>
                )}
              </motion.button>
            </Link>

            {/* Toggle Icon */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="relative w-12 h-12 overflow-hidden rounded-full group cursor-pointer shadow-md"
              title="Toggle Dark Mode"
            >
              {/* Background Gradient (sky) */}
              <motion.span
                key={darkMode ? "night" : "day"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  darkMode
                    ? "bg-gradient-to-b from-blue-900 via-black to-gray-900"
                    : "bg-gradient-to-b from-yellow-200 via-orange-400 to-pink-500"
                }`}
              />

              {/* Icon (Sun / Moon) */}
              <motion.i
                key={darkMode ? "moon" : "sun"}
                initial={mounted ? { y: darkMode ? -40 : 40, opacity: 0 } : {}}
                animate={mounted ? { y: 0, opacity: 1 } : {}}
                exit={{ y: darkMode ? 40 : -40, opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center text-xl"
              >
                {darkMode ? (
                  <i className="fa-solid fa-moon text-white" />
                ) : (
                  <i className="fa-solid fa-sun text-yellow-500" />
                )}
              </motion.i>
            </motion.button>

            {/* Hamburger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setOpen(!open)}
              className="md:hidden"
            >
              <i
                className={`fa-solid ${
                  open ? "fa-xmark" : "fa-bars"
                } text-2xl mt-[6px]`}
              ></i>
            </motion.button>
          </div>
        </nav>
        {/* Mobile Sidebar Menu */}
        <div
          className={`md:hidden fixed top-0 left-0 w-2/4 h-screen bg-card shadow-xl transform transition-transform duration-500 ease-in-out z-50 font-semibold bg-primarybg ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ul className="flex flex-col items-end px-6 pt-4 pb-6 space-y-4 font-semibold text-primaryem">
            {navItems.map((items, i) => (
              <li key={i} className="w-full text-right text-primarytext">
                <Link
                  to={items.path}
                  onClick={(e) =>
                    handleSubMenuClick(i, !!items.subItems, items.path, e)
                  }
                  className="block py-2 text-lg"
                >
                  {items.name === "Store" && (
                    <i
                      className={`fa-solid fa-caret-down text-primarytext ml-1 inline-block transition-transform duration-300 ${
                        openSubMenu === i ? "rotate-180" : "rotate-0"
                      }`}
                    ></i>
                  )}
                  {items.name} {/* Show dropdown arrow only for "Store" */}
                </Link>

                {/* Mobile Dropdown */}
                {items.subItems && openSubMenu === i && (
                  <ul className="pr-2 mt-2 space-y-2 text-right">
                    {items.subItems.map((sub, j) => (
                      <li key={j}>
                        <Link
                          to={sub.path}
                          onClick={() => {
                            setOpenSubMenu(null);
                            setOpen(false);
                          }}
                          className="block text-sm py-1 text-secondarytext"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li>
              {user && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  title="Logout"
                  className="text-xl"
                >
                  <i className="fa-solid fa-right-from-bracket hover:text-melty dark:hover:text-primary text-[27px] transition-colors duration-300" />
                </motion.button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default NavBar;
