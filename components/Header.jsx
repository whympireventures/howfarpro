'use client';

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <>
      <Head>
        <title>How Far From Me</title>
        <meta name="description" content="How Far From Me helps you instantly determine how far you are from any location worldwide." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <header>
        <div className="container">
          {/* Floating circles */}
          <div className="floating-circle" style={{ width: '80px', height: '80px', top: '20%', left: '10%' }}></div>
          <div className="floating-circle" style={{ width: '120px', height: '120px', bottom: '-30%', right: '15%' }}></div>
          <div className="floating-circle" style={{ width: '60px', height: '60px', top: '50%', left: '80%' }}></div>
          
          <div className="header-content">
            <div className="logo">
              <Image 
                src="/Images/cityfav.png" 
                alt="Logo" 
                width={50} 
                height={50} 
                className="logo-image"
                priority
              />
              How Far From Me
            </div>
            <nav>
              <Link href="/" title="Home">HOME</Link>
              <Link href="/about">ABOUT US</Link>
              <Link href="/contact">CONTACT US</Link>
            </nav>
          </div>
        </div>
             </header>

      
    </>
  );
}
