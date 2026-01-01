import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { AgencyDetails } from '../types';

export const modifyPdf = async (fileBuffer: ArrayBuffer, details: AgencyDetails): Promise<Uint8Array> => {
  // Load the existing PDF
  const pdfDoc = await PDFDocument.load(fileBuffer);
  
  // Embed the Helvetica font (Standard for travel docs)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Get the first page
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  
  // Dimensions of the page
  const { height, width } = firstPage.getSize();

  // Convert pixels → points
  const PIXEL_TO_PT = 0.75;

  // Final values
  const BOX_WIDTH = 280 * PIXEL_TO_PT;   // 210
  const BOX_HEIGHT = 112 * PIXEL_TO_PT;   // 63
  const FROM_TOP = 143 * PIXEL_TO_PT;    // 80.25
  const FROM_RIGHT = 37 * PIXEL_TO_PT;   // 21.75

  // Now calculate correct positions:
  const BOX_X = width - BOX_WIDTH - FROM_RIGHT;    // from right
  const BOX_Y = height - BOX_HEIGHT - FROM_TOP;    // from top

  // 1. Draw a white rectangle to "erase" the old text
  // We use pure white (rgb 1,1,1). This blends with the paper.
  firstPage.drawRectangle({
    x: BOX_X,
    y: BOX_Y,
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    color: rgb(180/255, 187/255, 188/255), // #B4BBBC
    borderColor: undefined,
    borderWidth: 0,
  });

  // --- MASK TICKETING WARNING ---
  // "Please ticket before..." appears below the contact info.
  if (details.hideTicketingWarning) {
     const WARNING_MASK_Y = BOX_Y - 50; // Area immediately below agency info block
     const WARNING_MASK_HEIGHT = 50; 
     
// 1. Draw rectangle to erase old text AND add background #B4BBBC
firstPage.drawRectangle({
  x: BOX_X,
  y: BOX_Y,
  width: BOX_WIDTH,
  height: BOX_HEIGHT,
  color: rgb(180/255, 187/255, 188/255), // <-- NEW COLOR #B4BBBC
  borderColor: undefined,
  borderWidth: 0,
});
  }

  // 2. Draw the new text
  // Text Styling
  const TEXT_X = BOX_X; 
  // Start writing near the top of our masked box
  const START_Y = BOX_Y + BOX_HEIGHT - 12; 
  const LINE_HEIGHT = 11;
  const FONT_SIZE = 9;
  
  // Deep Navy Blue (Standard Amadeus/CMT color) #1e3a8a
  const BLUE_COLOR = rgb(30/255, 58/255, 138/255); 
  
  // Link Blue #1d4ed8
  const LINK_COLOR = rgb(29/255, 78/255, 216/255); 

  let currentY = START_Y;

  // Company Name (Bold)
  firstPage.drawText(details.companyName.toUpperCase(), {
    x: TEXT_X,
    y: currentY,
    size: FONT_SIZE + 1, // Slightly larger for header
    font: fontBold,
    color: BLUE_COLOR,
  });
  currentY -= (LINE_HEIGHT + 2);

  // Address Line 1
  if (details.addressLine1) {
    firstPage.drawText(details.addressLine1.toUpperCase(), {
      x: TEXT_X,
      y: currentY,
      size: FONT_SIZE,
      font: fontRegular,
      color: BLUE_COLOR,
    });
    currentY -= LINE_HEIGHT;
  }

  // Address Line 2
  if (details.addressLine2) {
    firstPage.drawText(details.addressLine2.toUpperCase(), {
      x: TEXT_X,
      y: currentY,
      size: FONT_SIZE,
      font: fontRegular,
      color: BLUE_COLOR,
    });
    currentY -= LINE_HEIGHT;
  }

  // Address Line 3 (New)
  if (details.addressLine3) {
    firstPage.drawText(details.addressLine3.toUpperCase(), {
      x: TEXT_X,
      y: currentY,
      size: FONT_SIZE,
      font: fontRegular,
      color: BLUE_COLOR,
    });
    currentY -= LINE_HEIGHT;
  }

  // City/Country
  if (details.cityCountry) {
    firstPage.drawText(details.cityCountry.toUpperCase(), {
      x: TEXT_X,
      y: currentY,
      size: FONT_SIZE,
      font: fontRegular,
      color: BLUE_COLOR,
    });
    currentY -= (LINE_HEIGHT + 4); // Extra spacing before contact
  }

  // EXTRA spacing before phone (optional, looks cleaner)
  currentY -= 6;
  // Phone
  if (details.phone) {
    firstPage.drawText(details.phone, {
      x: TEXT_X,
      y: currentY,
      size: FONT_SIZE,
      font: fontRegular,
      color: BLUE_COLOR,
    });
    currentY -= (LINE_HEIGHT + 3);
  }



  // Email (Lowercase, Link color)
  if (details.email) {
     firstPage.drawText(details.email.toLowerCase(), {
      x: TEXT_X,
      y: currentY,
      size: FONT_SIZE,
      font: fontRegular,
      color: LINK_COLOR,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};