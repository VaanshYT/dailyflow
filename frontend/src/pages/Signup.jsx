import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/common/InputField';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Signup = ({ onToggleMode }) => {
  const { signup, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setErrors({});
      await signup(formData.name, formData.email, formData.password, formData.confirmPassword);
    } catch (error) {
      setErrors({ general: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
          <p className="text-gray-600">Join us today</p>
        </div>

        {errors.general && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        <div className="space-y-6">
          <InputField
            icon={User}
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            disabled={isLoading}
          />

          <InputField
            icon={Mail}
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            disabled={isLoading}
          />
          
          <InputField
            icon={Lock}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            showToggle={true}
            onToggle={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
            error={errors.password}
            disabled={isLoading}
          />

          <InputField
            icon={Lock}
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            showToggle={true}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            showPassword={showConfirmPassword}
            error={errors.confirmPassword}
            disabled={isLoading}
          />

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 active:bg-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onToggleMode}
              disabled={isLoading}
              className="text-orange-500 font-medium hover:text-orange-600 transition-colors duration-200 disabled:opacity-50"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;