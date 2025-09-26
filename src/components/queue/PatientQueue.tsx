import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import {
  Users,
  Clock,
  Phone,
  Tag,
  Car as IdCard,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { VitalsAssessment } from "../vitals/VitalsAssessment";
import { DoctorModule } from "../doctor/DoctorModule";
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
  const [openPatientId, setOpenPatientId] = useState<string | null>(null);
  const [showVitals, setShowVitals] = useState(false);
  const [vitalsPatient, setVitalsPatient] = useState<Patient | null>(null);
  const [showDoctor, setShowDoctor] = useState(false);
  const [doctorPatient, setDoctorPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const name = Cookies.get("userName");
  const storedRole = Cookies.get("userRole");
  const currentUserRole =
    storedRole === "doctor"
      ? "Doctor"
      : storedRole === "staff-nurse"
      ? "Nurse"
      : storedRole === "receptionist"
      ? "Receptionist"
      : "";

  useEffect(() => {
    const patientsQuery = query(
      collection(db, "patients"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(
      patientsQuery,
      (snapshot) => {
        let data = snapshot.docs.map(
          (doc, index) =>
            ({
              id: doc.id,
              ...doc.data(),
              token: `T${String(index + 1).padStart(3, "0")}`,
            } as Patient)
        );

        data = data.filter((patient) => patient.patientType === "OPD");

        if (storedRole === "doctor" && name) {
          data = data.filter((patient) => patient.doctorAssigned === name);
        }

        setPatients(data);
      },
      (error) => {
        console.error("Firebase query error:", error);
      }
    );

    return () => unsubscribe();
  }, [storedRole, name]);

  const handleVitalsClick = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setVitalsPatient(patient);
    setShowVitals(true);
  };

  const handleDoctorClick = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    if (patient.status === "Waiting") {
      const patientRef = doc(db, "patients", patient.id);
      updateDoc(patientRef, {
        status: "In Progress",
      });
    }
    setDoctorPatient(patient);
    setShowDoctor(true);
  };

  const handleBackFromVitals = () => {
    setShowVitals(false);
    setVitalsPatient(null);
  };

  const handleBackFromDoctor = () => {
    setShowDoctor(false);
    setDoctorPatient(null);
  };

  const handleCompleteConsultation = async (patientId: string) => {
    const patientRef = doc(db, "patients", patientId);
    await updateDoc(patientRef, {
      status: "Completed",
    });
    setShowDoctor(false);
    setDoctorPatient(null);
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.token.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Not Visited" && patient.status === "Waiting") ||
      (statusFilter === "Pending" && patient.status === "In Progress") ||
      (statusFilter === "Completed" && patient.status === "Completed");
    return matchesSearch && matchesStatus;
  });

  const PatientCard: React.FC<{
    patient: Patient;
    isOpen: boolean;
    onToggle: () => void;
  }> = ({ patient, isOpen, onToggle }) => (
    <div
      className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer ${
        isOpen ? "ring-2 ring-[#012e58]" : "border-gray-200"
      }`}
      onClick={onToggle}
    >
      <div className="flex justify-between gap-6 text-sm items-center">
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
            <p className="text-xs text-[#1a4b7a]">Token: {patient.token}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500">Doctor</span>
          <span className="text-sm text-[#1a4b7a] font-medium">
            Dr. {patient.doctorAssigned || "Not Assigned"}
          </span>
        </div>
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

          {currentUserRole === "Doctor" && patient.status !== "Completed" && (
            <button
              onClick={(e) => handleDoctorClick(patient, e)}
              className="flex-1 px-3 py-1 text-sm bg-[#e0f7fa] text-[#012e58] rounded-lg hover:bg-[#b3e5fc]"
            >
              {patient.status === "Waiting" ? "Start Consultation" : "Resume"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (showVitals) {
    return (
      <VitalsAssessment
        selectedPatient={vitalsPatient}
        onBack={handleBackFromVitals}
      />
    );
  }

  if (showDoctor) {
    return (
      <DoctorModule
        selectedPatient={doctorPatient}
        onBack={handleBackFromDoctor}
        onCompleteConsultation={handleCompleteConsultation}
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
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or token"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4b7a] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a4b7a] focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="Not Visited">Not Visited</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              isOpen={openPatientId === patient.id}
              onToggle={() =>
                setOpenPatientId(
                  openPatientId === patient.id ? null : patient.id
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientQueue;
