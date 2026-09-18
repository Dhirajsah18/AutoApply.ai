import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const generateResumePdf = (resume) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `generated-resume-${resume._id}-${Date.now()}.pdf`;
      const outputPath = path.join(uploadDir, fileName);
      
      // Standard A4 document with 36pt (0.5 inch) margins for high density academic layout
      const doc = new PDFDocument({
        margin: 36,
        size: 'A4',
        info: {
          Title: resume.title || 'Resume',
          Author: resume.builderData?.personalInfo?.fullName || 'Candidate',
        },
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const b = resume.builderData || {};
      const p = b.personalInfo || {};
      const pageWidth = doc.page.width;
      const leftMargin = 36;
      const rightMargin = pageWidth - 36;
      const contentWidth = rightMargin - leftMargin;

      // Helper function for section headings
      const renderSectionHeading = (title) => {
        doc.moveDown(0.35);
        doc.font('Times-Bold').fontSize(11).fillColor('#000000').text(title, leftMargin, doc.y);
        const y = doc.y + 1;
        doc.moveTo(leftMargin, y).lineTo(rightMargin, y).lineWidth(0.6).strokeColor('#000000').stroke();
        doc.y = y + 4;
      };

      // 1. CANDIDATE NAME (Centered, Large Serif)
      const fullName = (p.fullName || 'Dhiraj Kumar Sah').toUpperCase();
      doc.font('Times-Bold').fontSize(18).fillColor('#000000').text(fullName, {
        align: 'center',
        characterSpacing: 0.5,
      });
      doc.moveDown(0.2);

      // 2. CONTACT DETAILS LINE (Centered, with clickable links)
      const contactParts = [];
      if (p.phone) contactParts.push({ text: p.phone, link: `tel:${p.phone.replace(/[^0-9+]/g, '')}` });
      if (p.email) contactParts.push({ text: p.email, link: `mailto:${p.email}` });
      if (p.linkedin) {
        const linkUrl = p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`;
        const label = p.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '') || 'LinkedIn';
        contactParts.push({ text: label, link: linkUrl });
      }
      if (p.github) {
        const linkUrl = p.github.startsWith('http') ? p.github : `https://${p.github}`;
        const label = p.github.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '') || 'GitHub';
        contactParts.push({ text: label, link: linkUrl });
      }
      if (p.portfolio) {
        const linkUrl = p.portfolio.startsWith('http') ? p.portfolio : `https://${p.portfolio}`;
        contactParts.push({ text: 'Portfolio', link: linkUrl });
      }

      // Render Contact line
      if (contactParts.length > 0) {
        const contactY = doc.y;
        doc.font('Times-Roman').fontSize(9.5).fillColor('#000000');
        
        // Calculate total text width for centering
        let totalStr = contactParts.map(c => c.text).join('   |   ');
        doc.text(totalStr, leftMargin, contactY, {
          align: 'center',
          width: contentWidth,
        });
      }

      // 3. SUMMARY SECTION
      if (b.summary) {
        renderSectionHeading('Summary');
        doc.font('Times-Roman').fontSize(9.5).fillColor('#000000').text(b.summary, leftMargin, doc.y, {
          width: contentWidth,
          align: 'justify',
          lineGap: 1.5,
        });
      }

      // 4. EDUCATION SECTION
      const educationList = b.education || [];
      if (educationList.length > 0) {
        renderSectionHeading('Education');
        
        educationList.forEach((edu) => {
          const startY = doc.y;
          // Line 1: Institution (Left, Bold) | Dates/Year (Right, Normal)
          doc.font('Times-Bold').fontSize(10).fillColor('#000000').text(edu.institution || '', leftMargin, startY, {
            width: contentWidth * 0.7,
            continued: false,
          });
          const dates = edu.dates || edu.graduationYear || '';
          doc.font('Times-Roman').fontSize(9.5).fillColor('#000000').text(dates, leftMargin, startY, {
            width: contentWidth,
            align: 'right',
          });

          // Line 2: Degree & CGPA (Left, Italic) | Location (Right, Italic)
          const degreeText = `${edu.degree || ''}${edu.gpa ? `, CGPA: ${edu.gpa}` : ''}`;
          const line2Y = doc.y;
          doc.font('Times-Italic').fontSize(9.5).fillColor('#000000').text(degreeText, leftMargin, line2Y, {
            width: contentWidth * 0.7,
            continued: false,
          });
          if (edu.location) {
            doc.font('Times-Italic').fontSize(9.5).fillColor('#000000').text(edu.location, leftMargin, line2Y, {
              width: contentWidth,
              align: 'right',
            });
          }
          doc.moveDown(0.25);
        });
      }

      // 5. EXPERIENCE SECTION
      const experienceList = b.experience || [];
      if (experienceList.length > 0) {
        renderSectionHeading('Experience');

        experienceList.forEach((exp) => {
          const startY = doc.y;
          // Line 1: Company (Left, Bold) | Dates (Right, Normal)
          doc.font('Times-Bold').fontSize(10).fillColor('#000000').text(exp.company || '', leftMargin, startY, {
            width: contentWidth * 0.7,
            continued: false,
          });
          const dates = exp.dates || `${exp.startDate || ''} – ${exp.endDate || 'Present'}`;
          doc.font('Times-Roman').fontSize(9.5).fillColor('#000000').text(dates, leftMargin, startY, {
            width: contentWidth,
            align: 'right',
          });

          // Line 2: Role (Left, Italic) | Location (Right, Italic)
          const line2Y = doc.y;
          doc.font('Times-Italic').fontSize(9.5).fillColor('#000000').text(exp.role || '', leftMargin, line2Y, {
            width: contentWidth * 0.7,
            continued: false,
          });
          if (exp.location) {
            doc.font('Times-Italic').fontSize(9.5).fillColor('#000000').text(exp.location, leftMargin, line2Y, {
              width: contentWidth,
              align: 'right',
            });
          }

          // Bullets
          const bullets = exp.bullets || (exp.description ? [exp.description] : []);
          bullets.forEach((bText) => {
            if (bText && bText.trim()) {
              doc.font('Times-Roman').fontSize(9.2).fillColor('#000000').text(`–  ${bText.trim()}`, leftMargin + 8, doc.y, {
                width: contentWidth - 8,
                align: 'justify',
                lineGap: 1.2,
              });
            }
          });
          doc.moveDown(0.25);
        });
      }

      // 6. PROJECTS SECTION (Clickable Live link & GitHub Repo icons/links)
      const projectList = b.projects || [];
      if (projectList.length > 0) {
        renderSectionHeading('Projects');

        projectList.forEach((proj) => {
          const startY = doc.y;
          
          // Project Name (Bold) + Links + Tech Stack (Italic)
          let titleLine = proj.name || '';
          if (proj.liveUrl) titleLine += ` [Live]`;
          if (proj.repoUrl || proj.githubUrl) titleLine += ` [Code]`;
          
          const techStr = proj.techStack?.length ? ` | ${proj.techStack.join(', ')}` : (proj.technologies ? ` | ${proj.technologies}` : '');

          doc.font('Times-Bold').fontSize(10).fillColor('#000000').text(proj.name || '', leftMargin, startY, { continued: true });
          
          // Clickable Link Annotation for Live
          if (proj.liveUrl) {
            const liveLink = proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`;
            doc.font('Times-Bold').fontSize(9).fillColor('#0000EE').text(' [Live]', { link: liveLink, continued: true });
          }
          // Clickable Link Annotation for GitHub Code
          const repo = proj.repoUrl || proj.githubUrl;
          if (repo) {
            const repoLink = repo.startsWith('http') ? repo : `https://${repo}`;
            doc.font('Times-Bold').fontSize(9).fillColor('#0000EE').text(' [Code]', { link: repoLink, continued: true });
          }

          if (techStr) {
            doc.font('Times-Italic').fontSize(9.5).fillColor('#000000').text(techStr, { continued: false });
          } else {
            doc.text('', { continued: false });
          }

          // Date on right
          const projDates = proj.dates || `${proj.startDate || ''} – ${proj.endDate || ''}`.replace(/^ – | – $/g, '');
          if (projDates) {
            doc.font('Times-Roman').fontSize(9.5).fillColor('#000000').text(projDates, leftMargin, startY, {
              width: contentWidth,
              align: 'right',
            });
          }

          // Project Bullets
          const projBullets = proj.bullets || (proj.description ? [proj.description] : []);
          projBullets.forEach((bText) => {
            if (bText && bText.trim()) {
              doc.font('Times-Roman').fontSize(9.2).fillColor('#000000').text(`–  ${bText.trim()}`, leftMargin + 8, doc.y, {
                width: contentWidth - 8,
                align: 'justify',
                lineGap: 1.2,
              });
            }
          });
          doc.moveDown(0.25);
        });
      }

      // 7. SKILLS SECTION
      const cats = b.skillsCategories || {};
      const hasCategories = cats.languages || cats.frameworks || cats.databases || cats.tools || cats.softSkills;
      
      if (hasCategories || (b.skills && b.skills.length > 0)) {
        renderSectionHeading('Skills');

        if (hasCategories) {
          if (cats.languages) {
            doc.font('Times-Bold').fontSize(9.5).fillColor('#000000').text('Languages: ', leftMargin, doc.y, { continued: true });
            doc.font('Times-Roman').text(cats.languages);
          }
          if (cats.frameworks) {
            doc.font('Times-Bold').fontSize(9.5).fillColor('#000000').text('Frameworks & Libraries: ', leftMargin, doc.y, { continued: true });
            doc.font('Times-Roman').text(cats.frameworks);
          }
          if (cats.databases) {
            doc.font('Times-Bold').fontSize(9.5).fillColor('#000000').text('Databases: ', leftMargin, doc.y, { continued: true });
            doc.font('Times-Roman').text(cats.databases);
          }
          if (cats.tools) {
            doc.font('Times-Bold').fontSize(9.5).fillColor('#000000').text('Developer Tools: ', leftMargin, doc.y, { continued: true });
            doc.font('Times-Roman').text(cats.tools);
          }
          if (cats.softSkills) {
            doc.font('Times-Bold').fontSize(9.5).fillColor('#000000').text('Soft Skills: ', leftMargin, doc.y, { continued: true });
            doc.font('Times-Roman').text(cats.softSkills);
          }
        } else if (b.skills && b.skills.length > 0) {
          doc.font('Times-Roman').fontSize(9.5).fillColor('#000000').text(b.skills.join(', '), leftMargin, doc.y, {
            width: contentWidth,
            lineGap: 1.5,
          });
        }
      }

      // 8. RELEVANT COURSEWORK SECTION
      const courseworkList = b.coursework || [];
      if (courseworkList.length > 0) {
        renderSectionHeading('Relevant Coursework');
        
        // Render 2 or 4 columns
        const colWidth = contentWidth / 4;
        const startY = doc.y;
        courseworkList.forEach((item, idx) => {
          const col = idx % 4;
          const row = Math.floor(idx / 4);
          const itemX = leftMargin + (col * colWidth);
          const itemY = startY + (row * 13);
          doc.font('Times-Roman').fontSize(9).fillColor('#000000').text(`•  ${item}`, itemX, itemY, {
            width: colWidth - 4,
          });
        });
        doc.y = startY + Math.ceil(courseworkList.length / 4) * 13 + 4;
      }

      // 9. CERTIFICATIONS SECTION
      const certList = b.certifications || [];
      if (certList.length > 0) {
        renderSectionHeading('Certifications');

        const colWidth = contentWidth / 2;
        const startY = doc.y;
        certList.forEach((item, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const itemX = leftMargin + (col * colWidth);
          const itemY = startY + (row * 13);
          const text = typeof item === 'string' ? item : item.name || '';
          doc.font('Times-Roman').fontSize(9).fillColor('#000000').text(`•  ${text}`, itemX, itemY, {
            width: colWidth - 6,
          });
        });
        doc.y = startY + Math.ceil(certList.length / 2) * 13 + 4;
      }

      doc.end();

      stream.on('finish', () => {
        resolve({
          fileName,
          filePath: outputPath,
          fileSize: fs.statSync(outputPath).size,
        });
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};
