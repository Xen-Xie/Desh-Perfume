import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import AnimatedContext from "../context/AnimationContext";
import axios from "axios";

function HeroCard() {
  const [products, setProducts] = useState([
    {
      title: "ALL PERFUME OILS COLLECTION",
      image: "/img1.jpg",
      link: "/store/allperfumeoils",
    },
    {
      title: "BEARD, HAIR & SKIN CARE",
      image: "/img2.jpg",
      link: "/store/bearddhairandskincare",
    },
    { title: "DASH ORIGINALS", image: "/img3.jpg", link: "/store/dashoriginals" },
    {
      title: "FEMALE PERFUME OILS",
      image: "/img4.jpg",
      link: "/store/femaleperfumeoils",
    },
    { title: "LADIES' JEWELRY", image: "/img5.jpg", link: "/ladieslewelry" },
    {
      title: "MALE PERFUME OILS",
      image: "/img6.jpg",
      link: "/store/malperfumeoils",
    },
    { title: "MEN'S JEWELRY", image: "/img7.png", link: "/store/mensjewellery" },
    { title: "PERFUME COMBO", image: "/img8.jpg", link: "/store/perfumecombo" },
  ]);

  useEffect(() => {
    axios
      .get("https://desh-perfume.onrender.com/api/products")
      .then((res) => {
        const allProducts = res.data;

        setProducts((prev) =>
          prev.map((prod) => {
            let count = 0;

            if (prod.title === "ALL PERFUME OILS COLLECTION") {
              // Sum male + female perfume oils
              count = allProducts.filter(
                (p) =>
                  p.category.toLowerCase() === "male perfume oils" ||
                  p.category.toLowerCase() === "female perfume oils"
              ).length;
            } else if (
              prod.title === "MALE PERFUME OILS" ||
              prod.title === "FEMALE PERFUME OILS"
            ) {
              // Exact match for male/female
              count = allProducts.filter(
                (p) => p.category.toLowerCase() === prod.title.toLowerCase()
              ).length;
            } else {
              // Other categories: you can keep includes if necessary
              count = allProducts.filter((p) =>
                p.category.toLowerCase().includes(prod.title.toLowerCase())
              ).length;
            }

            return {
              ...prod,
              productNumber: `${count} PRODUCTS`,
            };
          })
        );
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, idx) => (
          <AnimatedContext
            key={idx}
            delay={idx * 0.1}
            y={30}
            scale={0.98}
            threshold={0.2}
            once={true}
          >
            <Link to={product.link}>
              <div className="relative rounded-2xl overflow-hidden shadow-lg hover:dark:shadow-[0_4px_30px_rgba(255,255,255,0.1)] cursor-pointer group hover:shadow-2xl transition-all duration-300">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="inset-0 bg-cardbg bg-opacity-70 flex flex-col justify-end p-4 h-[120px]">
                  <h2 className="font-primary text-primarytext text-lg sm:text-xl mb-1 text-center line-clamp-2">
                    {product.title}
                  </h2>
                  <p className="font-primary text-primarytext text-sm sm:text-base text-center">
                    {product.productNumber || "0 PRODUCTS"}
                  </p>
                </div>
              </div>
            </Link>
          </AnimatedContext>
        ))}
      </div>
    </div>
  );
}

export default HeroCard;
