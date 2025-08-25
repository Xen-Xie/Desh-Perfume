import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/home" },
    { name: "Our Outlet", href: "/outlets" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Shipping & Exchange Policy", href: "/shippingpolicy" },
    { name: "Track Order", href: "/trackoder" },
  ];

  return (
    <footer className="border-t-[1px] border-t-primarytext font-primary">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex justify-center space-x-6 text-2xl mb- mt-3">
          <a href="https://www.facebook.com/hemel.707/" target="_blank" rel="noopener noreferrer" className="text-primarytext hover:text-blue-500 transition duration-300">
            <i className="fa-brands fa-facebook"></i>
          </a>
          <a href="https://www.instagram.com/md.rakibulhasanhemel/" target="_blank" rel="noopener noreferrer" className="text-primarytext hover:text-pink-500 transition duration-300">
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a href="https://github.com/Xen-Xie" target="_blank" rel="noopener noreferrer" className="text-primarytext hover:text-gray-400 transition duration-300">
            <i className="fa-brands fa-github"></i>
          </a>
          <a href="mailto:rh189827@gmail.com" target="_blank" rel="noopener noreferrer" className="text-primarytext hover:text-primarytext/40 transition duration-300">
            <i className="fa-solid fa-envelope"></i>
          </a>
        </div>

        <div className="mb-6">
          <h1 className='text-2xl font-semibold mb-4 text-primarytext'>Quick Links</h1>
          <ul className='flex flex-wrap justify-center gap-4'>
            {quickLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="text-primarytext hover:text-accenttwo transition duration-300">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-primarytext">
          Copyright © {currentYear} 
          <span className="text-primary font-medium"> XenXie Team</span>, designed by 
          <span className="text-primary font-medium"> Xen Xie</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
