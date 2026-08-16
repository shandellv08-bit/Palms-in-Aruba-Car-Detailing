export const CHECKLIST_TEMPLATE: { section: string; label: string }[] = [
  // BEFORE_SERVICE
  { section: "BEFORE_SERVICE", label: "Inspect vehicle" },
  { section: "BEFORE_SERVICE", label: "Photograph vehicle" },
  { section: "BEFORE_SERVICE", label: "Document existing damage" },
  { section: "BEFORE_SERVICE", label: "Confirm service" },
  { section: "BEFORE_SERVICE", label: "Confirm price" },
  { section: "BEFORE_SERVICE", label: "Check special requests" },
  { section: "BEFORE_SERVICE", label: "Check personal belongings" },
  // EXTERIOR
  { section: "EXTERIOR", label: "Pre-rinse" },
  { section: "EXTERIOR", label: "Foam / pre-wash" },
  { section: "EXTERIOR", label: "Wheels" },
  { section: "EXTERIOR", label: "Tires" },
  { section: "EXTERIOR", label: "Hand wash" },
  { section: "EXTERIOR", label: "Rinse" },
  { section: "EXTERIOR", label: "Dry" },
  { section: "EXTERIOR", label: "Glass" },
  { section: "EXTERIOR", label: "Tire dressing" },
  { section: "EXTERIOR", label: "Protection if included" },
  // INTERIOR
  { section: "INTERIOR", label: "Remove trash" },
  { section: "INTERIOR", label: "Remove mats" },
  { section: "INTERIOR", label: "Vacuum" },
  { section: "INTERIOR", label: "Dashboard" },
  { section: "INTERIOR", label: "Doors" },
  { section: "INTERIOR", label: "Plastics" },
  { section: "INTERIOR", label: "Seats" },
  { section: "INTERIOR", label: "Carpets" },
  { section: "INTERIOR", label: "Stains" },
  { section: "INTERIOR", label: "Glass" },
  { section: "INTERIOR", label: "Final vacuum" },
  // FINAL_INSPECTION
  { section: "FINAL_INSPECTION", label: "Driver side" },
  { section: "FINAL_INSPECTION", label: "Passenger side" },
  { section: "FINAL_INSPECTION", label: "Rear" },
  { section: "FINAL_INSPECTION", label: "Trunk" },
  { section: "FINAL_INSPECTION", label: "Exterior" },
  { section: "FINAL_INSPECTION", label: "Wheels" },
  { section: "FINAL_INSPECTION", label: "Glass" },
  { section: "FINAL_INSPECTION", label: "Final photos" },
];

export const CHECKLIST_SECTION_LABELS: Record<string, string> = {
  BEFORE_SERVICE: "Before Service",
  EXTERIOR: "Exterior",
  INTERIOR: "Interior",
  FINAL_INSPECTION: "Final Inspection",
};
