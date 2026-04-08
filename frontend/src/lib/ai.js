// Mock AI Triage Assistant for Hackathon Demo

export const verifyIncidentReport = async (file, reportData) => {
  console.log("Simulating AI Triage Analysis for:", file.name, reportData);

  // Simulate network processing delay for the demo...
  await new Promise(res => setTimeout(res, 2500));

  const desc = (reportData.description || "").toLowerCase();

  // If the user types "fake" or "test spoof" we simulate an AI Rejection
  if (desc.includes("fake") || desc.includes("spoof") || desc.includes("not real")) {
    return {
      related: false,
      related_confidence: 0.15,
      originality: "manipulated",
      originality_confidence: 0.95,
      recommended_action: "dismiss",
      human_readable_summary: "Forensic analysis detected aggressive compression artifacts and inconsistent lighting indicative of manipulation. Additionally, no visual match for the described civic issue could be found."
    };
  }

  // If the user types "review" we simulate a borderline case
  if (desc.includes("review") || desc.includes("unsure")) {
    return {
      related: true,
      related_confidence: 0.65,
      originality: "reused",
      originality_confidence: 0.82,
      recommended_action: "create_review_ticket",
      human_readable_summary: "The image contains elements related to the description, but reverse image search flagged visually identical structural damage reported in a different jurisdiction 2 years ago. Priority review requested."
    };
  }

  // Default: Authentic submission
  return {
    related: true,
    related_confidence: 0.92,
    originality: "authentic_original",
    originality_confidence: 0.88,
    recommended_action: "auto_create_assign",
    human_readable_summary: "Multimodal and spatial checks confirm the image context strongly matches the reported claim. Camera sensor noise patterns confirm authenticity. Automatically assigned to the on-call civil engineer."
  };
};
