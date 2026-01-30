"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, CheckCircle } from "lucide-react";
import { CartItem, Customer } from "./pos-interface";

interface PurchaseSuccessModalProps {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  orderDate: string;
  cartItems: CartItem[];
  customer: Customer | null;
  companySettings: {
    companyName: string;
    logoUrl: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
    gstNumber?: string;
  } | null;
  subtotal: number;
  total: number;
  roundingOff: number;
  paymentMethod: string;
  formatCurrency: (amount: number, options?: { showSymbol?: boolean; showCode?: boolean; precision?: number }) => string;
}

export const PurchaseSuccessModal: React.FC<PurchaseSuccessModalProps> = ({
  open,
  onClose,
  invoiceNumber,
  orderDate,
  cartItems,
  customer,
  companySettings,
  subtotal,
  total,
  roundingOff,
  paymentMethod,
  formatCurrency,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Create proper thermal print HTML structure
    const itemsHtml = cartItems.map(item => {
      const itemTotal = item.price * item.quantity;
      let discountAmount = 0;
      if (item.discount && item.discount > 0) {
        if (item.discountType === "flat") {
          discountAmount = item.discount;
        } else {
          discountAmount = (itemTotal * item.discount) / 100;
        }
      }
      const finalAmount = itemTotal - discountAmount;
      
      // Calculate GST breakdown
      const gstPercentage = item.gstPercentage || 0;
      const priceBeforeGst = finalAmount / (1 + gstPercentage / 100);
      const gstAmount = finalAmount - priceBeforeGst;
      const unitPriceBeforeGst = priceBeforeGst / item.quantity;

      return `
        <div style="margin: 5px 0;">
          <div style="display: grid; grid-template-columns: 2fr 0.5fr 1fr 1.2fr 1fr; gap: 4px; font-size: 11px;">
            <span style="font-weight: bold;">${item.name}</span>
            <span style="text-align: center;">${item.quantity}</span>
            <span style="text-align: right;">${formatCurrency(unitPriceBeforeGst)}</span>
            <span style="text-align: right;">${gstPercentage > 0 ? `${formatCurrency(gstAmount)}(${gstPercentage}%)` : '-'}</span>
            <span style="text-align: right; font-weight: bold;">${formatCurrency(finalAmount)}</span>
          </div>
          ${item.discount && item.discount > 0 ? `
            <div style="font-size: 10px; color: #333; margin-left: 4px;">
              Disc: ${item.discountType === "flat" ? formatCurrency(item.discount) : `${item.discount}%`}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: #fff;
              width: 80mm;
              margin: 0 auto;
              padding: 10px;
            }
            .invoice-header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .invoice-header h1 {
              font-size: 18px;
              font-weight: bold;
              margin: 0 0 5px 0;
            }
            .invoice-header p {
              margin: 2px 0;
              font-size: 11px;
            }
            .invoice-info {
              margin-bottom: 10px;
              font-size: 11px;
            }
            .invoice-info div {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .items-table {
              width: 100%;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 5px 0;
              margin: 10px 0;
            }
            .items-header {
              display: grid;
              grid-template-columns: 2fr 0.5fr 1fr 1.2fr 1fr;
              gap: 4px;
              font-size: 11px;
              font-weight: bold;
              border-bottom: 1px dashed #000;
              padding-bottom: 3px;
              margin-bottom: 5px;
            }
            .totals {
              margin-top: 10px;
              border-top: 1px dashed #000;
              padding-top: 5px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 11px;
            }
            .total-row.grand-total {
              font-size: 14px;
              font-weight: bold;
              border-top: 2px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              padding-top: 10px;
              border-top: 2px dashed #000;
              font-size: 10px;
            }
            .footer p {
              margin: 3px 0;
            }
          </style>
        </head>
        <body>
          <!-- Invoice Header -->
          <div class="invoice-header">
            ${companySettings?.logoUrl ? `
              <div style="position: relative; width: 160px; height: 80px; margin: 0 auto; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <img 
                  src="${companySettings.logoUrl}" 
                  alt="Company Logo" 
                  style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain;" 
                  crossorigin="anonymous"
                  referrerpolicy="no-referrer"
                />
              </div>
            ` : `<h1>${companySettings?.companyName || 'LEATS'}</h1>`}
            ${companySettings?.address ? `<p>${companySettings.address}</p>` : ''}
            ${companySettings?.city || companySettings?.state || companySettings?.zipCode ? `<p>${[companySettings?.city, companySettings?.state, companySettings?.zipCode].filter(Boolean).join(', ')}</p>` : ''}
            ${companySettings?.gstNumber ? `<p>GSTIN: ${companySettings.gstNumber}</p>` : ''}
          </div>

          <!-- Invoice Info -->
          <div class="invoice-info">
            <div style="display: flex; justify-content: space-between; margin: 2px 0;">
              <span>Invoice No:</span>
              <span style="font-weight: bold;">${invoiceNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 2px 0;">
              <span>Date:</span>
              <span>${orderDate}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 2px 0;">
              <span>Time:</span>
              <span>${new Date().toLocaleTimeString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 2px 0;">
              <span>Customer:</span>
              <span>${customer?.name || "Walk-in Customer"}</span>
            </div>
            ${customer?.phone ? `
              <div style="display: flex; justify-content: space-between; margin: 2px 0;">
                <span>Phone:</span>
                <span>${customer.phone}</span>
              </div>
            ` : ''}
          </div>

          <!-- Items Table -->
          <div class="items-table">
            <div class="items-header">
              <span>Item</span>
              <span style="text-align: center;">Qty</span>
              <span style="text-align: right;">Price</span>
              <span style="text-align: right;">GST</span>
              <span style="text-align: right;">Total</span>
            </div>
            ${itemsHtml}
          </div>

          <!-- Totals -->
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            ${subtotal !== total ? `
              <div class="total-row" style="color: #16a34a;">
                <span>Discount:</span>
                <span>-${formatCurrency(subtotal - total)}</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span>Total:</span>
              <span>${formatCurrency(total)}</span>
            </div>
            ${roundingOff !== 0 ? `
              <div class="total-row">
                <span>Rounding Off:</span>
                <span style="color: ${roundingOff >= 0 ? '#16a34a' : '#dc2626'};">
                  ${roundingOff >= 0 ? '+' : ''}${formatCurrency(Math.abs(roundingOff))}
                </span>
              </div>
            ` : ''}
            <div class="total-row grand-total">
              <span>FINAL TOTAL:</span>
              <span>${formatCurrency(total + roundingOff)}</span>
            </div>
          </div>

          <!-- Payment Method -->
          <div style="margin-top: 10px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin: 2px 0;">
              <span>Payment:</span>
              <span style="font-weight: bold; text-transform: uppercase;">${paymentMethod}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="font-weight: bold; margin: 3px 0;">Thank You, Please Come Again!</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownload = async () => {
    try {
      // Generate professional invoice HTML
      const invoiceHTML = generateProfessionalInvoiceHTML();
      
      // Create a temporary hidden div with the professional invoice design
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '0';
      tempDiv.style.left = '0';
      tempDiv.style.zIndex = '-9999';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.width = '210mm';
      tempDiv.style.height = 'auto';
      
      tempDiv.innerHTML = invoiceHTML;
      document.body.appendChild(tempDiv);

      // Ensure logo is CORS-friendly
      const logoImg = tempDiv.querySelector('img') as HTMLImageElement;
      if (logoImg && companySettings?.logoUrl) {
        logoImg.crossOrigin = "anonymous";
        logoImg.referrerPolicy = "no-referrer";
        logoImg.src = companySettings.logoUrl;
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate PDF
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(tempDiv, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
      });

      document.body.removeChild(tempDiv);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Handle multi-page PDFs properly
      if (imgHeight > pdfHeight) {
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        position = pdfHeight;

        // Add additional pages if needed
        while (heightLeft > 0) {
          pdf.addPage();
          position = heightLeft - imgHeight;
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      } else {
        // Single page - just add the image
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`Invoice-${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateProfessionalInvoiceHTML = (): string => {
    const formatCurrencyForHTML = (amount: number | undefined) => {
      if (amount === undefined) return '₹0.00';
      return `₹${(amount).toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      } catch {
        return dateString;
      }
    };

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; padding: 0; margin: 0;">
        <div style="height: 8px; background-color: #e22a2a; width: 100%;"></div>
        
        <div style="background-color: #e8e4d9; padding: 32px; border-bottom: 1px solid #d4cdb8;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
            <div>
              ${companySettings?.logoUrl ? `
                <div style="width: 160px; height: 80px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                  <img 
                    src="${companySettings.logoUrl}" 
                    alt="Company Logo" 
                    style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain;" 
                  />
                </div>
              ` : `
                <div style="width: 160px; height: 80px; background-color: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                  <div style="color: #e22a2a; font-weight: bold; font-size: 18px;">${companySettings?.companyName || 'COMPANY'}</div>
                </div>
              `}
            </div>
            
            <div style="text-align: right;">
              <h1 style="font-size: 48px; font-weight: bold; color: black; letter-spacing: 8px; margin: 0 0 24px 0;">TAX INVOICE</h1>
              <div style="background: white; border: 1px solid #a89b7e; padding: 16px; min-width: 220px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 12px; color: #64748b;">Invoice Number</span>
                  <span style="font-size: 12px; font-weight: bold; color: black;">${invoiceNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 12px; color: #64748b;">Invoice Date</span>
                  <span style="font-size: 12px; color: black;">${formatDate(orderDate)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-size: 12px; color: #64748b;">Time</span>
                  <span style="font-size: 12px; color: black;">${new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px;">
            <div>
              <p style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">BILL FROM</p>
              <div>
                <p style="font-weight: bold; color: black; font-size: 16px; margin-bottom: 8px;">${companySettings?.companyName || 'Company Name'}</p>
                ${companySettings?.address ? `<p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 4px;">${companySettings.address}</p>` : ''}
                ${companySettings?.city || companySettings?.state || companySettings?.zipCode ? `<p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 4px;">${[companySettings?.city, companySettings?.state, companySettings?.zipCode].filter(Boolean).join(', ')}</p>` : ''}
                ${companySettings?.country ? `<p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 4px;">${companySettings.country}</p>` : ''}
                ${companySettings?.gstNumber ? `<p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 4px;">GSTIN: ${companySettings.gstNumber}</p>` : ''}
              </div>
            </div>
            
            <div>
              <p style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">BILL TO</p>
              <div>
                <p style="font-weight: bold; color: black; font-size: 16px; margin-bottom: 8px;">${customer?.name || 'Walk-in Customer'}</p>
                ${customer?.phone ? `<p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 4px;">Phone: ${customer.phone}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
        
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <thead>
              <tr style="border-bottom: 2px solid #1f2937;">
                <th style="text-align: left; padding: 12px 8px; font-size: 12px; font-weight: bold; color: #1f2937; text-transform: uppercase; letter-spacing: 1px;">#</th>
                <th style="text-align: left; padding: 12px 8px; font-size: 12px; font-weight: bold; color: #1f2937; text-transform: uppercase; letter-spacing: 1px;">Item Description</th>
                <th style="text-align: center; padding: 12px 8px; font-size: 12px; font-weight: bold; color: #1f2937; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                <th style="text-align: right; padding: 12px 8px; font-size: 12px; font-weight: bold; color: #1f2937; text-transform: uppercase; letter-spacing: 1px;">Rate</th>
                <th style="text-align: center; padding: 12px 8px; font-size: 12px; font-weight: bold; color: #1f2937; text-transform: uppercase; letter-spacing: 1px;">GST%</th>
                <th style="text-align: right; padding: 12px 8px; font-size: 12px; font-weight: bold; color: #1f2937; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${cartItems.map((item, index) => {
                const itemTotal = item.price * item.quantity;
                let discountAmount = 0;
                if (item.discount && item.discount > 0) {
                  if (item.discountType === 'flat') {
                    discountAmount = item.discount;
                  } else {
                    discountAmount = (itemTotal * item.discount) / 100;
                  }
                }
                const finalAmount = itemTotal - discountAmount;
                
                // Calculate GST breakdown
                const gstPercentage = item.gstPercentage || 0;
                const priceBeforeGst = finalAmount / (1 + gstPercentage / 100);
                const gstAmount = finalAmount - priceBeforeGst;
                const unitPriceBeforeGst = priceBeforeGst / item.quantity;
                
                return `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 8px; font-size: 12px; color: #1f2937;">${index + 1}</td>
                    <td style="padding: 12px 8px; font-size: 12px; color: #1f2937;">${item.name}</td>
                    <td style="padding: 12px 8px; font-size: 12px; color: #1f2937; text-align: center;">${item.quantity}</td>
                    <td style="padding: 12px 8px; font-size: 12px; color: #1f2937; text-align: right;">${formatCurrencyForHTML(unitPriceBeforeGst)}</td>
                    <td style="padding: 12px 8px; font-size: 12px; color: #1f2937; text-align: center;">${gstPercentage}%</td>
                    <td style="padding: 12px 8px; font-size: 12px; color: #1f2937; text-align: right;">${formatCurrencyForHTML(finalAmount)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
            <div style="width: 320px;">
              <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                <span style="color: #64748b;">Subtotal</span>
                <span style="font-weight: 600; color: #1f2937;">${formatCurrencyForHTML(subtotal)}</span>
              </div>
              ${(subtotal - total) > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                  <span style="color: #64748b;">Discount</span>
                  <span style="font-weight: 600; color: #dc2626;">-${formatCurrencyForHTML(subtotal - total)}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px;">
                <span style="color: #64748b;">Subtotal after Discount</span>
                <span style="font-weight: 600; color: #1f2937;">${formatCurrencyForHTML(total)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 2px solid #1f2937; margin-top: 8px;">
                <span style="font-weight: bold; font-size: 18px; color: #e22a2a;">TOTAL</span>
                <span style="font-weight: bold; font-size: 24px; color: #e22a2a;">${formatCurrencyForHTML(total + roundingOff)}</span>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 32px; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 14px; color: #64748b;">Payment Method:</span>
              <span style="font-size: 14px; font-weight: 600; color: #1f2937; text-transform: uppercase;">${paymentMethod}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 14px; color: #64748b;">Payment Status:</span>
              <span style="font-size: 14px; font-weight: 600; text-transform: uppercase; color: #16a34a;">PAID</span>
            </div>
          </div>
          
          <div style="margin-bottom: 40px;">
            <div style="border-top: 2px solid #1f2937; width: 250px; padding-top: 8px;">
              <p style="font-weight: bold; color: #1f2937; margin: 0;">Authorized Signatory</p>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Account Manager</p>
            </div>
          </div>
          
          <div style="border-top: 4px solid #e22a2a; padding-top: 12px; text-align: center;">
            <p style="font-size: 12px; font-weight: 600; color: #64748b; letter-spacing: 1px; margin: 0;">
              TAX INVOICE • Invoice Number: ${invoiceNumber}
            </p>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-6 h-6" />
            Purchase Completed Successfully
          </DialogTitle>
        </DialogHeader>

        {/* Thermal Print Preview */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <p className="text-xs text-gray-600 text-center">Thermal Print Preview (80mm)</p>
          </div>
          <div className="p-4 max-h-[500px] overflow-y-auto" style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", lineHeight: "1.4" }}>
            <div ref={printRef}>
            {/* Invoice Header */}
            <div className="text-center border-b-2 border-dashed border-gray-800 pb-3 mb-3">
              {companySettings?.logoUrl ? (
                <div className="relative w-40 h-20 flex items-center justify-center overflow-hidden mx-auto">
                  <Image 
                    src={companySettings.logoUrl} 
                    alt="Company Logo" 
                    fill
                    sizes="160px"
                    className="object-contain"
                    priority={true}
                    quality={90}
                  />
                </div>
              ) : (
                <h1 className="text-lg font-bold mb-1">{companySettings?.companyName || 'LEATS'}</h1>
              )}
              {companySettings?.address && <p className="text-xs leading-tight">{companySettings.address}</p>}
              {(companySettings?.city || companySettings?.state || companySettings?.zipCode) && (
                <p className="text-xs leading-tight">
                  {[companySettings?.city, companySettings?.state, companySettings?.zipCode].filter(Boolean).join(', ')}
                </p>
              )}
              {companySettings?.gstNumber && <p className="text-xs leading-tight">GSTIN: {companySettings.gstNumber}</p>}
            </div>

            {/* Invoice Info */}
            <div className="mb-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Invoice No:</span>
                <span className="font-semibold">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{customer?.name || "Walk-in Customer"}</span>
              </div>
              {customer?.phone && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border-t border-b border-dashed border-gray-800 py-2 my-3">
              <div className="grid grid-cols-[2fr_0.5fr_1fr_1.2fr_1fr] gap-1 text-xs font-bold border-b border-gray-800 pb-1 mb-2">
                <span className="text-left">Item</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Price</span>
                <span className="text-right">GST</span>
                <span className="text-right">Total</span>
              </div>
              {cartItems.map((item, index) => {
                const itemTotal = item.price * item.quantity;
                let discountAmount = 0;
                if (item.discount && item.discount > 0) {
                  if (item.discountType === "flat") {
                    discountAmount = item.discount;
                  } else {
                    discountAmount = (itemTotal * item.discount) / 100;
                  }
                }
                const finalAmount = itemTotal - discountAmount;
                
                // Calculate GST breakdown
                const gstPercentage = item.gstPercentage || 0;
                const priceBeforeGst = finalAmount / (1 + gstPercentage / 100);
                const gstAmount = finalAmount - priceBeforeGst;
                const unitPriceBeforeGst = priceBeforeGst / item.quantity;
                
                return (
                  <div key={index} className="mb-2">
                    <div className="grid grid-cols-[2fr_0.5fr_1fr_1.2fr_1fr] gap-1 text-xs">
                      <span className="font-semibold text-left">{item.name}</span>
                      <span className="text-center">{item.quantity}</span>
                      <span className="text-right">{formatCurrency(unitPriceBeforeGst)}</span>
                      <span className="text-right">{gstPercentage > 0 ? `${formatCurrency(gstAmount)}(${gstPercentage}%)` : '-'}</span>
                      <span className="text-right font-semibold">{formatCurrency(finalAmount)}</span>
                    </div>
                    {item.discount && item.discount > 0 && (
                      <div className="text-xs text-gray-600 ml-1">
                        Disc: {item.discountType === "flat" ? formatCurrency(item.discount) : `${item.discount}%`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {subtotal !== total && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(subtotal - total)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {roundingOff !== 0 && (
                <div className="flex justify-between text-xs">
                  <span>Rounding Off:</span>
                  <span className={roundingOff >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {roundingOff >= 0 ? '+' : ''}{formatCurrency(Math.abs(roundingOff))}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t-2 border-gray-800 pt-2 mt-2">
                <span>FINAL TOTAL:</span>
                <span>{formatCurrency(total + roundingOff)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-3 text-xs">
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="font-bold uppercase">{paymentMethod}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 pt-3 border-t-2 border-dashed border-gray-800">
              <p className="text-xs font-bold mb-1">Thank You, Please Come Again!</p>
            </div>
          </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handlePrint}
            className="flex-1"
            variant="default"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
          <Button
            onClick={handleDownload}
            className="flex-1"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full mt-2"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};
