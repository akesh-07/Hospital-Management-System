import React, { useState } from "react";
import {
  UserPlus,
  Save,
  X,
  CheckCircle,
  Calendar,
  HeartPulse,
  UserCog,
} from "lucide-react";
import { db } from "../../firebase"; // 👈 import Firestore connection
import { collection, addDoc, Timestamp } from "firebase/firestore";

// Helper component for section headers to maintain consistency
const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({
  icon: Icon,
  title,
}) => (
  <div className="flex items-center space-x-3 mb-6">
    <div className="bg-[#00A6A6]/10 p-2 rounded-lg">
      <Icon className="w-6 h-6 text-[#00A6A6]" />
    </div>
    <h2 className="text-2xl font-bold text-[#0B2D4D] tracking-tight">
      {title}
    </h2>
  </div>
);

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

  // Helper function to clear form (NO CHANGES HERE)
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
    setShowSuccess(false);
  };

  // A common className for form inputs to ensure consistency
  const inputStyle =
    "p-3 border border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-[#00A6A6] focus:border-[#00A6A6] transition duration-200 ease-in-out text-[#2C3E50] placeholder:text-[#7F8C8D]";

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F5F7FA] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-200">
          <div className="p-3 bg-[#00A6A6]/10 rounded-full">
            <UserPlus className="w-8 h-8 text-[#00A6A6]" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-[#0B2D4D] tracking-tight">
              Patient Registration
            </h1>
            <p className="text-[#7F8C8D] text-lg mt-1">
              Complete the form to onboard a new patient efficiently.
            </p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-[#2ECC71]/10 border-l-4 border-[#2ECC71] text-emerald-900 p-4 rounded-r-lg flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-[#2ECC71]" />
            <span className="font-medium text-lg">
              Patient registered successfully!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Main Grid Layout for Form Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader icon={UserCog} title="Personal Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Full Name"
                  className={`${inputStyle} sm:col-span-2`}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Age"
                  className={inputStyle}
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  required
                />
                <div className="relative">
                  <input
                    type="date"
                    className={inputStyle}
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    required
                  />
                  {!formData.dateOfBirth && (
                    <span className="absolute left-3.5 top-3.5 text-[#7F8C8D] pointer-events-none">
                      Date of Birth
                    </span>
                  )}
                </div>
                <select
                  className={`${inputStyle} sm:col-span-2`}
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader icon={Calendar} title="Contact Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input
                  type="tel"
                  placeholder="Contact Number"
                  className={inputStyle}
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNumber: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  className={inputStyle}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Full Address"
                  className={`${inputStyle} sm:col-span-2`}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Combined Medical & Preferences Card (Spans Full Width) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader
                icon={HeartPulse}
                title="Medical, Visit & Preferences"
              />

              {/* Visit Details Sub-section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <input
                  type="text"
                  placeholder="ABHA ID (Optional)"
                  className={inputStyle}
                  value={formData.abhaId}
                  onChange={(e) =>
                    setFormData({ ...formData, abhaId: e.target.value })
                  }
                />
                <select
                  className={inputStyle}
                  value={formData.patientType}
                  onChange={(e) =>
                    setFormData({ ...formData, patientType: e.target.value })
                  }
                >
                  <option value="OPD">OPD (Outpatient)</option>
                  <option value="IPD">IPD (Inpatient)</option>
                  <option value="Emergency">Emergency</option>
                </select>
                <select
                  className={inputStyle}
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
                  placeholder="Consultation Package"
                  className={inputStyle}
                  value={formData.consultationPackage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consultationPackage: e.target.value,
                    })
                  }
                />
              </div>

              {/* Chronic Conditions Sub-section */}
              <div className="mt-7 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">
                  Chronic Conditions (if any)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-3 gap-x-4">
                  {chronicConditionOptions.map((condition) => (
                    <label
                      key={condition}
                      className="flex items-center space-x-2 text-base text-[#2C3E50] cursor-pointer hover:text-[#00A6A6] transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[#00A6A6] border-gray-300 rounded focus:ring-[#00A6A6]"
                        checked={formData.chronicConditions.includes(condition)}
                        onChange={() => toggleCondition(condition)}
                      />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferences Sub-section */}
              <div className="mt-7 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">
                  Additional Preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  <select
                    className={inputStyle}
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
                    className={inputStyle}
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
                    className={`${inputStyle} sm:col-span-2`}
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
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="group flex items-center px-6 py-3 border border-[#00A6A6] rounded-lg text-[#00A6A6] bg-white hover:bg-[#00A6A6] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A6A6] transition-all duration-300 text-lg font-medium"
              onClick={clearForm}
            >
              <X className="w-5 h-5 mr-2.5 transition-transform duration-300 group-hover:rotate-90" />
              Clear Form
            </button>
            <button
              type="submit"
              className="flex items-center px-8 py-3 bg-[#0B2D4D] text-white font-semibold rounded-lg shadow-md hover:bg-[#0B2D4D]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2D4D] transition-all duration-300 text-lg"
            >
              <Save className="w-5 h-5 mr-2.5" />
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
