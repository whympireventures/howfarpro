'use client';

import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer-content">
        {/* Left: Logo + Description */}
        <div className="footer-section">
          <h2 className="footer-logo">LocateMyCity</h2>
          <p className="footer-description">
            Helping you explore cities smarter. Fast, accurate, and user-friendly.
          </p>
        </div>

        {/* Center: Links */}
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Right: Contact Info */}
        <div className="footer-section">
          <h4 className="footer-heading">Contact Us</h4>
  
<p>
  <FaEnvelope className="footer-icon" />{' '}
  <a href="mailto:support@locatemycity.com" style={{ color: 'inherit', textDecoration: 'none' }}>
    support@locatemycity.com
  </a>
</p>         
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LocateMyCity. All rights reserved.</p>
      </div>
    </footer>
  );
}
