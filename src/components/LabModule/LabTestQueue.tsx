import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import {
  FlaskConical, // Lab icon
  Clock,
  Phone,
  UserCheck, // Icon for doctor assigned
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  where,
  Timestamp, // Imported Timestamp for correct typing/handling
} from "firebase/firestore";
import { db } from "../../firebase";
import { Patient } from "../../types"; 

// --- Type Definitions for Lab Request Data ---

// Define the structure of a Lab Request document in Firestore
// We define requestedAt as Date to align with the converted object
interface LabRequest {
  id: string;
  patId: string;
  tests: string[]; 
  assignDoctorId: string; 
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  requestedAt: Date; // Changed to Date for the component state
}

// Define the combined data structure for the Queue display
interface LabQueueItem extends LabRequest {
  fullName: string;
  contactNumber: string;
}

// --- Utility Functions ---

const getStatusColor = (status: LabRequest["status"]) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};


// --- LabTestQueue Component ---

const LabTestQueue: React.FC = () => {
  const [queueItems, setQueueItems] = useState<LabQueueItem[]>([]);
  const [rawRequests, setRawRequests] = useState<LabRequest[]>([]);
  const [allPatients, setAllPatients] = useState<{ [key: string]: Patient }>({});
  const [openRequestId, setOpenRequestId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const currentUserRole = Cookies.get("userRole");

  // 1. Fetch all Lab Requests (FIXED: Converting Timestamp to Date)
  useEffect(() => {
    const requestsQuery = query(
      collection(db, "labRequests"),
      orderBy("requestedAt", "asc")
    );

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const requestsData = snapshot.docs.map(
          (doc) => {
            const data = doc.data();
            
            // 💡 FIX APPLIED HERE: Convert Firestore Timestamp to JavaScript Date
            const requestedAt = (data.requestedAt instanceof Timestamp) 
                                ? data.requestedAt.toDate() 
                                : new Date(); // Fallback if conversion fails
            
            return { 
                id: doc.id, 
                ...data,
                requestedAt: requestedAt
            } as LabRequest;
          }
        );
        setRawRequests(requestsData);
      },
      (error) => {
        console.error("Firebase Lab Requests query error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Fetch all Patient names/contacts (Needed to cross-reference patId)
  useEffect(() => {
    const patientsQuery = query(collection(db, "patients"));

    const unsubscribe = onSnapshot(
      patientsQuery,
      (snapshot) => {
        const patientsMap: { [key: string]: Patient } = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as Patient;
          // Use doc.id for the key, as patId in labRequests references the document id
          patientsMap[doc.id] = data; 
        });
        setAllPatients(patientsMap);
      },
      (error) => {
        console.error("Firebase Patients query error:", error);
      }
    );

    return () => unsubscribe();
  }, []);


  // 3. Combine Requests and Patient Data (Sorting now works as requestedAt is a Date)
  useEffect(() => {
    const combinedData: LabQueueItem[] = rawRequests.map(req => {
      const patient = allPatients[req.patId] || { fullName: 'Unknown Patient', contactNumber: 'N/A' };
      return {
        ...req,
        fullName: patient.fullName,
        contactNumber: patient.contactNumber,
      };
    }).sort((a, b) => {
        // Line 131 (approximate) - This line now works because requestedAt is a Date object
        return a.requestedAt.getTime() - b.requestedAt.getTime(); 
    }); 

    setQueueItems(combinedData);
  }, [rawRequests, allPatients]);


  // --- Handlers for Status Updates ---
  const handleStartTest = async (requestId: string) => {
    const requestRef = doc(db, "labRequests", requestId);
    await updateDoc(requestRef, {
      status: "In Progress",
    });
  };

  const handleCompleteTest = async (requestId: string) => {
    const requestRef = doc(db, "labRequests", requestId);
    await updateDoc(requestRef, {
      status: "Completed",
      // Add field for lab technician/user who completed it
      completedBy: Cookies.get("userName"), 
      completedAt: new Date(),
    });
  };

  const handleToggle = (id: string) => {
    setOpenRequestId(openRequestId === id ? null : id);
  };

  // --- Filtering Logic ---
  const filteredItems = queueItems.filter((item) => {
    const matchesSearch =
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patId.toLowerCase().includes(searchTerm.toLowerCase()); 
      
    const matchesStatus =
      statusFilter === "all" ||
      item.status.toLowerCase().replace(/\s+/g, '') === statusFilter.toLowerCase().replace(/\s+/g, '') ||
      (statusFilter === "pending" && item.status === "Pending") ||
      (statusFilter === "inprogress" && item.status === "In Progress") ||
      (statusFilter === "completed" && item.status === "Completed");

    return matchesSearch && matchesStatus;
  });

  // --- Component for an individual Lab Request Card ---
  const LabRequestCard: React.FC<{
    item: LabQueueItem;
    isOpen: boolean;
    onToggle: () => void;
  }> = ({ item, isOpen, onToggle }) => (
    <div
      className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer ${
        isOpen ? "ring-2 ring-[#7095b9]" : "border-gray-200"
      }`}
      onClick={onToggle}
    >
      <div className="flex justify-between gap-6 text-sm items-center">
        <div className="flex items-center space-x-3 min-w-[200px]">
          <div className="w-10 h-10 bg-[#fce4ec] rounded-full flex items-center justify-center">
            <span className="text-[#a1005a] font-medium text-sm">
              {item.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-[#0B2D4D]">{item.fullName}</h3>
            <p className="text-xs text-[#1a4b7a]">Patient ID: {item.patId}</p>
          </div>
        </div>
        
        <div className="flex flex-col min-w-[150px]">
          <span className="text-xs font-medium text-gray-500">Request Time</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-[#1a4b7a] font-medium">
              {item.requestedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex flex-col min-w-[150px]">
          <span className="text-xs font-medium text-gray-500">Ordering Doctor</span>
          <div className="flex items-center space-x-1">
            <UserCheck className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-[#1a4b7a] font-medium">
              Dr. {item.assignDoctorId}
            </span>
          </div>
        </div>
        
        <div className="min-w-[100px]">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
              item.status
            )}`}
          >
            {item.status || "Pending"}
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
      
      {/* --- Expanded Details --- */}
      <div
        className={`grid grid-cols-1 gap-4 text-sm overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-96 opacity-100 pt-4 mt-3 border-t border-gray-200"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="col-span-1">
            <span className="font-medium text-[#0B2D4D]">Requested Tests:</span>
            <div className="flex flex-wrap gap-2 mt-1">
                {item.tests.map((test, index) => (
                    <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full border border-purple-300"
                    >
                        {test}
                    </span>
                ))}
            </div>
        </div>
        
        <div className="col-span-1 flex gap-3 pt-2 border-t border-gray-100">
            {item.status === "Pending" && (
                <button
                    onClick={(e) => { e.stopPropagation(); handleStartTest(item.id); }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                    Start Processing
                </button>
            )}
            
            {item.status === "In Progress" && (
                <button
                    onClick={(e) => { e.stopPropagation(); handleCompleteTest(item.id); }}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                    Mark as Completed
                </button>
            )}

            {/* Optional: Add button to view patient's contact/history for context */}
            <div className="flex items-center space-x-2 text-gray-500">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{item.contactNumber}</span>
            </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FlaskConical className="w-8 h-8 text-[#012e58]" />
          <div>
            <h1 className="text-3xl font-bold text-[#0B2D4D]">Lab Queue</h1>
            <p className="text-[#1a4b7a]">
              Manage incoming lab test requests and track processing status.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Patient Name/ID"
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
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <p className="text-gray-500 text-center py-10 bg-white rounded-xl border border-gray-200">
                No lab requests match the current filters.
            </p>
          ) : (
            filteredItems.map((item) => (
              <LabRequestCard
                key={item.id}
                item={item}
                isOpen={openRequestId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LabTestQueue;