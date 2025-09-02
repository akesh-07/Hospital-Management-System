// src/components/queue/PatientQueue.tsx

import React, { useEffect, useState } from "react";
import {
  Users,
  Clock,
  Phone,
  Tag,
  Play,
  Pause,
  Car as IdCard,
  Upload,
  StickyNote,
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase"; // adjust if your firebase.ts path differs

// Match your formData structure
export interface Patient {
  id: string;
  fullName: string;
  age: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  email: string;
  address: string;
  abhaId: string;
  patientType: string;
  visitType: string;
  paymentMethod: string;
  consultationPackage: string;
  preferredLanguage: string;
  doctorAssigned: string;
  chronicConditions: string[];
  uhid?: string; // optional
  waitTime?: number; // optional
  status?: "Waiting" | "In Progress" | "Completed"; // optional
}

const getStatusColor = (status: Patient["status"]) => {
  switch (status) {
    case "Waiting":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const PatientQueue: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // 🔥 Fetch patients from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "patients"), (snapshot) => {
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Patient)
      );
      setPatients(data);
    });

    return () => unsubscribe();
  }, []);

  const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => (
    <div
      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer ${
        selectedPatient?.id === patient.id
          ? "ring-2 ring-blue-500"
          : "border-gray-200"
      }`}
      onClick={() => setSelectedPatient(patient)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {patient.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {patient.fullName}
            </h3>
            <p className="text-sm text-gray-600">
              {patient.gender}, {patient.age} years • UHID:{" "}
              {patient.uhid || "N/A"}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
            patient.status
          )}`}
        >
          {patient.status || "Waiting"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{patient.contactNumber}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            Wait: {patient.waitTime || 0} min
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{patient.visitType}</span>
        </div>
        <div className="flex items-center space-x-2">
          <IdCard className="w-4 h-4 text-gray-400" />
          <span
            className={`text-xs px-2 py-1 rounded ${
              patient.abhaId
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {patient.abhaId ? "ABHA Linked" : "No ABHA"}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Dr. {patient.doctorAssigned || "Not Assigned"}
          </span>
          <span className="text-gray-600">{patient.paymentMethod}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pre-OPD Queue</h1>
            <p className="text-gray-600">
              Manage patient queue and appointments
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Patients in Queue</p>
            <p className="text-2xl font-bold text-blue-600">
              {patients.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>

        <div className="space-y-6">
          {selectedPatient ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Patient Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Full Name:
                  </span>
                  <p className="text-gray-600 mt-1">
                    {selectedPatient.fullName}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Contact:</span>
                  <p className="text-gray-600 mt-1">
                    {selectedPatient.contactNumber}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-600 mt-1">
                    {selectedPatient.address}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Chronic Conditions:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPatient.chronicConditions?.map(
                      (condition, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                        >
                          {condition}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Select a patient to view details and actions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientQueue;
