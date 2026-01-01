export interface AgencyDetails {
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  cityCountry: string;
  phone: string;
  email: string;
  hideTicketingWarning: boolean;
}

export interface PdfProcessingState {
  isProcessing: boolean;
  error: string | null;
  success: boolean;
  downloadUrl: string | null;
}