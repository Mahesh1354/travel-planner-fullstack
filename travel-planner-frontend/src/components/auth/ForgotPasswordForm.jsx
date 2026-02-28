import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPasswordForm = ({ onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="email" className="input-label">
          Email address
        </label>
        <div className="relative">
          <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            {...register('email')}
            type="email"
            className="input-field pl-10"
            placeholder="you@example.com"
          />
        </div>
        {errors.email && (
          <p className="error-text">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary"
      >
        {loading ? 'Sending...' : 'Send reset link'}
      </button>
    </form>
  );
};

export default ForgotPasswordForm;