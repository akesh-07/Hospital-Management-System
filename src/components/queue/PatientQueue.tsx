// PatientQueue.tsx
import Cookies from "js-cookie";
import React, { useEffect, useState, useCallback } from "react";
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
  Loader,
  ChevronUp as ChevronUpIcon, // Renamed to avoid clash
  ChevronDown as ChevronDownIcon, // Renamed to avoid clash
} from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  setDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { PreOPDIntake } from "../vitals/PreOPDIntake";
import { DoctorModule } from "../doctor/DoctorModule";
import { Patient } from "../../types";

// Helper function to normalize names (e.g., "Dr. John Doe" -> "john doe")
const normalizeName = (name: string | undefined | null) => {
  if (!name) return "";
  return name
    .replace(/^(Dr\.\s*|dr\.\s*)/i, "")
    .trim()
    .toLowerCase();
};

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

// New Status Card Component
const StatusCard: React.FC<{
  label: string;
  count: number;
  colorClass: string;
}> = ({ label, count, colorClass }) => (
  <div
    // ✅ Use min-w to ensure cards have a minimum width, but can grow
    className={`p-3 rounded-lg shadow-sm w-full md:w-auto md:min-w-[120px] ${colorClass}`}
  >
    <p className="text-xs font-medium text-gray-700 truncate">{label}</p>
    <p className="text-2xl font-bold mt-0.5">{count}</p>
  </div>
);

// Type for search field
type SearchField = "patientName" | "doctorName" | "token" | "phone" | "uhid";

// Helper function for placeholder text
const getPlaceholderText = (field: SearchField) => {
  switch (field) {
    case "patientName":
      return "Search by patient name...";
    case "doctorName":
      return "Search by doctor name...";
    case "token":
      return "Search by token (e.g., T001)...";
    case "phone":
      return "Search by phone number...";
    case "uhid":
      return "Search by UHID...";
    default:
      return "Search...";
  }
};

const PatientQueue: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [openPatientId, setOpenPatientId] = useState<string | null>(null);
  const [showVitals, setShowVitals] = useState(false);
  const [vitalsPatient, setVitalsPatient] = useState<Patient | null>(null);
  const [showDoctor, setShowDoctor] = useState(false);
  const [doctorPatient, setDoctorPatient] = useState<Patient | null>(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchBy, setSearchBy] = useState<SearchField>("patientName");

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

  // Debounce hook for search input
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 1. Fetch Patients from Firestore
  useEffect(() => {
    const patientsQuery = query(
      collection(db, "patients"),
      orderBy("createdAt")
    );

    const normalizedDoctorName = normalizeName(name);

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
          data = data.filter(
            (patient) =>
              normalizeName(patient.doctorAssigned) === normalizedDoctorName
          );
        }
        setPatients(data);
      },
      (error) => {
        console.error("Firebase query error:", error);
      }
    );

    return () => unsubscribe();
  }, [storedRole, name]);

  // 2. Client-Side Filtering
  useEffect(() => {
    setIsSearching(true);
    const filterPatients = () => {
      const term = debouncedSearchTerm.toLowerCase();

      const results = patients.filter((patient) => {
        let matchesSearch;
        const termForToken = term.replace("t", "");

        switch (searchBy) {
          case "patientName":
            matchesSearch = (patient.fullName ?? "")
              .toLowerCase()
              .includes(term);
            break;
          case "doctorName":
            matchesSearch = normalizeName(patient.doctorAssigned).includes(
              term
            );
            break;
          case "token":
            matchesSearch = (patient.token ?? "")
              .toLowerCase()
              .includes(termForToken);
            break;
          case "phone":
            matchesSearch = (patient.contactNumber ?? "")
              .toLowerCase()
              .includes(term);
            break;
          case "uhid":
            matchesSearch = (patient.uhid ?? "").toLowerCase().includes(term);
            break;
          default:
            matchesSearch = true;
        }

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "Not Visited" && patient.status === "Waiting") ||
          (statusFilter === "Pending" && patient.status === "In Progress") ||
          (statusFilter === "Completed" && patient.status === "Completed");

        return matchesSearch && matchesStatus;
      });

      setFilteredPatients(results);
      setIsSearching(false);
    };

    filterPatients();
  }, [patients, debouncedSearchTerm, statusFilter, searchBy]);

  // Status Counts Calculation
  // ✅ This logic is now based on the *original* unfiltered list
  const statusCounts = patients.reduce(
    (acc, patient) => {
      if (patient.status === "Completed") acc.completed++;
      else if (patient.status === "In Progress") acc.inProgress++;
      else if (patient.status === "Waiting") acc.waiting++;
      return acc;
    },
    { completed: 0, inProgress: 0, waiting: 0 }
  );

  // Handlers
  const handleVitalsClick = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setVitalsPatient(patient);
    setShowVitals(true);
  };

  const handleDoctorClick = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    if (patient.status === "Waiting") {
      const patientRef = doc(db, "patients", patient.id);
      setDoc(patientRef, { status: "In Progress" }, { merge: true }).catch(
        (error) => {
          console.error("Failed to update status with setDoc/merge:", error);
        }
      );
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
    await setDoc(
      patientRef,
      {
        status: "Completed",
      },
      { merge: true }
    );
    setShowDoctor(false);
    setDoctorPatient(null);
  };

  // PatientCard component
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
            <p className="text-xs text-[#1a4b7a]">
              {/* Token: {patient.token} • ID: {patient.uhid || "N/A"} */}
              Token: {patient.token}
            </p>
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
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
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
      <PreOPDIntake
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
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-6">
        {/* LEFT SECTION: Title and Status Cards */}
        <div className="flex flex-col space-y-4 w-full lg:w-auto">
          {/* Main Title */}
          <div className="flex items-center space-x-3 mt-4">
            <Users className="w-8 h-8 text-[#012e58]" />
            <div>
              <h1 className="text-3xl font-bold text-[#0B2D4D]">OPD Queue</h1>
              <p className="text-[#1a4b7a]">
                Manage patient queue and appointments
              </p>
            </div>
          </div>

          {/* ✅ START: STATUS CARDS (MOVED HERE) */}
          <div className="flex flex-col md:flex-row gap-3">
            <StatusCard
              label="Waiting"
              count={statusCounts.waiting}
              colorClass="bg-yellow-50 border border-yellow-200"
            />
            <StatusCard
              label="In Progress"
              count={statusCounts.inProgress}
              colorClass="bg-blue-50 border border-blue-200"
            />
            <StatusCard
              label="Completed"
              count={statusCounts.completed}
              colorClass="bg-green-50 border border-green-200"
            />
          </div>
          {/* ✅ END: STATUS CARDS */}
        </div>

        {/* RIGHT SECTION: Search and Filter */}
        <div className="flex flex-col mt-4 lg:mt-0 md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-4 w-full lg:w-auto">
          {/* Status Filter Dropdown */}
          <div className="flex items-center space-x-2 order-1 md:order-1">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a4b7a] focus:border-transparent text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Not Visited">Waiting</option>
              <option value="Pending">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Search Bar Implementation (Selector + Input) */}
          <div className="flex items-center space-x-2 order-2 md:order-2">
            {/* Search Type Dropdown */}
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as SearchField)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a4b7a] focus:border-transparent text-sm"
            >
              <option value="patientName">Patient Name</option>
              <option value="doctorName">Doctor Name</option>
              <option value="token">Token</option>
              <option value="phone">Phone</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full md:w-56">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={getPlaceholderText(searchBy)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4b7a] focus:border-transparent w-full"
              />
              {debouncedSearchTerm.length > 0 && isSearching && (
                <Loader className="w-4 h-4 text-[#012e58] absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Card List */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          {/* Loading / No Results UI */}
          {isSearching && filteredPatients.length === 0 && (
            <div className="text-center p-10 text-gray-500">
              <Loader className="w-6 h-6 mx-auto animate-spin" />
              <p>Searching...</p>
            </div>
          )}

          {!isSearching && filteredPatients.length === 0 && (
            <div className="text-center p-10 text-gray-500">
              {searchTerm.length > 0 ? (
                <span>No patients found matching "{searchTerm}".</span>
              ) : (
                <span>No patients currently in the queue.</span>
              )}
            </div>
          )}

          {/* Patient List */}
          {!isSearching &&
            filteredPatients.length > 0 &&
            filteredPatients.map((patient) => (
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
