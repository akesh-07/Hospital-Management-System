import React, { useState } from 'react';
import { UserPlus, Upload, Save, X } from 'lucide-react';
import { db } from '../../firebase';  // 👈 import Firestore connection
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export const PatientRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    email: '',
    address: '',
    abhaId: '',
    patientType: 'OPD',
    visitType: 'Appointment',
    paymentMethod: 'Cash',
    consultationPackage: '',
    preferredLanguage: 'English',
    doctorAssigned: '',
    chronicConditions: [] as string[],
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // 🔹 Save to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "patients"), {
        ...formData,
        createdAt: Timestamp.now(),
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // reset form
      setFormData({
        fullName: '',
        age: '',
        dateOfBirth: '',
        gender: '',
        contactNumber: '',
        email: '',
        address: '',
        abhaId: '',
        patientType: 'OPD',
        visitType: 'Appointment',
        paymentMethod: 'Cash',
        consultationPackage: '',
        preferredLanguage: 'English',
        doctorAssigned: '',
        chronicConditions: [],
      });
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  };

  const chronicConditionOptions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Kidney Disease',
    'Asthma', 'Arthritis', 'Cancer', 'Mental Health'
  ];

  const toggleCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter(c => c !== condition)
        : [...prev.chronicConditions, condition]
    }));
  };

return (
  <div className="p-6 bg-gray-50 min-h-screen">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <UserPlus className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Registration</h1>
          <p className="text-gray-600">Register a new patient in the system</p>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-800">Patient registered successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="p-3 border rounded-lg"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Age"
              className="p-3 border rounded-lg"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
              required
            />
            <input
              type="date"
              className="p-3 border rounded-lg"
              value={formData.dateOfBirth}
              onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            <select
              className="p-3 border rounded-lg"
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="tel"
              placeholder="Contact Number"
              className="p-3 border rounded-lg"
              value={formData.contactNumber}
              onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="p-3 border rounded-lg"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Address"
              className="p-3 border rounded-lg col-span-2"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ABHA ID"
              className="p-3 border rounded-lg"
              value={formData.abhaId}
              onChange={e => setFormData({ ...formData, abhaId: e.target.value })}
            />
            <select
              className="p-3 border rounded-lg"
              value={formData.patientType}
              onChange={e => setFormData({ ...formData, patientType: e.target.value })}
            >
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
              <option value="Emergency">Emergency</option>
            </select>
            <select
              className="p-3 border rounded-lg"
              value={formData.visitType}
              onChange={e => setFormData({ ...formData, visitType: e.target.value })}
            >
              <option value="Appointment">Appointment</option>
              <option value="Walk-in">Walk-in</option>
            </select>
            <input
              type="text"
              placeholder="Consultation Package"
              className="p-3 border rounded-lg"
              value={formData.consultationPackage}
              onChange={e => setFormData({ ...formData, consultationPackage: e.target.value })}
            />
          </div>

          <div className="mt-4">
            <h3 className="text-gray-700 font-medium mb-2">Chronic Conditions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {chronicConditionOptions.map(condition => (
                <label key={condition} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.chronicConditions.includes(condition)}
                    onChange={() => toggleCondition(condition)}
                  />
                  <span>{condition}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="p-3 border rounded-lg"
              value={formData.paymentMethod}
              onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Insurance">Insurance</option>
            </select>
            <select
              className="p-3 border rounded-lg"
              value={formData.preferredLanguage}
              onChange={e => setFormData({ ...formData, preferredLanguage: e.target.value })}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              placeholder="Doctor Assigned"
              className="p-3 border rounded-lg"
              value={formData.doctorAssigned}
              onChange={e => setFormData({ ...formData, doctorAssigned: e.target.value })}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="flex items-center px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            onClick={() =>
              setFormData({
                fullName: '',
                age: '',
                dateOfBirth: '',
                gender: '',
                contactNumber: '',
                email: '',
                address: '',
                abhaId: '',
                patientType: 'OPD',
                visitType: 'Appointment',
                paymentMethod: 'Cash',
                consultationPackage: '',
                preferredLanguage: 'English',
                doctorAssigned: '',
                chronicConditions: [],
              })
            }
          >
            <X className="w-4 h-4 mr-2" /> Clear
          </button>

          <button
            type="submit"
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" /> Register Patient
          </button>
        </div>
      </form>
    </div>
  </div>

);
};  // 👈 closes the PatientRegistration component properly
