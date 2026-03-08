const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('Mock_Legal_Contract.pdf'));

doc.fontSize(20).text('SHAREHOLDER RIGHTS AND CORPORATE GOVERNANCE AGREEMENT', { align: 'center' });
doc.moveDown();

doc.fontSize(12).text('This Agreement (the "Agreement") is entered into as of the Effective Date by and between the Corporation and its Shareholders.');
doc.moveDown();

doc.fontSize(14).text('1. Amendment of Terms', { underline: true });
doc.fontSize(12).text('The Company reserves the right to modify, amend, or change any terms of this Agreement at any time, in its sole and absolute discretion, without prior notice to or consent from the Shareholders. Continued holding of shares constitutes acceptance of any such unilateral amendments.');
doc.moveDown();

doc.fontSize(14).text('2. Dispute Resolution', { underline: true });
doc.fontSize(12).text('Any dispute, claim, or controversy arising out of or relating to this Agreement or the breach thereof shall be settled exclusively by binding arbitration. By agreeing to this provision, Shareholders expressly waive their right to a trial by jury or to participate in any class action lawsuit against the Company.');
doc.moveDown();

doc.fontSize(14).text('3. Change of Control and Shareholder Rights Plan', { underline: true });
doc.fontSize(12).text('In the event that any person or group acquires, or announces a tender offer that would result in the ownership of, 15% or more of the Company\'s outstanding common stock without prior Board approval (an "Acquiring Person"), a "Poison Pill" provision shall be immediately triggered. Upon such triggering event, all Shareholders other than the Acquiring Person shall have the right to purchase newly issued shares of the Company\'s preferred stock at a 50% discount to the current market price, thereby substantially diluting the voting power and economic interest of the Acquiring Person.');
doc.moveDown();

doc.fontSize(14).text('4. Non-Compete and Confidentiality', { underline: true });
doc.fontSize(12).text('Shareholders agree that during the term of their ownership and for a period of five (5) years thereafter, they shall not, directly or indirectly, engage in any business that competes with the Company within a global geographic scope.');
doc.moveDown();

doc.text('IN WITNESS WHEREOF, the parties hereto have executed this Agreement.');

doc.end();
console.log('Mock legal PDF generated successfully.');
