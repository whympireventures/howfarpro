'use client';
import Head from 'next/head';
import { FiMail, FiClock, FiMessageSquare, FiUsers, FiGlobe, FiSend } from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Us | LocateMyCity</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="contact-page">
        <Header />
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>Get in <span>Touch</span></h1>
            <p className="hero-subtitle">
              Have a question, found an error, or want to suggest a location? We'd love to hear from you.
            </p>
            <div className="divider"></div>
          </div>
        </section>

        {/* Main Content */}
        <section className="contact-content">
          <div className="contact-grid">
            {/* Contact Cards */}
            <div className="contact-card support-card">
              <div className="card-icon">
                <FiMail size={28} />
              </div>
              <h3>Email Support</h3>
              <a href="mailto:support@locatemycity.com" className="email-link">
                support@locatemycity.com
              </a>
              <p className="card-description">
                Whether you're reporting a bug, requesting a feature, or just curious about how something works.
              </p>
              <div className="response-time">
                <FiClock size={18} />
                <span>We typically respond within 24–48 hours</span>
              </div>
            </div>

            <div className="contact-card media-card">
              <div className="card-icon">
                <FiMessageSquare size={28} />
              </div>
              <h3>Media Inquiries</h3>
              <p className="card-description">
                Reach out with "Media" in your subject line so we can prioritize your message.
              </p>
            </div>

            <div className="contact-card partnership-card">
              <div className="card-icon">
                <FiUsers size={28} />
              </div>
              <h3>Partnerships</h3>
              <p className="card-description">
                Include "Partnership" in your subject line for business collaboration opportunities.
              </p>
            </div>

       
          </div>
        </section>

        {/* Closing Section */}
        <section className="closing-section">
          <div className="closing-content">
            <FiGlobe size={48} className="globe-icon" />
            <h2>Let's keep exploring — together.</h2>
            <p>
              Your feedback helps us improve LocateMyCity for everyone. We appreciate every message we receive.
            </p>
          </div>
         
        </section> <Footer />
      </div>

      <style jsx>{`
        .contact-page {
          font-family: 'Poppins', sans-serif;
          color: #93afdfff;
          background: #f8fafc;
          min-height: 100vh;
        }

        /* Hero Section */
        .contact-hero {
          background: linear-gradient(135deg, #3b82f6 0%, #6273a8ff 100%);
          padding: 8rem 2rem 6rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .contact-hero h1 {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: white;
        }

        .contact-hero h1 span {
          color: rgba(255, 255, 255, 0.9);
          position: relative;
          display: inline-block;
        }

        .contact-hero h1 span::after {
          content: '';
          position: absolute;
          bottom: 5px;
          left: 0;
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          z-index: -1;
          border-radius: 4px;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          max-width: 700px;
          margin: 0 auto 2rem;
        }

        .divider {
          width: 100px;
          height: 4px;
          background: rgba(255, 255, 255, 0.5);
          margin: 2rem auto 0;
          border-radius: 2px;
        }

        /* Main Content */
        .contact-content {
          max-width: 1200px;
          margin: -4rem auto 0;
          padding: 0 2rem 4rem;
          position: relative;
          z-index: 2;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .contact-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .contact-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(59, 130, 246, 0.15);
        }

        .support-card {
          border-top: 4px solid #3b82f6;
        }

        .media-card {
          border-top: 4px solid #10b981;
        }

        .partnership-card {
          border-top: 4px solid #8b5cf6;
        }

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .support-card .card-icon {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .media-card .card-icon {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .partnership-card .card-icon {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .contact-card h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1e293b;
        }

        .email-link {
          color: #3b82f6;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          margin-bottom: 1.5rem;
          display: inline-block;
        }

        .email-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .card-description {
          color: #64748b;
          line-height: 1.7;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }

        .response-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #64748b;
          margin-top: auto;
        }

        /* Contact Form Card */
        .contact-form-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          grid-column: span 1;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        @media (min-width: 1024px) {
          .contact-form-card {
            grid-column: span 2;
          }
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .form-header h2 {
          font-size: 1.75rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .form-header svg {
          color: #3b82f6;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #334155;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #f8fafc;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: white;
        }

        .submit-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
        }

        /* Closing Section */
        .closing-section {
          text-align: center;
          padding: 6rem 2rem;
          background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);
          position: relative;
          overflow: hidden;
        }

        .closing-content {
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .globe-icon {
          color: #3b82f6;
          margin-bottom: 1.5rem;
        }

        .closing-section h2 {
          font-size: 2.25rem;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 1.5rem;
        }

        .closing-section p {
          font-size: 1.125rem;
          color: #4a5568;
          line-height: 1.7;
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .contact-hero {
            padding: 6rem 1.5rem 4rem;
          }
          
          .contact-hero h1 {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
          }
          
          .contact-content {
            padding: 0 1.5rem 3rem;
          }
          
          .contact-card,
          .contact-form-card {
            padding: 2rem;
          }
        }

        @media (max-width: 480px) {
          .contact-hero h1 {
            font-size: 2rem;
          }
          
          .closing-section {
            padding: 4rem 1.5rem;
          }
          
          .closing-section h2 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </>
  );
}