import React from "react";
import { Link } from "react-router";
import AnimatedContext from "../context/AnimationContext";

function HeroCard() {
  const products = [
    {
      title: "ALL PERFUME OILS COLLECTION",
      productNumber: "124 PRODUCTS",
      image: "/img1.jpg",
      link: "/allperfumeoilscollection",
    },
    {
      title: "BEARD, HAIR & SKIN CARE",
      productNumber: "27 PRODUCTS",
      image: "/img2.jpg",
      link: "/beardhairandskincare",
    },
    {
      title: "DASH ORIGINALS",
      productNumber: "15 PRODUCTS",
      image: "/img3.jpg",
      link: "/dashorginals",
    },
    {
      title: "FEMALE PERFUME OILS",
      productNumber: "58 PRODUCTS",
      image: "/img4.jpg",
      link: "/femaleperfumeoils",
    },
    {
      title: "LADIES' JEWELRY",
      productNumber: "60 PRODUCTS",
      image: "/img5.jpg",
      link: "/ladieslewelry",
    },
    {
      title: "MALE PERFUME OILS",
      productNumber: "85 PRODUCTS",
      image: "/img6.jpg",
      link: "/maleperfumeoils",
    },
    {
      title: "MEN'S JEWELRY",
      productNumber: "85 PRODUCTS",
      image: "/img7.png",
      link: "/mensjewelry",
    },
    {
      title: "PERFUME COMBO",
      productNumber: "27 PRODUCTS",
      image: "/img8.jpg",
      link: "/perfumecombo",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, idx) => (
          <AnimatedContext
            key={idx}
            delay={idx * 0.1} 
            y={30}           
            scale={0.98}     
            threshold={0.2}
            once={true}
          >
          <Link key={idx} to={product.link}>
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:dark:shadow-[0_4px_30px_rgba(255,255,255,0.1)] cursor-pointer group hover:shadow-2xl transition-all duration-300">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="inset-0 bg-cardbg bg-opacity-70 flex flex-col justify-end p-4">
                <h2 className="font-primary text-primarytext text-lg sm:text-xl mb-1 text-center">
                  {product.title}
                </h2>
                <p className="font-primary text-primarytext text-sm sm:text-base text-center">
                  {product.productNumber}
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
