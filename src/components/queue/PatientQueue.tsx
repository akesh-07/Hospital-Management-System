import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import {
  Users,
  Clock,
  Phone,
  Tag,
  Car as IdCard, // ⚠️ using IdCard
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { VitalsAssessment } from "../vitals/VitalsAssessment";
import { DoctorModule } from "../doctor/DoctorModule"; // Import DoctorModule
import { Patient } from "../../types";

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
  // State to manage the open patient ID for the accordion
  const [openPatientId, setOpenPatientId] = useState<string | null>(null);
  const [showVitals, setShowVitals] = useState(false);
  const [vitalsPatient, setVitalsPatient] = useState<Patient | null>(null);
  const [showDoctor, setShowDoctor] = useState(false);
  const [doctorPatient, setDoctorPatient] = useState<Patient | null>(null);
  // 👤 Get user role from cookie

  const name =Cookies.get("userName");
  const storedRole = Cookies.get("userRole");
  const currentUserRole =
    storedRole === "doctor"
      ? "Doctor"
      : storedRole === "staff-nurse"
      ? "Nurse"
      : storedRole === "receptionist"
      ? "Receptionist"
      : "";

      
  // 🔥 Fetch patients from Firestore
  useEffect(() => {
    const patientsQuery = query(
      collection(db, "patients"),
      where("patientType", "==", "OPD"),
      where("doctorAssigned","==",name)
      
    );

    const unsubscribe = onSnapshot(patientsQuery, (snapshot) => {
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

  // Handle vitals button click
  const handleVitalsClick = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setVitalsPatient(patient);
    setShowVitals(true);
  };

  // Handle doctor button click
  const handleDoctorClick = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setDoctorPatient(patient);
    setShowDoctor(true);
  };

  // Handle back from vitals
  const handleBackFromVitals = () => {
    setShowVitals(false);
    setVitalsPatient(null);
  };

  // Handle back from doctor module
  const handleBackFromDoctor = () => {
    setShowDoctor(false);
    setDoctorPatient(null);
  };

  // ✅ Patient Card Component with Accordion
  const PatientCard: React.FC<{
    patient: Patient;
    displayId: string; // Accepts the generated displayId
    isOpen: boolean;
    onToggle: () => void;
  }> = ({ patient, displayId, isOpen, onToggle }) => (
    <div
      className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer ${
        isOpen ? "ring-2 ring-[#012e58]" : "border-gray-200"
      }`}
      onClick={onToggle}
    >
      {/* --- First Line: 6-Column Layout --- */}
      <div className="flex justify-between gap-6 text-sm items-center">
        {/* Patient Name and Details */}
        <div className="col-span-2 rounded-none flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#e0f7fa] rounded-full flex items-center justify-center">
            <span className="text-[#012e58] font-medium text-sm">
              {patient.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-[#0B2D4D]">{patient.fullName}</h3>
            {/* UPDATED: Display formatted patient ID */}
            <p className="text-xs text-[#1a4b7a]">
              {patient.gender}, {patient.age} years • Patient ID: {displayId}
            </p>
          </div>
        </div>

        {/* Doctor Assigned */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500">Doctor</span>
          <span className="text-sm text-[#1a4b7a] font-medium">
            Dr. {patient.doctorAssigned || "Not Assigned"}
          </span>
        </div>

        {/* Waiting Time */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500">Wait Time</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-[#1a4b7a] font-medium">
              {patient.waitTime || 0} min
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
              patient.status
            )}`}
          >
            {patient.status || "Waiting"}
          </span>
        </div>
        <div className="flex items-center space-x-5">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>

      {/* --- Detailed Info (Accordion Content) with Transition --- */}
      <div
        className={`grid grid-cols-3 justify-a gap-4 text-sm overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-96 opacity-100 pt-4 mt-3 border-t border-gray-200"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-[#1a4b7a]">{patient.contactNumber}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-[#1a4b7a]">{patient.visitType}</span>
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

        <div className="">
          <span className="font-medium text-[#0B2D4D]">
            Chronic Conditions:
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {patient.chronicConditions?.map((condition, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
        {/* ✅ Action Buttons */}
        <div
          className={`flex gap-2 transition-all duration-300 ease-in-out ${
            isOpen ? "mt-3 pt-3 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {(currentUserRole === "Nurse" ||
            currentUserRole === "Receptionist") && (
            <button
              onClick={(e) => handleVitalsClick(patient, e)}
              className="flex-1 px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
            >
              Vitals
            </button>
          )}

          {currentUserRole === "Doctor" && (
            <button
              onClick={(e) => handleDoctorClick(patient, e)}
              className="flex-1 px-3 py-1 text-sm bg-[#e0f7fa] text-[#012e58] rounded-lg hover:bg-[#b3e5fc]"
            >
              Start Consultation
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ✅ If Vitals page selected, show it directly with patient data
  if (showVitals) {
    return (
      <VitalsAssessment
        selectedPatient={vitalsPatient}
        onBack={handleBackFromVitals}
      />
    );
  }

  // ✅ If Doctor module selected, show it directly with patient data
  if (showDoctor) {
    return (
      <DoctorModule
        selectedPatient={doctorPatient}
        onBack={handleBackFromDoctor}
      />
    );
  }

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-[#012e58]" />
          <div>
            <h1 className="text-3xl font-bold text-[#0B2D4D]">Pre-OPD Queue</h1>
            <p className="text-[#1a4b7a]">
              Manage patient queue and appointments
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-[#1a4b7a]">Patients in OPD Queue</p>
            <p className="text-2xl font-bold text-[#012e58]">
              {patients.filter((p) => p.patientType === "OPD").length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* ✅ Only OPD patients */}
        <div className="space-y-4">
          {patients
            .filter((patient) => patient.patientType === "OPD")
            .map((patient) => {
              let displayId = "PT00000000"; // Fallback ID

              // Cast to 'any' to access the .toDate() method if it exists
              const createdAtTimestamp = patient.createdAt as any;

              // Check if createdAt is a Firestore Timestamp object with a .toDate() method
              if (
                createdAtTimestamp &&
                typeof createdAtTimestamp.toDate === "function"
              ) {
                const creationDate = createdAtTimestamp.toDate(); // Convert to a JS Date object

                const year = creationDate.getFullYear().toString().slice(-2); // YY
                const month = (creationDate.getMonth() + 1)
                  .toString()
                  .padStart(2, "0"); // MM
                const day = creationDate.getDate().toString().padStart(2, "0"); // DD
                const hours = creationDate
                  .getHours()
                  .toString()
                  .padStart(2, "0"); // HH
                const minutes = creationDate
                  .getMinutes()
                  .toString()
                  .padStart(2, "0"); // MIN
                displayId = `PT${year}${month}${day}${hours}${minutes}`;
              }
              // Fallback for cases where it might be a string
              else if (patient.createdAt) {
                const creationDate = new Date(patient.createdAt);
                if (!isNaN(creationDate.getTime())) {
                  const year = creationDate.getFullYear().toString().slice(-2); // YY
                  const month = (creationDate.getMonth() + 1)
                    .toString()
                    .padStart(2, "0"); // MM
                  const day = creationDate
                    .getDate()
                    .toString()
                    .padStart(2, "0"); // DD
                  const hours = creationDate
                    .getHours()
                    .toString()
                    .padStart(2, "0"); // HH
                  const minutes = creationDate
                    .getMinutes()
                    .toString()
                    .padStart(2, "0"); // MIN
                  displayId = `PT${year}${month}${day}${hours}${minutes}`;
                }
              }

              return (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  displayId={displayId} // Pass the newly generated ID
                  isOpen={openPatientId === patient.id}
                  onToggle={() =>
                    setOpenPatientId(
                      openPatientId === patient.id ? null : patient.id
                    )
                  }
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PatientQueue;

