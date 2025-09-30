import React, { useState } from "react";
import {
  UserPlus,
  Save,
  X,
  CheckCircle,
  Calendar,
  HeartPulse,
  UserCog,
  Upload,
} from "lucide-react";
import { db } from "../../firebase";
import { 
  collection, 
  addDoc, 
  Timestamp,
  // 🟢 FIX: Import doc and updateDoc
  doc, 
  updateDoc 
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// Removed unused v4 import

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
    // Added new state for files
    files: null as FileList | null,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, files: e.target.files });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Add the document first to get the auto-generated Firestore ID
      const newPatientRef = await addDoc(collection(db, "patients"), {
        ...formData,
        fileUrls: [], // Placeholder for initial document write
        createdAt: Timestamp.now(),
        status: "Waiting",
      });

      const patientId = newPatientRef.id; // 🟢 Get the Firestore auto-generated ID
      const storage = getStorage();
      const fileUrls: string[] = [];
      
      // 2. Upload each file to Firebase Storage using the new patientId
      if (formData.files && formData.files.length > 0) {
        for (const file of Array.from(formData.files)) {
          // Use the Firestore ID in the Storage path
          const storageRef = ref(storage, `patients/${patientId}/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          fileUrls.push(downloadURL);
        }
      }

      // 3. Update the Firestore document with the final ID (inside the document) and file URLs
      // 🟢 This line now works because updateDoc is imported
      await updateDoc(newPatientRef, {
        id: patientId, // Set the document ID inside the data payload (as desired)
        fileUrls: fileUrls, // Add the final file URLs
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form state
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
        files: null,
      });
    } catch (error) {
      console.error("Error adding patient:", error);
    } finally {
        setIsSubmitting(false);
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

  const toggleCondition = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter((c) => c !== condition)
        : [...prev.chronicConditions, condition],
    }));
  };

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
      files: null,
    });
    setShowSuccess(false);
  };

  const inputStyle =
    "p-2.5 border border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition duration-200 ease-in-out text-primary-light placeholder:text-gray-500 text-sm";

  return (
    <div className="bg-gray-100 font-sans flex flex-col my-10 justify-center">
      <div className="max-w-7xl mx-auto flex-grow flex flex-col bg-white p-6 rounded-2xl shadow-lg border border-gray-200 w-full md:my-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 bg-accent-blue/10 border-l-4 border-accent-blue text-blue-900 p-3 rounded-r-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-accent-blue" />
            <span className="font-medium">
              Patient registered successfully!
            </span>
          </div>
        )}

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          <form onSubmit={handleSubmit} className="h-full">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                    <input
                      type="email"
                      placeholder="Email Address (Optional)"
                      className={inputStyle}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                    <input
                      type="text"
                      placeholder="Full Address"
                      className={inputStyle}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      disabled={isSubmitting}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="ABHA ID (Optional)"
                      className={inputStyle}
                      value={formData.abhaId}
                      onChange={(e) =>
                        setFormData({ ...formData, abhaId: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                    <select
                      className={inputStyle}
                      value={formData.patientType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          patientType: e.target.value,
                        })
                      }
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                            disabled={isSubmitting}
                          />
                          <span>{condition}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Additional Preferences & File Upload */}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      />
                      {/* File Upload Button */}
                      <label className="sm:col-span-2 block cursor-pointer">
                        <span className="sr-only">Choose file</span>
                        <div
                          className={`${inputStyle} flex items-center justify-between text-gray-500`}
                        >
                          <span className="truncate">
                            {formData.files && formData.files.length > 0
                              ? `${formData.files.length} file(s) selected`
                              : "Upload past medical documents"}
                          </span>
                          <Upload className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          multiple
                          accept=".pdf, .docx"
                          disabled={isSubmitting}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="group flex items-center px-5 py-2.5 border border-accent-blue rounded-lg text-accent-blue bg-white hover:bg-accent-blue hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue transition-all duration-300 font-medium"
            onClick={clearForm}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
            Clear Form
          </button>
          <button
            type="submit"
            className="flex items-center px-6 py-2.5 bg-primary-dark text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-all duration-300 disabled:opacity-70 disabled:cursor-wait"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </div>
    </div>
  );
};