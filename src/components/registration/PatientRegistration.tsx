import React, { useState } from "react";
import { UserPlus, Save, X, CheckCircle } from "lucide-react"; // Added CheckCircle for success message
import { db } from "../../firebase"; // 👈 import Firestore connection
import { collection, addDoc, Timestamp } from "firebase/firestore";

export const PatientRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    email: "",
    address: "",
    abhaId: "",
    patientType: "OPD",
    visitType: "Appointment",
    paymentMethod: "Cash",
    consultationPackage: "",
    preferredLanguage: "English",
    doctorAssigned: "",
    chronicConditions: [] as string[],
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // 🔹 Save to Firestore (NO CHANGES HERE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "patients"), {
        ...formData,
        createdAt: Timestamp.now(),
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // Hide message after 3 seconds

      // reset form
      setFormData({
        fullName: "",
        age: "",
        dateOfBirth: "",
        gender: "",
        contactNumber: "",
        email: "",
        address: "",
        abhaId: "",
        patientType: "OPD",
        visitType: "Appointment",
        paymentMethod: "Cash",
        consultationPackage: "",
        preferredLanguage: "English",
        doctorAssigned: "",
        chronicConditions: [],
      });
    } catch (error) {
      console.error("Error adding patient:", error);
      // You might want to add an error message state here too
    }
  };

  const chronicConditionOptions = [
    "Diabetes",
    "Hypertension",
    "Heart Disease",
    "Kidney Disease",
    "Asthma",
    "Arthritis",
    "Cancer",
    "Mental Health",
  ];

  // Helper function for checkboxes (NO CHANGES HERE)
  const toggleCondition = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter((c) => c !== condition)
        : [...prev.chronicConditions, condition],
    }));
  };

  // Helper function to clear form (NO CHANGES HERE, but used in Clear button)
  const clearForm = () => {
    setFormData({
      fullName: "",
      age: "",
      dateOfBirth: "",
      gender: "",
      contactNumber: "",
      email: "",
      address: "",
      abhaId: "",
      patientType: "OPD",
      visitType: "Appointment",
      paymentMethod: "Cash",
      consultationPackage: "",
      preferredLanguage: "English",
      doctorAssigned: "",
      chronicConditions: [],
    });
    setShowSuccess(false); // Also hide success message on clear
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-8 pb-4 border-b border-gray-200">
          <div className="p-3 bg-blue-100 rounded-full">
            <UserPlus className="w-7 h-7 text-blue-700" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              Patient Registration
            </h1>
            <p className="text-gray-600 text-lg">
              Streamline new patient onboarding process
            </p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-green-500 rounded-lg blur opacity-75 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-5 shadow-lg border border-green-200 flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-green-800 font-medium text-lg">
                Patient registered successfully!
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Main Two-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* █ █ █ █ █ LEFT COLUMN █ █ █ █ █ */}
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white p-7 rounded-xl shadow-lg border border-gray-100 transform hover:scale-[1.005] transition-transform duration-200 ease-out">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Personal Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-800"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-800"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    required
                  />
                  <div className="relative">
                    <input
                      type="date"
                      className="p-3.5 border border-gray-300 rounded-lg w-full text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                    {!formData.dateOfBirth && (
                      <span className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none">
                        Date of Birth
                      </span>
                    )}
                  </div>
                  <select
                    className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-700"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white p-7 rounded-xl shadow-lg border border-gray-100 transform hover:scale-[1.005] transition-transform duration-200 ease-out">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="tel"
                    placeholder="Contact Number"
                    className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-800"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactNumber: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-800"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Full Address"
                    className="p-3.5 border border-gray-300 rounded-lg md:col-span-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-800"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* █ █ █ █ █ RIGHT COLUMN █ █ █ █ █ */}
            <div className="space-y-8">
              {/* Medical Information */}
              <div className="bg-white p-7 rounded-xl shadow-lg border border-gray-100 transform hover:scale-[1.005] transition-transform duration-200 ease-out">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Medical & Visit Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="ABHA ID (Optional)"
                    className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-800"
                    value={formData.abhaId}
                    onChange={(e) =>
                      setFormData({ ...formData, abhaId: e.target.value })
                    }
                  />
                  <select
                    className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-700"
                    value={formData.patientType}
                    onChange={(e) =>
                      setFormData({ ...formData, patientType: e.target.value })
                    }
                  >
                    <option value="OPD">OPD (Outpatient Department)</option>
                    <option value="IPD">IPD (Inpatient Department)</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                  <select
                    className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-700"
                    value={formData.visitType}
                    onChange={(e) =>
                      setFormData({ ...formData, visitType: e.target.value })
                    }
                  >
                    <option value="Appointment">Appointment</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Consultation Package (e.g., General)"
                    className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-800"
                    value={formData.consultationPackage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultationPackage: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mt-7 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Chronic Conditions (if any)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                    {chronicConditionOptions.map((condition) => (
                      <label
                        key={condition}
                        className="flex items-center space-x-2 text-base text-gray-700 cursor-pointer hover:text-blue-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData.chronicConditions.includes(
                            condition
                          )}
                          onChange={() => toggleCondition(condition)}
                        />
                        <span>{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white p-7 rounded-xl shadow-lg border border-gray-100 transform hover:scale-[1.005] transition-transform duration-200 ease-out">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Additional Preferences
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <select
                    className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-700"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Insurance">Insurance</option>
                    <option value="UPI">UPI / Online</option>
                  </select>
                  <select
                    className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-700"
                    value={formData.preferredLanguage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredLanguage: e.target.value,
                      })
                    }
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Assign Doctor (Optional)"
                    className="p-3.5 border border-gray-300 rounded-lg md:col-span-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out text-gray-800"
                    value={formData.doctorAssigned}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        doctorAssigned: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-10 pt-8 border-t border-gray-200">
            <button
              type="button"
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200 text-lg font-medium"
              onClick={clearForm}
            >
              <X className="w-5 h-5 mr-2.5" /> Clear Form
            </button>

            <button
              type="submit"
              className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 text-lg"
            >
              <Save className="w-5 h-5 mr-2.5" /> Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
