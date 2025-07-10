// src/components/PDFGenerator.js
import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PDFGenerator = ({ contentRef, quizTitle }) => {
  const handleDownload = () => {
    if (!contentRef.current) {
      console.error('No content to generate PDF');
      return;
    }

    // Show loading indicator
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    
    const spinner = document.createElement('div');
    spinner.style.width = '50px';
    spinner.style.height = '50px';
    spinner.style.border = '5px solid rgba(67, 97, 238, 0.2)';
    spinner.style.borderTop = '5px solid #4361ee';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';
    
    const text = document.createElement('p');
    text.textContent = 'Generating PDF...';
    text.style.marginTop = '20px';
    text.style.fontSize = '1.2rem';
    text.style.color = '#212529';
    text.style.fontWeight = '500';
    
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    
    container.appendChild(spinner);
    container.appendChild(text);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // Get the HTML element to convert
    const element = contentRef.current;
    
    // Set a higher resolution for PDF
    const scale = 2;
    
    html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      allowTaint: true
    }).then(canvas => {
      // Remove loading overlay
      document.body.removeChild(overlay);
      
      // Calculate PDF dimensions
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width / scale;
      const imgHeight = canvas.height / scale;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaling to fit page
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      
      // Calculate position to center
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      
      // Generate filename
      const filename = `${quizTitle.replace(/\s+/g, '_')}_quiz.pdf`;
      
      // Download PDF
      pdf.save(filename);
    }).catch(error => {
      // Remove loading overlay
      document.body.removeChild(overlay);
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    });
  };

  return (
    <div className="pdf-generator">
      <button 
        className="download-btn"
        onClick={handleDownload}
      >
        Download PDF
      </button>
    </div>
  );
};

export default PDFGenerator;