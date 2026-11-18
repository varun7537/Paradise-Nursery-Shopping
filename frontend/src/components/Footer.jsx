import React from "react";
import { Link } from "react-router-dom"; 
import { ImFacebook2 } from "react-icons/im";
import { BsTwitterX } from "react-icons/bs";
import { LuInstagram } from "react-icons/lu";
import { GrLinkedin } from "react-icons/gr";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Quick Links Section */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors">Shop Plants</Link>
              </li>
              <li>
                <Link to="/careguides" className="text-gray-400 hover:text-white transition-colors">Care Guides</Link>
              </li>
              <li>
                <Link to="/contactus" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Section */}
          <div>
            <h3 className="font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shippinginfo" className="text-gray-400 hover:text-white transition-colors">Shipping Info</Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-white transition-colors">Returns</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/trackorder" className="text-gray-400 hover:text-white transition-colors">Track Order</Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us Section */}
          <div>
            <h3 className="font-bold text-lg mb-4">Connect With Us</h3>
            <ul className="space-y-2 flex gap-4">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <LuInstagram size={28} className="mt-1.5" />
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <ImFacebook2 size={24} />
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <BsTwitterX size={24} />
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <GrLinkedin size={24} />
                </a>
              </li>
            </ul>
          </div>

          {/* Store Hours Section */}
          <div>
            <h3 className="font-bold text-lg mb-4">Store Hours</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Mon-Fri: 9am - 7pm</li>
              <li>Saturday: 10am - 6pm</li>
              <li>Sunday: 11am - 5pm</li>
              <li className="text-green-400 font-semibold">📞 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section with Privacy Policy and Terms of Service */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 Paradise Nursery. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
