const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const exportToExcel = async (data, headers) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    
    worksheet.columns = headers.map(header => ({
        header: header.label,
        key: header.key,
        width: 20
    }));

    worksheet.addRows(data);
    
    return workbook;
};

const exportToPDF = async (data, headers) => {
    const doc = new PDFDocument();
    
    // Add headers
    headers.forEach((header, i) => {
        doc.text(header.label, 50 + (i * 150), 50);
    });

    // Add data
    data.forEach((row, rowIndex) => {
        headers.forEach((header, colIndex) => {
            doc.text(row[header.key], 50 + (colIndex * 150), 70 + (rowIndex * 20));
        });
    });

    return doc;
};

module.exports = {
    exportToExcel,
    exportToPDF
}; 