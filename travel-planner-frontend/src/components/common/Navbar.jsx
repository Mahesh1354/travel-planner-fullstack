import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, MenuButton, MenuItems, MenuItem, Transition, Dialog, DialogPanel, Popover } from '@headlessui/react';
import {
  HomeIcon,
  MapIcon,
  PlusCircleIcon,
  UserCircleIcon,
  BellIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  SparklesIcon,
  RectangleStackIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  UserIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to check if link is active
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Main navigation items
  const mainNavItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Trips', href: '/trips', icon: MapIcon },
  ];

  // Secondary items for More dropdown
  const moreItems = [
    { name: 'Templates', href: '/templates', icon: RectangleStackIcon },
    { name: 'Invitations', href: '/invitations', icon: EnvelopeIcon },
    { name: 'Recommendations', href: '/recommendations', icon: SparklesIcon },
    { name: 'Bookings', href: '/bookings', icon: BookOpenIcon },
    { name: 'Budget', href: '/budget', icon: CurrencyDollarIcon },
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <nav className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${
      scrolled ? 'shadow-lg' : 'shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <RocketLaunchIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">TravelPlanner</span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 justify-between ml-8">
            {/* Left Navigation */}
            <div className="flex items-center space-x-1">
              {mainNavItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      active
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-1.5 ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                    {item.name}
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button
                      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                      <span>More</span>
                      <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                    </Popover.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 ring-1 ring-black ring-opacity-5 z-50">
                        {moreItems.map((item) => {
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center px-4 py-3 text-sm transition-colors ${
                                active
                                  ? 'bg-primary-50 text-primary-700'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <item.icon className={`h-5 w-5 mr-3 ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                              {item.name}
                            </Link>
                          );
                        })}
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  {/* Create Trip Button - Always visible */}
                  <Link
                    to="/create-trip"
                    className="flex items-center px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap"
                  >
                    <PlusCircleIcon className="h-4 w-4 mr-1.5" />
                    <span>Create Trip</span>
                  </Link>

                  <NotificationBell />

                  {/* User Menu */}
                  <Menu as="div" className="relative">
                    <MenuButton className="flex items-center focus:outline-none">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors border-2 border-white shadow-sm">
                        {user?.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.firstName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-primary-700">
                            {getUserInitials()}
                          </span>
                        )}
                      </div>
                    </MenuButton>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <MenuItems className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                        </div>
                        
                        <MenuItem>
                          <Link
                            to="/profile"
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <UserIcon className="h-5 w-5 mr-3 text-gray-500" />
                            Your Profile
                          </Link>
                        </MenuItem>
                        
                        <MenuItem>
                          <Link
                            to="/settings"
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-500" />
                            Settings
                          </Link>
                        </MenuItem>
                        
                        {user?.role === 'ADMIN' && (
                          <MenuItem>
                            <Link
                              to="/admin"
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-500" />
                              Admin Dashboard
                            </Link>
                          </MenuItem>
                        )}
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <MenuItem>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                            Sign out
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </Transition>
                  </Menu>
                </>
              ) : (
                /* NON-AUTHENTICATED STATE - BOTH BUTTONS VISIBLE */
                <div className="flex items-center space-x-2">
                  <Link 
                    to="/login" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button and icons */}
          <div className="flex items-center space-x-2 md:hidden">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-trip"
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  aria-label="Create Trip"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                </Link>
                <NotificationBell />
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none"
                  aria-label="Open menu"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
              </>
            ) : (
              /* Mobile non-authenticated state */
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <Transition show={mobileMenuOpen} as={Fragment}>
        <Dialog onClose={setMobileMenuOpen} className="relative z-50 md:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                {/* Mobile menu header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="bg-primary-600 p-1.5 rounded-lg">
                      <RocketLaunchIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-xl text-gray-900">TravelPlanner</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    aria-label="Close menu"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* User info for authenticated users */}
                {isAuthenticated && (
                  <div className="px-4 py-4 bg-primary-50 mx-3 rounded-lg mt-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">{getUserInitials()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-primary-700 mt-1">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile menu items */}
                <div className="flex-1 overflow-y-auto py-4 px-3">
                  <div className="space-y-1">
                    {/* Home */}
                    <Link
                      to="/"
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        isActive('/') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <HomeIcon className={`h-5 w-5 mr-3 ${isActive('/') ? 'text-primary-600' : 'text-gray-500'}`} />
                      Home
                    </Link>

                    {/* Trips */}
                    <Link
                      to="/trips"
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        isActive('/trips') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MapIcon className={`h-5 w-5 mr-3 ${isActive('/trips') ? 'text-primary-600' : 'text-gray-500'}`} />
                      My Trips
                    </Link>

                    {/* Create Trip CTA */}
                    <Link
                      to="/create-trip"
                      className="flex items-center px-4 py-3 mt-2 bg-primary-600 text-white text-base font-medium rounded-lg hover:bg-primary-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PlusCircleIcon className="h-5 w-5 mr-3" />
                      Create Trip
                    </Link>

                    {/* More Section */}
                    <div className="pt-4">
                      <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">More</p>
                      {moreItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                            isActive(item.href) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className={`h-5 w-5 mr-3 ${isActive(item.href) ? 'text-primary-600' : 'text-gray-500'}`} />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer for non-authenticated users */}
                {!isAuthenticated && (
                  <div className="border-t border-gray-200 p-4 space-y-3">
                    <Link
                      to="/login"
                      className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </DialogPanel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </nav>
  );
};

export default Navbar;