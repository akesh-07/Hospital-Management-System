import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  ChevronDown,
  Activity,
  Users,
} from "lucide-react";
import { useAuth, UserRole } from "../../contexts/AuthContext";

interface LoginForm {
  email: string;
  password: string;
  role: UserRole | "" | string;
}

const userRoles = [
  {
    value: "doctor" as UserRole,
    label: "Login as Doctor",
    icon: "👨‍⚕️",
    route: "/dashboard",
  },
  {
    value: "pharmacist" as UserRole,
    label: "Login as Pharmacist",
    icon: "💊",
    route: "/dashboard",
  },
  {
    value: "technician" as UserRole,
    label: "Login as Technician",
    icon: "🔬",
    route: "/dashboard",
  },
  {
    value: "receptionist" as UserRole,
    label: "Login as Receptionist",
    icon: "📋",
    route: "/dashboard",
  },
  {
    value: "staff-nurse" as UserRole,
    label: "Login as Staff Nurse",
    icon: "👩‍⚕️",
    route: "/dashboard",
  },
];

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [loginError, setLoginError] = useState("");

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof LoginForm]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (loginError) {
      setLoginError("");
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));
    setIsDropdownOpen(false);
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: "" }));
    }
    if (loginError) {
      setLoginError("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.role) {
      newErrors.role = "Please select your role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const success = await login(
        formData.email,
        formData.password,
        formData.role as UserRole
      );

      if (success) {
        const selectedRole = userRoles.find(
          (role) => role.value === formData.role
        );
        if (selectedRole) {
          navigate(selectedRole.route);
        } else {
          navigate("/dashboard"); // Fallback to dashboard
        }
      } else {
        setLoginError(
          "Invalid credentials. Please check your email, password, and role."
        );
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    }
  };

  const selectedRole = userRoles.find((role) => role.value === formData.role);

  // The rest of the component's JSX remains the same
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            MediCare Hospital
          </h1>
          <p className="text-gray-600">Management System Portal</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{loginError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 animate-fade-in">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 animate-fade-in">
                  {errors.password}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Your Role
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.role ? "border-red-500 bg-red-50" : "border-gray-300"
                  } ${formData.role ? "text-gray-800" : "text-gray-500"}`}
                >
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <span className="flex items-center gap-2">
                    {selectedRole ? (
                      <>
                        <span>{selectedRole.icon}</span>
                        <span>{selectedRole.label}</span>
                      </>
                    ) : (
                      "Select your role"
                    )}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fade-in">
                    {userRoles.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleRoleSelect(role.value)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <span className="text-lg">{role.icon}</span>
                        <span className="text-gray-800">{role.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.role && (
                <p className="text-sm text-red-600 animate-fade-in">
                  {errors.role}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                IT Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
