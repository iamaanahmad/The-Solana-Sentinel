import { SentinelReportData } from '@/types';
import { jsPDF } from 'jspdf';

export class PDFExportService {
  static async exportAnalysis(report: SentinelReportData, analysisId: string): Promise<Blob> {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('The Solana Sentinel', 20, 20);
    
    doc.setFontSize(16);
    doc.text('Token Risk Analysis Report', 20, 30);
    
    // Analysis ID
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Analysis ID: ${analysisId}`, 20, 40);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);
    
    // Separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 50, 190, 50);
    
    // Token Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Token Information', 20, 60);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${report.tokenName}`, 20, 70);
    doc.text(`Symbol: ${report.tokenSymbol}`, 20, 75);
    doc.text(`Address: ${report.tokenAddress.slice(0, 40)}...`, 20, 80);
    
    // Risk Score
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Risk Assessment', 20, 95);
    
    doc.setFontSize(12);
    const riskColor = report.aiAnalysis.riskLevel === 'Low' ? [34, 197, 94] : 
                      report.aiAnalysis.riskLevel === 'Medium' ? [251, 146, 60] : 
                      [239, 68, 68];
    doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.text(`Sentinel Score: ${report.sentinelScore}/100`, 20, 105);
    doc.text(`Risk Level: ${report.aiAnalysis.riskLevel} Risk`, 20, 112);
    
    doc.setTextColor(0, 0, 0);
    
    // AI Analysis
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Analysis Verdict', 20, 127);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const verdict = doc.splitTextToSize(report.aiAnalysis.finalVerdict, 170);
    doc.text(verdict, 20, 137);
    
    // On-Chain Forensics
    let yPos = 137 + (verdict.length * 5) + 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('On-Chain Forensics', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Mint Authority: ${report.onChainAnalysis.mintAuthorityRenounced ? 'Renounced ✓' : 'Active ✗'}`, 20, yPos);
    yPos += 5;
    doc.text(`Freeze Authority: ${report.onChainAnalysis.freezeAuthorityRenounced ? 'Renounced ✓' : 'Active ✗'}`, 20, yPos);
    yPos += 5;
    doc.text(`Top 10 Holder Concentration: ${report.onChainAnalysis.top10HolderConcentrationPercent.toFixed(1)}%`, 20, yPos);
    yPos += 5;
    doc.text(`Deployer LP Holdings: ${report.onChainAnalysis.deployerLpConcentrationPercent.toFixed(1)}%`, 20, yPos);
    
    // Sentiment Analysis
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Community Sentiment', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Overall Sentiment: ${report.sentimentAnalysis.humanReadableSummary}`, 20, yPos);
    yPos += 5;
    doc.text(`Compound Score: ${report.sentimentAnalysis.compoundScore.toFixed(2)}`, 20, yPos);
    
    // On-Chain Attestation (if Premium)
    if (report.onChainAttestation) {
      yPos += 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('On-Chain Attestation (Premium)', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Transaction: ${report.onChainAttestation.signature}`, 20, yPos);
      yPos += 5;
      doc.text(`Attestation PDA: ${report.onChainAttestation.attestationPda}`, 20, yPos);
      yPos += 5;
      doc.text(`Block Slot: ${report.onChainAttestation.slot.toLocaleString()}`, 20, yPos);
      yPos += 5;
      doc.text(`Network: ${process.env.NEXT_PUBLIC_NETWORK || 'devnet'}`, 20, yPos);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('The Solana Sentinel - AI-Powered Token Risk Analysis', 105, 285, { align: 'center' });
    doc.text('Powered by x402 Protocol • Switchboard Oracle • Nosana Network', 105, 290, { align: 'center' });
    
    return doc.output('blob');
  }

  static downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
