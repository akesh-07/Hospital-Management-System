import React, { useState } from "react";
import {
  Package,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Info,
  Edit,
  Trash2,
} from "lucide-react";
import { SectionHeader } from "../ui/FormComponents";
import { PackageItem } from "./ManagePackageForm";

interface ConsultationPackagesProps {
  packages: PackageItem[];
  value: string;
  onChange: (packageName: string) => void;
  disabled: boolean;
  onAddClick: () => void;
  onEditClick: (pkg: PackageItem) => void;
  onRemoveClick: (id: string) => void;
}

export const ConsultationPackagesSection: React.FC<
  ConsultationPackagesProps
> = ({
  packages,
  value,
  onChange,
  disabled,
  onAddClick,
  onEditClick,
  onRemoveClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Logic: Show top 3, or all if "See More" is clicked
  const displayPackages = showAll ? packages : packages.slice(0, 3);
  const hasMore = packages.length > 3;

  const selectedPackage = packages.find((p) => p.name === value);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
      <div className="flex items-center justify-between mb-3">
        <SectionHeader icon={Package} title="Consultation Package" />
        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center space-x-1.5 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
          disabled={disabled}
        >
          <Plus className="w-3 h-3" />
          <span>New</span>
        </button>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg bg-white text-left transition-all ${
            isOpen
              ? "border-[#012e58] ring-1 ring-[#012e58]"
              : "border-gray-300"
          } ${
            disabled
              ? "bg-gray-50 cursor-not-allowed"
              : "hover:border-[#012e58]"
          }`}
        >
          <span
            className={`text-sm ${
              value ? "text-[#0B2D4D] font-medium" : "text-gray-500"
            }`}
          >
            {value ? value : "Select Consultation Package"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isOpen && (
          // ✅ Changed: Use 'bottom-full' and 'mb-1' to display ABOVE the input
          <div className="absolute z-20 w-full bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto custom-scrollbar">
            {packages.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No packages available. Create one.
              </div>
            ) : (
              <>
                {displayPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      onChange(pkg.name);
                      setIsOpen(false);
                    }}
                    className={`p-3 cursor-pointer border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors group ${
                      value === pkg.name ? "bg-[#e0f7fa]" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 w-full pr-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="font-semibold text-[#0B2D4D] text-sm">
                              {pkg.name}
                            </span>
                            <div className="group/info relative ml-2">
                              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/info:block w-48 bg-gray-800 text-white text-xs rounded px-2 py-1 z-30 shadow-lg">
                                {pkg.description}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </div>
                          </div>
                          {value === pkg.name && (
                            <CheckCircle className="w-4 h-4 text-[#012e58]" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium">
                          ₹ {pkg.price}
                        </p>

                        {pkg.customFields.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {pkg.customFields.map((cf) => (
                              <span
                                key={cf.id}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border border-gray-200"
                              >
                                {cf.label}: {cf.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditClick(pkg);
                            setIsOpen(false);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveClick(pkg.id);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded-full"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {hasMore && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAll(!showAll);
                    }}
                    className="w-full p-2 text-xs text-center text-[#012e58] font-medium bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {showAll
                      ? "Show Less"
                      : `See More (${packages.length - 3} more)`}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected Item Summary (Visual feedback when collapsed) */}
      {value && selectedPackage && !isOpen && (
        <div className="mt-2 p-3 bg-[#F8F9FA] rounded-lg border border-gray-100 text-xs space-y-1 animate-fade-in">
          <div className="flex justify-between">
            <span className="text-gray-500">Description:</span>
            <span className="font-medium text-gray-800">
              {selectedPackage.description}
            </span>
          </div>
          {selectedPackage.customFields.map((cf) => (
            <div
              key={cf.id}
              className="flex justify-between border-t border-gray-200 pt-1 mt-1"
            >
              <span className="text-gray-500">{cf.label}:</span>
              <span className="font-medium text-gray-800">{cf.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
