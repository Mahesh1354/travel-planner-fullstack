import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapIcon, 
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  ChevronRightIcon,
  PaperAirplaneIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'My Trips', path: '/trips' },
    { name: 'Create Trip', path: '/create-trip' },
    { name: 'Templates', path: '/templates' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'Blog', path: '/blog' },
  ];

  const supportLinks = [
    { name: 'Help Center', url: '#' },
    { name: 'Contact Us', url: '#' },
    { name: 'FAQ', url: '#' },
    { name: 'Privacy Policy', url: '/privacy' },
    { name: 'Terms of Service', url: '/terms' },
    { name: 'Cookies', url: '/cookies' },
  ];

  const socialLinks = [
    {
      name: 'Twitter',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
      url: '#',
      color: 'hover:text-blue-400',
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
        </svg>
      ),
      url: '#',
      color: 'hover:text-blue-600',
    },
    {
      name: 'Instagram',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z" />
        </svg>
      ),
      url: '#',
      color: 'hover:text-pink-600',
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.203 0 22.225 0z" />
        </svg>
      ),
      url: '#',
      color: 'hover:text-blue-700',
    },
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
      setIsSubscribing(false);
    }, 1500);
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white mt-auto relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container-custom py-12 md:py-16 relative z-10">
        {/* Newsletter Section */}
        <div className="mb-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                <PaperAirplaneIcon className="h-5 w-5 mr-2 text-primary-400" />
                Subscribe to our newsletter
              </h3>
              <p className="text-gray-400 text-sm">
                Get travel tips, destination guides, and exclusive offers delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto">
              <div className="flex-1 lg:w-80 relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-3 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center"
              >
                {isSubscribing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand - 3 columns */}
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <MapIcon className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-white">TravelPlanner</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Plan your perfect journey with our intuitive travel planning platform. 
              Create, organize, and share your adventures with ease.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className={`text-gray-400 ${social.color} transition-colors bg-white/5 p-2 rounded-lg hover:bg-white/10`}
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <ChevronRightIcon className="h-4 w-4 mr-1 text-primary-400" />
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full mr-2 group-hover:bg-primary-400 transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support - 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <ChevronRightIcon className="h-4 w-4 mr-1 text-primary-400" />
              Support
            </h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  {link.url.startsWith('/') ? (
                    <Link 
                      to={link.url} 
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-gray-600 rounded-full mr-2 group-hover:bg-primary-400 transition-colors"></span>
                      {link.name}
                    </Link>
                  ) : (
                    <a 
                      href={link.url} 
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-gray-600 rounded-full mr-2 group-hover:bg-primary-400 transition-colors"></span>
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact - 3 columns */}
          <div className="lg:col-span-3">
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start group hover:bg-white/5 p-2 rounded-lg transition-colors">
                <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 group-hover:text-primary-400 transition-colors" />
                <span className="text-gray-400 group-hover:text-white transition-colors">support@travelplanner.com</span>
              </li>
              <li className="flex items-start group hover:bg-white/5 p-2 rounded-lg transition-colors">
                <PhoneIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 group-hover:text-primary-400 transition-colors" />
                <span className="text-gray-400 group-hover:text-white transition-colors">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start group hover:bg-white/5 p-2 rounded-lg transition-colors">
                <ClockIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 group-hover:text-primary-400 transition-colors" />
                <span className="text-gray-400 group-hover:text-white transition-colors">Mon - Fri: 9am - 6pm EST</span>
              </li>
            </ul>

            {/* Trust Badge */}
            <div className="mt-4 flex items-center space-x-2 bg-white/5 p-3 rounded-lg">
              <HeartIcon className="h-4 w-4 text-red-400 animate-pulse" />
              <p className="text-xs text-gray-400">
                Trusted by <span className="text-white font-medium">50,000+</span> travelers
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
            <p className="flex items-center">
              &copy; {currentYear} TravelPlanner. 
              <span className="mx-2">•</span>
              <span className="text-primary-400">All rights reserved.</span>
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link to="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
              <span className="flex items-center text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                Live
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;