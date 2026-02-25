import React from 'react';
import Link from 'next/link';
import { FaShieldAlt, FaLock, FaUserCheck } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 bg-gradient-to-r from-secondary to-darkwood text-white border-t border-white/20">
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-2xl font-bold text-white">WealthBridge</h3>
            <p className="text-sm text-white mt-1">Powered by RMA</p>
            <p className="text-sm text-white/85 mt-4">
              Helping users build stronger credit habits with practical education, guided workflows, and AI-supported insights.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Credibility</h4>
            <ul className="space-y-2 text-sm text-white/90">
              <li className="flex items-center space-x-2">
                <FaShieldAlt className="text-accent" />
                <span>Secure cloud infrastructure</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaLock className="text-accent" />
                <span>Privacy-first report handling</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaUserCheck className="text-accent" />
                <span>User-consent based analysis</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/credit-builder" className="text-white/90 hover:text-white">Credit Builder</Link>
              <Link href="/education" className="text-white/90 hover:text-white">Education</Link>
              <Link href="/terms" className="text-white/90 hover:text-white">Terms & Conditions</Link>
              <a
                href="https://www.annualcreditreport.com/"
                target="_blank"
                rel="noreferrer"
                className="text-white/90 hover:text-white"
              >
                Get Free Credit Report
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 text-xs text-white/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>© {new Date().getFullYear()} WealthBridge, powered by RMA.</span>
          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-white">Terms & Conditions</Link>
            <span>For educational purposes only. Not legal or financial advice.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
