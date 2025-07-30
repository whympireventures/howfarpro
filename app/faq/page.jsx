'use client';
import Header from '../../components/Header';
import Footer from '../../components/Footer'

import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqs = [
  {
    question: 'What information can I find on LocateMyCity?',
    answer:
      'LocateMyCity provides detailed insights about locations, including city/town status, distance measurements, and unique geographical traits.',
  },
  {
    question: 'How do I use the distance calculator?',
    answer:
      'Either allow location access or manually enter locations to calculate real-time distances in miles or kilometers.',
  },
  {
    question: 'Can I compare multiple locations?',
    answer:
      'Yes, our Location to Location tool lets you compare multiple destinations for effective trip planning.',
  },
  {
    question: 'How current is the location data?',
    answer:
      'We update weekly using verified sources including satellite imagery and government data.',
  },
  {
    question: 'What makes LocateMyCity different?',
    answer:
      'We highlight unique natural features and cover both abandoned and active locations with faster search and data accuracy than traditional tools.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <Header />
    <div className="faq-page">
      
      <h1 className="faq-title">Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-card ${openIndex === index ? 'open' : ''}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">
              <span>{faq.question}</span>
              {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            <div className="faq-answer">{openIndex === index && <p>{faq.answer}</p>}</div>
          </div>
        ))}
      </div>
    </div>
    <Footer />
    </div>
  );
}
