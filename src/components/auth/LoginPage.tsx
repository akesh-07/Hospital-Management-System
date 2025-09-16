import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  ChevronDown,
} from "lucide-react";
import HMS_LOGO from "../layout/hms-logo.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Interface for the form data without the name field
interface LoginForm {
  email: string;
  password: string;
  role: string;
}

const userRoles = [
  {
    value: "doctor",
    label: "Login as Doctor",
    icon: "👨‍⚕️",
    route: "/dashboard",
  },
  {
    value: "pharmacist",
    label: "Login as Pharmacist",
    icon: "💊",
    route: "/dashboard",
  },
  {
    value: "technician",
    label: "Login as Technician",
    icon: "🔬",
    route: "/dashboard",
  },
  {
    value: "receptionist",
    label: "Login as Receptionist",
    icon: "📋",
    route: "/dashboard",
  },
  {
    value: "staff-nurse",
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
  const [isLoading, setIsLoading] = useState(false);

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

  const handleRoleSelect = (role: string) => {
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

    setIsLoading(true);
    setLoginError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      let userName = "User";
      if (formData.role === "doctor") {
        const q = query(collection(db, "doctors"), where("email", "==", formData.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doctorData = querySnapshot.docs[0].data();
          userName = doctorData.doc_name;
        }
      }

      Cookies.set("userRole", formData.role, { expires: 7 });
      Cookies.set("userName", userName, { expires: 7 });

      const selectedRole = userRoles.find(
        (role) => role.value === formData.role
      );
      if (selectedRole) {
        navigate(selectedRole.route);
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";
      if (error.code === "auth/invalid-email" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      }
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = userRoles.find((role) => role.value === formData.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-white to-[#e0f2f1] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <img
            src={HMS_LOGO}
            alt="Clinexa Hospital"
            className="mx-auto w-40 sm:w-48 md:w-56 lg:w-64 object-contain"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm border border-gray-100">
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{loginError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#0B2D4D]"
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
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1a4b7a] focus:border-transparent transition-all duration-200 ${
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
                className="block text-sm font-medium text-[#0B2D4D]"
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
                  className={`w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#1a4b7a] focus:border-transparent transition-all duration-200 ${
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
              <label className="block text-sm font-medium text-[#0B2D4D]">
                Select Your Role
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1a4b7a] focus:border-transparent transition-all duration-200 ${
                    errors.role ? "border-red-500 bg-red-50" : "border-gray-300"
                  } ${formData.role ? "text-[#0B2D4D]" : "text-gray-500"}`}
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
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#e0f7fa] transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <span className="text-lg">{role.icon}</span>
                        <span className="text-[#0B2D4D]">{role.label}</span>
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
                  className="rounded border-gray-300 text-[#012e58] focus:ring-[#1a4b7a] focus:ring-2"
                />
                <span className="ml-2 text-sm text-[#1a4b7a]">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-[#012e58] hover:text-[#1a4b7a] transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#012e58] to-[#1a4b7a] hover:from-[#1a4b7a] hover:to-[#012e58] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#1a4b7a] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
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
            <p className="text-sm text-[#1a4b7a]">
              Need help? Contact{" "}
              <a
                href="#"
                className="text-[#012e58] hover:text-[#1a4b7a] transition-colors"
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