import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapIcon, 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const schema = yup.object({
  firstName: yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .matches(/^[a-zA-Z\s-]+$/, 'First name can only contain letters, spaces, and hyphens'),
  lastName: yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .matches(/^[a-zA-Z\s-]+$/, 'Last name can only contain letters, spaces, and hyphens'),
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    ),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  acceptTerms: yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  useEffect(() => {
    // Check password strength
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };
    setPasswordChecks(checks);

    // Calculate strength (0-4)
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return { text: 'Very Weak', color: 'text-red-600', bg: 'bg-red-500', width: '20%' };
      case 1: return { text: 'Weak', color: 'text-orange-600', bg: 'bg-orange-500', width: '40%' };
      case 2: return { text: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-500', width: '60%' };
      case 3: return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-500', width: '80%' };
      case 4: return { text: 'Strong', color: 'text-green-600', bg: 'bg-green-500', width: '100%' };
      default: return { text: 'Very Weak', color: 'text-red-600', bg: 'bg-red-500', width: '20%' };
    }
  };

  const strengthInfo = getPasswordStrengthText();

  const onSubmit = async (data) => {
    const { confirmPassword, acceptTerms, ...userData } = data;
    
    // Show loading toast
    const loadingToast = toast.loading('Creating your account...');
    
    try {
      const result = await registerUser(userData);
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success(
          <div className="flex items-center">
            <CheckCircleSolid className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="font-medium">Welcome aboard! 🎉</p>
              <p className="text-sm">Your account has been created successfully</p>
            </div>
          </div>,
          { duration: 5000 }
        );
        navigate('/trips');
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleSocialLogin = (provider) => {
    toast.success(`Signing up with ${provider}...`);
    // Implement social login logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-xl mb-4">
            <MapIcon className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of travelers planning their adventures
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-white/50">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Fields - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="group">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-primary-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    {...register('firstName')}
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                      errors.firstName 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Jane"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-primary-600">*</span>
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                    errors.lastName 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address <span className="text-primary-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                    errors.email 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="jane.doe@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-primary-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                    errors.password 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Password strength:</span>
                    <span className={`text-sm font-medium ${strengthInfo.color}`}>
                      {strengthInfo.text}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strengthInfo.bg} transition-all duration-300`}
                      style={{ width: strengthInfo.width }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-xs">
                      {passwordChecks.length ? (
                        <CheckCircleSolid className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span className={passwordChecks.length ? 'text-green-600' : 'text-gray-500'}>
                        8+ characters
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordChecks.uppercase ? (
                        <CheckCircleSolid className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span className={passwordChecks.uppercase ? 'text-green-600' : 'text-gray-500'}>
                        Uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordChecks.lowercase ? (
                        <CheckCircleSolid className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span className={passwordChecks.lowercase ? 'text-green-600' : 'text-gray-500'}>
                        Lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordChecks.number ? (
                        <CheckCircleSolid className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span className={passwordChecks.number ? 'text-green-600' : 'text-gray-500'}>
                        Number
                      </span>
                    </div>
                    <div className="flex items-center text-xs col-span-2">
                      {passwordChecks.special ? (
                        <CheckCircleSolid className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span className={passwordChecks.special ? 'text-green-600' : 'text-gray-500'}>
                        Special character (@$!%*?&)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-primary-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                    errors.confirmPassword 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  {...register('acceptTerms')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                />
              </div>
              <div className="ml-3">
                <label className="text-sm text-gray-600">
                  I accept the{' '}
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
                    Privacy Policy
                  </a>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 py-3.5 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center text-lg">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Social Login */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all group"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all group"
              >
                <svg className="h-5 w-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Facebook</span>
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center">
              Sign in
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-1" />
            <span>Secure signup</span>
          </div>
          <div className="flex items-center">
            <SparklesIcon className="h-4 w-4 text-primary-500 mr-1" />
            <span>Free forever</span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-1" />
            <span>No spam</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;