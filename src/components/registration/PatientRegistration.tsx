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
  <div className="flex items-center space-x-2 mb-4">
    <div className="bg-accent-blue/10 p-1.5 rounded-lg">
      <Icon className="w-5 h-5 text-accent-blue" />
    </div>
    <h2 className="text-lg font-bold text-primary-dark tracking-tight">
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
    "p-2.5 border border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition duration-200 ease-in-out text-primary-light placeholder:text-gray-500 text-sm";

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 bg-accent-blue/10 border-l-4 border-accent-blue text-blue-900 p-3 rounded-r-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-accent-blue" />
            <span className="font-medium">
              Patient registered successfully!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Personal Information Card */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={UserCog} title="Personal Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      required
                    />
                    {!formData.dateOfBirth && (
                      <span className="absolute left-3 top-3 text-gray-500 pointer-events-none text-sm"></span>
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
              <div className="bg-white p-4 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Calendar} title="Contact Information" />
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="tel"
                    placeholder="Contact Number"
                    className={inputStyle}
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
                    className={inputStyle}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Full Address"
                    className={inputStyle}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Medical & Visit Information Card */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader
                  icon={HeartPulse}
                  title="Medical & Visit Details"
                />

                {/* Visit Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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

                {/* Chronic Conditions */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-primary-light mb-2">
                    Chronic Conditions (if any)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {chronicConditionOptions.map((condition) => (
                      <label
                        key={condition}
                        className="flex items-center space-x-2 text-sm text-primary-light cursor-pointer hover:text-accent-blue transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 text-accent-blue border-gray-300 rounded focus:ring-accent-blue"
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

                {/* Preferences */}
                <div>
                  <h3 className="text-sm font-semibold text-primary-light mb-2">
                    Additional Preferences
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="group flex items-center px-5 py-2.5 border border-accent-blue rounded-lg text-accent-blue bg-white hover:bg-accent-blue hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue transition-all duration-300 font-medium"
              onClick={clearForm}
            >
              <X className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
              Clear Form
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2.5 bg-primary-dark text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-all duration-300"
            >
              <Save className="w-4 h-4 mr-2" />
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
