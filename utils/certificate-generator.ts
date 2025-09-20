import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import Certificate from '@/models/Certificate';

export interface CertificateData {
  fullName: string;
  serviceType: string;
  certificateNumber: string;
  issuedDate: Date;
  expiryDate: Date;
  city: string;
  verificationScore: number;
  certificateHash: string;
  qrCodeData: string;
  providerId: number;
  verifiedBy: string;
  applicationId?: number;
  phone?: string;
  email?: string;
  
  vendorType?: string;
  photo?: string;        
  gstNumber?: string;    
  
  transactionHash?: string;
  blockchainTxUrl?: string;
  blockchainVerifyUrl?: string;
}

export class PDFGenerationService {
  private getCertificateColor(serviceType: string): string {
    const type = serviceType.toLowerCase();
    if (type.includes('guide') || type.includes('tourist')) return 'from-blue-600 to-blue-800';
    if (type.includes('transport')) return 'from-green-600 to-green-800';
    if (type.includes('accommodation') || type.includes('hotel')) return 'from-purple-600 to-purple-800';
    if (type.includes('food') || type.includes('restaurant')) return 'from-orange-600 to-orange-800';
    if (type.includes('activity')) return 'from-red-600 to-red-800';
    return 'from-gray-600 to-gray-800';
  }

  private getCertificateIcon(serviceType: string): string {
    const type = serviceType.toLowerCase();
    if (type.includes('guide') || type.includes('tourist')) return '👤';
    if (type.includes('transport')) return '🚗';
    if (type.includes('accommodation') || type.includes('hotel')) return '🏠';
    if (type.includes('food') || type.includes('restaurant')) return '🍽️';
    if (type.includes('activity')) return '🎯';
    return '🎫';
  }

  private async generateQRCode(data: string): Promise<string> {
    try {
      console.log("Data present here is ", data)
      return await QRCode.toDataURL(data, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return '';
    }
  }

  private getVendorSpecificInfo(data: CertificateData): string {
    const vendorType = data.vendorType?.toUpperCase();
    
    if (vendorType === 'GUIDE' && data.photo) {
      return `
        <div class="detail-item">
          <strong>Photo:</strong> 
          <img src="https://gateway.pinata.cloud/ipfs/${data.photo}" 
               alt="Provider Photo" 
               style="width: 100px; height:100px; border-radius: 50%; object-fit: cover; margin-left: 8px; vertical-align: middle;" />
        </div>`;
    } else if (vendorType === 'TRANSPORT' && data.gstNumber) {
      return `
        <div class="detail-item">
          <strong>License Number:</strong> ${data.gstNumber}
        </div>`;
    } else if (vendorType && vendorType !== 'GUIDE' && vendorType !== 'TRANSPORT' && data.gstNumber) {
      return `
        <div class="detail-item">
          <strong>GST Number:</strong> ${data.gstNumber}
        </div>`;
    }
    
    return '';
  }

  private generateCertificateHTML(data: CertificateData, qrCodeDataURL: string): string {
    const gradientColor = this.getCertificateColor(data.serviceType);
    const icon = this.getCertificateIcon(data.serviceType);
    const vendorSpecificInfo = this.getVendorSpecificInfo(data);
    
    console.log("Data present here in the generate certificate is ", data);
    console.log("Vendor specific info:", vendorSpecificInfo);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Certificate - ${data.fullName}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 0;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #f8fafc;
          padding: 0;
          line-height: 1.3;
          width: 297mm;
          height: 210mm;
          overflow: hidden;
        }
        
        .certificate-container {
          width: 297mm;
          height: 210mm;
          background: linear-gradient(135deg, ${gradientColor.includes('blue') ? '#1e40af' : gradientColor.includes('green') ? '#059669' : gradientColor.includes('purple') ? '#7c3aed' : gradientColor.includes('orange') ? '#ea580c' : gradientColor.includes('red') ? '#dc2626' : '#4b5563'} 0%, ${gradientColor.includes('blue') ? '#1e3a8a' : gradientColor.includes('green') ? '#047857' : gradientColor.includes('purple') ? '#6b21a8' : gradientColor.includes('orange') ? '#c2410c' : gradientColor.includes('red') ? '#b91c1c' : '#374151'} 100%);
          color: white;
          position: relative;
          overflow: hidden;
          padding: 25mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .background-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
        }
        
        .bg-circle-1 {
          position: absolute;
          top: -80px;
          right: -80px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: white;
        }
        
        .bg-circle-2 {
          position: absolute;
          bottom: -60px;
          left: -60px;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: white;
        }
        
        .content {
          position: relative;
          z-index: 10;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .header {
          text-align: center;
          margin-bottom: 25px;
        }
        
        .header-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .shield-icon {
          font-size: 45px;
        }
        
        .header-text h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        
        .header-text p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .divider {
          width: 60px;
          height: 3px;
          background: white;
          margin: 15px auto;
          border-radius: 2px;
        }
        
        .main-content {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 30px;
          flex: 1;
          align-items: start;
        }
        
        .provider-info {
          text-align: left;
        }
        
        .provider-name {
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 8px;
          line-height: 1.1;
        }
        
        .service-type {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          margin-bottom: 20px;
          opacity: 0.95;
        }
        
        .service-icon {
          font-size: 28px;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 20px;
        }
        
        .detail-section h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 10px;
          opacity: 0.9;
          border-bottom: 1px solid rgba(255,255,255,0.3);
          padding-bottom: 4px;
        }
        
        .detail-item {
          margin-bottom: 6px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          line-height: 1.2;
        }
        
        .detail-item strong {
          font-weight: 500;
          min-width: 80px;
        }
        
        .verification-section {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .qr-container {
          background: white;
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 15px;
        }
        
        .qr-code {
          width: 120px;
          height: 120px;
          margin: 0 auto;
        }
        
        .qr-label {
          color: #374151;
          font-size: 10px;
          font-weight: 500;
          margin-top: 8px;
        }
        
        .verification-info {
          margin-top: 15px;
        }
        
        .verified-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 12px;
          font-size: 14px;
        }
        
        .check-icon {
          font-size: 16px;
        }
        
        .cert-id {
          background: rgba(0,0,0,0.2);
          padding: 6px 10px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 10px;
          margin-top: 8px;
          word-break: break-all;
        }
        
        .blockchain-section {
          margin-top: 12px;
          font-size: 10px;
        }
        
        .blockchain-link {
          color: #60a5fa;
          text-decoration: none;
          word-break: break-all;
          display: block;
          margin: 2px 0;
        }
        
        .footer {
          border-top: 1px solid rgba(255,255,255,0.3);
          padding-top: 20px;
          margin-top: 15px;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .footer-item {
          text-align: center;
        }
        
        .footer-item strong {
          display: block;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .footer-item span {
          font-size: 11px;
        }
        
        .blockchain-info {
          text-align: center;
          font-size: 10px;
          opacity: 0.75;
          margin-top: 15px;
          line-height: 1.3;
        }
        
        .score-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.2);
          padding: 4px 8px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 5px;
        }
        
        .tx-hash {
          font-family: 'Courier New', monospace;
          font-size: 9px;
          word-break: break-all;
          opacity: 0.8;
        }
        
        @media print {
          body { 
            padding: 0; 
            background: white;
          }
          .certificate-container {
            box-shadow: none;
            margin: 0;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate-container">
        <div class="background-pattern">
          <div class="bg-circle-1"></div>
          <div class="bg-circle-2"></div>
        </div>
        
        <div class="content">
          <div class="header">
            <div class="header-icon">
              <div class="shield-icon">🛡️</div>
              <div class="header-text">
                <h1>Jharkhand Tourism Platform</h1>
                <p>Digital Service Provider Certificate</p>
              </div>
            </div>
            <div class="divider"></div>
          </div>
          
          <div class="main-content">
            <div class="provider-info">
              <h2 class="provider-name">${data.fullName}</h2>
              
              <div class="service-type">
                <span class="service-icon">${icon}</span>
                <span>${data.serviceType}</span>
              </div>
              
              <div class="details-grid">
                <div class="detail-section">
                  <h3>Certificate Details</h3>
                  <div class="detail-item">
                    <strong>Certificate No:</strong> ${data.certificateNumber || data.certificateHash}
                  </div>
                  <div class="detail-item">
                    <strong>Provider ID:</strong> #${data.providerId}
                  </div>
                  <div class="detail-item">
                    <strong>Location:</strong> ${data.city}, Jharkhand
                  </div>
                  <div class="detail-item">
                    <strong>Score:</strong>
                    <span class="score-badge">⭐ ${data.verificationScore}/100</span>
                  </div>
                  <div class="detail-item">
                    <strong>Blockchain Hash:</strong>${data.transactionHash}
                  </div>
                  ${vendorSpecificInfo}
                </div>
                
                <div class="detail-section">
                  <h3>Contact & Status</h3>
                  ${data.phone ? `<div class="detail-item"><strong>Phone:</strong> ${data.phone}</div>` : ''}
                  ${data.email ? `<div class="detail-item"><strong>Email:</strong> ${data.email}</div>` : ''}
                  <div class="detail-item">
                    <strong>Registration:</strong> Verified
                  </div>
                  <div class="detail-item">
                    <strong>Status:</strong> Active
                  </div>
                  ${data.transactionHash ? `
                  <div class="detail-item">
                    <strong>Blockchain:</strong> Secured
                  </div>` : ''}
                </div>
              </div>
            </div>
            
            <div class="verification-section">
              <div class="qr-container">
                <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code" />
                <div class="qr-label">Scan to Verify</div>
              </div>
              
              <div class="verification-info">
                <div class="verified-badge">
                  <span class="check-icon">✅</span>
                  <span>Verified Provider</span>
                </div>
                
                <div style="font-size: 10px; opacity: 0.9;">Certificate ID:</div>
                <div class="cert-id">${(data.certificateNumber || data.certificateHash).substring(0, 25)}...</div>
                
                ${data.transactionHash ? `
                <div class="blockchain-section">
                  <div style="font-size: 10px; opacity: 0.9; margin-bottom: 4px;">Blockchain Tx:</div>
                  <div class="tx-hash">${data.transactionHash.substring(0, 20)}...</div>
                  ${data.blockchainTxUrl ? `
                  <a href="${data.blockchainTxUrl}" class="blockchain-link" style="font-size: 10px;">
                    View on Explorer
                  </a>` : ''}
                </div>` : ''}
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-grid">
              <div class="footer-item">
                <strong>Issue Date</strong>
                <span>${data.issuedDate.toLocaleDateString('en-IN')}</span>
              </div>
              <div class="footer-item">
                <strong>Valid Until</strong>
                <span>${data.expiryDate.toLocaleDateString('en-IN')}</span>
              </div>
              <div class="footer-item">
                <strong>Verified By</strong>
                <span>${data.verifiedBy}</span>
              </div>
              <div class="footer-item">
                <strong>Blockchain</strong>
                <span>${data.transactionHash ? 'Secured' : 'Verified'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>`;
  }

  async generateCertificatePDF(data: CertificateData): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    try {
      const page = await browser.newPage();
      
      await page.setViewport({
        width: 1123, 
        height: 794   
      });
      
      await page.setDefaultTimeout(30000);
      
      const qrCodeDataURL = await this.generateQRCode(data.qrCodeData);
      
      const html = this.generateCertificateHTML(data, qrCodeDataURL);
      
      await page.setContent(html, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        },
        width: '297mm',
        height: '210mm'
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}