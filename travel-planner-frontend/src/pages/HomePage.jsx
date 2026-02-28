import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  MapIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  SparklesIcon,
  TicketIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  GlobeAltIcon,
  CameraIcon,
  HeartIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [counts, setCounts] = useState({
    users: 0,
    trips: 0,
    destinations: 0,
    travelers: 0,
  });
  const videoRef = useRef(null);
  const testimonialIntervalRef = useRef(null);

  // Stats animation
  useEffect(() => {
    const targetStats = [
      { label: "Active Users", value: 50000, key: "users" },
      { label: "Trips Planned", value: 100000, key: "trips" },
      { label: "Destinations", value: 500, key: "destinations" },
      { label: "Happy Travelers", value: 45000, key: "travelers" },
    ];

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = {};

    targetStats.forEach((stat) => {
      increment[stat.key] = stat.value / steps;
    });

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps) {
        setCounts((prev) => ({
          users: Math.min(prev.users + increment.users, targetStats[0].value),
          trips: Math.min(prev.trips + increment.trips, targetStats[1].value),
          destinations: Math.min(
            prev.destinations + increment.destinations,
            targetStats[2].value,
          ),
          travelers: Math.min(
            prev.travelers + increment.travelers,
            targetStats[3].value,
          ),
        }));
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, []);

  // Testimonial autoplay
  useEffect(() => {
    if (isPlaying) {
      testimonialIntervalRef.current = setInterval(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }
    return () => clearInterval(testimonialIntervalRef.current);
  }, [isPlaying]);

  const features = [
    {
      icon: MapIcon,
      title: "Plan Your Journey",
      description:
        "Create detailed itineraries with destinations, activities, and accommodations",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: CalendarIcon,
      title: "Organize by Day",
      description:
        "Structure your trip day by day with flexible scheduling and timing",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: CurrencyDollarIcon,
      title: "Budget Tracking",
      description:
        "Keep track of expenses, set budgets, and manage your travel finances",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      icon: UserGroupIcon,
      title: "Collaborate",
      description:
        "Share trips with friends and family, plan together seamlessly",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: SparklesIcon,
      title: "Smart Recommendations",
      description:
        "Get personalized recommendations for places, activities, and accommodations",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
    },
    {
      icon: TicketIcon,
      title: "Booking Integration",
      description: "Search and book flights, hotels, and activities directly",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "New York, USA",
      avatar:
        "https://images.unsplash.com/photo-1494790108777-466d853eb23d?w=150&auto=format",
      text: "TravelPlanner completely transformed how I organize my trips. The collaborative features make it so easy to plan with friends!",
      rating: 5,
      trip: "European Adventure",
    },
    {
      name: "Michael Chen",
      location: "Singapore",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format",
      text: "The budget tracking feature saved me so much money on my last trip. I could see exactly where my money was going.",
      rating: 5,
      trip: "Bali Getaway",
    },
    {
      name: "Emma Williams",
      location: "London, UK",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format",
      text: "I've tried many travel apps, but this one is by far the best. The recommendations are always spot-on!",
      rating: 5,
      trip: "Japan Discovery",
    },
    {
      name: "Carlos Rodriguez",
      location: "Barcelona, Spain",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format",
      text: "Planning a family reunion for 20 people seemed impossible until we found TravelPlanner. Game changer!",
      rating: 5,
      trip: "Family Reunion",
    },
  ];

  const destinations = [
    {
      name: "Paris, France",
      image:
        "https://images.unsplash.com/photo-1502602898657-3ab5d0f6a8b4?w=600&auto=format",
      price: "$899",
      duration: "7 days",
      rating: 4.8,
    },
    {
      name: "Bali, Indonesia",
      image:
        "https://images.unsplash.com/photo-1537996192474-cae57aeeebe8?w=600&auto=format",
      price: "$699",
      duration: "10 days",
      rating: 4.9,
    },
    {
      name: "Tokyo, Japan",
      image:
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format",
      price: "$1,299",
      duration: "8 days",
      rating: 4.7,
    },
    {
      name: "Santorini, Greece",
      image:
        "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&auto=format",
      price: "$999",
      duration: "6 days",
      rating: 4.9,
    },
  ];

  const stats = [
    { label: "Active Users", value: "50K+", key: "users", icon: UserGroupIcon },
    { label: "Trips Planned", value: "100K+", key: "trips", icon: MapIcon },
    {
      label: "Destinations",
      value: "500+",
      key: "destinations",
      icon: GlobeAltIcon,
    },
    {
      label: "Happy Travelers",
      value: "45K+",
      key: "travelers",
      icon: HeartIcon,
    },
  ];

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen overflow-hidden">
        {/* Video Background with Fallback */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&auto=format"
          >
            <source
              src="https://player.vimeo.com/external/371837261.hd.mp4?s=236c5f6075b4ed2af268c285e34f0f1b7d2e9c6c&profile_id=175"
              type="video/mp4"
            />
            {/* Fallback image if video fails */}
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&auto=format" 
              alt="Travel background" 
              className="w-full h-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        {/* Video Controls */}
        <button
          onClick={toggleVideoPlayback}
          className="absolute bottom-8 right-8 z-20 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-all"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? (
            <PauseIcon className="h-5 w-5" />
          ) : (
            <PlayIcon className="h-5 w-5" />
          )}
        </button>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container-custom">
            <div className="max-w-3xl">
              {/* Animated Badge */}
              <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/30 animate-fade-in-up">
                <SparklesIcon className="h-4 w-4 text-yellow-300 mr-2" />
                <span className="text-sm font-medium text-white">
                  Trusted by 50,000+ travelers
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
                Plan Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
                  Perfect Journey
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl animate-fade-in-up animate-delay-200">
                Your all-in-one travel planning companion. Create, organize, and
                share your adventures with ease.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-delay-400">
                {isAuthenticated ? (
                  <Link
                    to="/trips"
                    className="group inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    <span>View My Trips</span>
                    <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-primary-500/25"
                    >
                      <span>Get Started Free</span>
                      <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md text-white text-lg font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Scroll Indicator */}
              <button
                onClick={scrollToFeatures}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80 hover:text-white transition-colors animate-bounce focus:outline-none"
                aria-label="Scroll to features"
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mb-2">Discover More</span>
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 bg-gradient-to-b from-gray-50 to-white scroll-mt-16 relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="text-primary-600 block">Plan Your Trip</span>
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features that make travel planning simple, enjoyable, and
              collaborative
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                ></div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Learn More Link */}
                <Link
                  to={`/features/${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="inline-flex items-center mt-4 text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Learn more
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-24 bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular
              <span className="text-primary-600"> Destinations</span>
            </h2>
            <p className="text-xl text-gray-600">
              Discover trending destinations loved by our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest, index) => (
              <div
                key={index}
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image */}
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format";
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">{dest.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{dest.price}</span>
                      <span className="text-sm text-white/80">
                        • {dest.duration}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{dest.rating}</span>
                    </div>
                  </div>

                  {/* Explore Button */}
                  <Link
                    to={`/destinations/${dest.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm"
                  >
                    <span className="px-6 py-3 bg-white text-gray-900 rounded-full font-medium transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      Explore Now
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              to="/destinations"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium group"
            >
              View All Destinations
              <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section with Animation */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {counts[stat.key].toLocaleString()}+
                  </div>
                  <div className="text-sm md:text-base text-white/80 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our
              <span className="text-primary-600"> Travelers Say</span>
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied travelers who plan their journeys with
              us
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="relative max-w-4xl mx-auto">
            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 lg:-translate-x-16 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 lg:translate-x-16 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>

            {/* Carousel Controls */}
            <div className="absolute top-0 right-0 flex items-center space-x-2">
              <button
                onClick={toggleVideoPlayback}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                {isPlaying ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-1" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-1" />
                    <span>Play</span>
                  </>
                )}
              </button>
            </div>

            {/* Testimonial Cards */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${activeTestimonial * 100}%)`,
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
                      <div className="flex items-center mb-6">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover mr-4"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {testimonial.location}
                          </p>
                          <p className="text-xs text-primary-600 mt-1">
                            {testimonial.trip}
                          </p>
                        </div>
                      </div>

                      {/* Rating Stars */}
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid
                            key={i}
                            className={`h-5 w-5 ${
                              i < testimonial.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-gray-600 italic leading-relaxed">
                        "{testimonial.text}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeTestimonial
                      ? "w-6 bg-primary-600"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Join thousands of travelers who use TravelPlanner to create
              unforgettable journeys
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={isAuthenticated ? "/create-trip" : "/register"}
                className="group inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span>
                  {isAuthenticated
                    ? "Plan Your Next Trip"
                    : "Create Your Account"}
                </span>
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/demo"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md text-white text-lg font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Watch Demo
                <PlayIcon className="h-5 w-5 ml-2" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex items-center justify-center space-x-6 text-sm text-white/60">
              <span>✨ 14-day free trial</span>
              <span>•</span>
              <span>🛡️ No credit card required</span>
              <span>•</span>
              <span>⭐ 4.9/5 rating</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;