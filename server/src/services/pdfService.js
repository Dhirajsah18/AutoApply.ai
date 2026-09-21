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

// Vector SVG Path definitions (24x24 viewBox) for crisp PDF vector rendering
const ICONS = {
  phone: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  email: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  linkedin: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z',
  github: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z',
  globe: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm7.93 9h-3.18a15.7 15.7 0 0 0-1.38-5.07A8.03 8.03 0 0 1 19.93 11zM12 4.07c.83 1.2 1.5 2.77 1.92 4.93h-3.84C10.5 6.84 11.17 5.27 12 4.07zM4.07 13h3.18a15.7 15.7 0 0 0 1.38 5.07A8.03 8.03 0 0 1 4.07 13zm3.18-2H4.07a8.03 8.03 0 0 1 4.56-5.07A15.7 15.7 0 0 0 7.25 11zM12 19.93c-.83-1.2-1.5-2.77-1.92-4.93h3.84c-.42 2.16-1.09 3.73-1.92 4.93zm2.16-6.93H9.84a13.9 13.9 0 0 1 0-2h4.32a13.9 13.9 0 0 1 0 2zm1.21 5.07a15.7 15.7 0 0 0 1.38-5.07h3.18a8.03 8.03 0 0 1-4.56 5.07z',
  externalLink: 'M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
};

const drawVectorIcon = (doc, type, x, y, size = 8.5, color = '#000000') => {
  const pathData = ICONS[type];
  if (!pathData) return;
  const scale = size / 24;
  doc.save();
  doc.translate(x, y);
  doc.scale(scale);
  doc.path(pathData).fillColor(color).fill();
  doc.restore();
};

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
        doc.moveDown(0.4);
        doc.font('Times-Bold').fontSize(11.5).fillColor('#000000').text(title, leftMargin, doc.y);
        const y = doc.y + 1.5;
        doc.moveTo(leftMargin, y).lineTo(rightMargin, y).lineWidth(0.7).strokeColor('#000000').stroke();
        doc.y = y + 5;
      };

      // 1. CANDIDATE NAME (LaTeX Small-Caps Serif Style: e.g. "D H I R A J   K U M A R   S A H")
      const renderSmallCapsName = (name, y) => {
        const words = (name || 'Candidate Name').trim().split(/\s+/);
        const largeSize = 24;
        const smallSize = 17.5;
        const characterSpacing = 1.3;

        let totalWidth = 0;
        words.forEach((w, idx) => {
          const first = w[0].toUpperCase();
          const rest = w.slice(1).toUpperCase();
          doc.font('Times-Roman').fontSize(largeSize);
          totalWidth += doc.widthOfString(first, { characterSpacing });
          if (rest) {
            doc.font('Times-Roman').fontSize(smallSize);
            totalWidth += doc.widthOfString(rest, { characterSpacing });
          }
          if (idx < words.length - 1) {
            doc.font('Times-Roman').fontSize(largeSize);
            totalWidth += doc.widthOfString(' ', { characterSpacing });
          }
        });

        let curX = leftMargin + Math.max(0, (contentWidth - totalWidth) / 2);
        const baselineOffset = (largeSize - smallSize) * 0.42;

        words.forEach((w, idx) => {
          const first = w[0].toUpperCase();
          const rest = w.slice(1).toUpperCase();

          doc.font('Times-Roman').fontSize(largeSize).fillColor('#000000');
          doc.text(first, curX, y, { lineBreak: false });
          curX += doc.widthOfString(first, { characterSpacing });

          if (rest) {
            doc.font('Times-Roman').fontSize(smallSize).fillColor('#000000');
            doc.text(rest, curX, y + baselineOffset, { lineBreak: false });
            curX += doc.widthOfString(rest, { characterSpacing });
          }

          if (idx < words.length - 1) {
            doc.font('Times-Roman').fontSize(largeSize);
            curX += doc.widthOfString(' ', { characterSpacing });
          }
        });

        return y + largeSize + 4;
      };

      const rawName = p.fullName || 'Candidate Name';
      const afterNameY = renderSmallCapsName(rawName, 36);
      doc.y = afterNameY;

      // 2. CONTACT DETAILS LINE (Centered with icons and clickable links)
      const contactParts = [];
      if (p.phone) {
        contactParts.push({
          icon: 'phone',
          text: p.phone,
          link: `tel:${p.phone.replace(/[^0-9+]/g, '')}`,
          isLink: false,
        });
      }
      if (p.email) {
        contactParts.push({
          icon: 'email',
          text: p.email,
          link: `mailto:${p.email}`,
          isLink: true,
        });
      }
      if (p.linkedin) {
        const linkUrl = p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`;
        contactParts.push({
          icon: 'linkedin',
          text: 'LinkedIn',
          link: linkUrl,
          isLink: true,
        });
      }
      if (p.github) {
        const linkUrl = p.github.startsWith('http') ? p.github : `https://${p.github}`;
        contactParts.push({
          icon: 'github',
          text: 'GitHub',
          link: linkUrl,
          isLink: true,
        });
      }
      if (p.portfolio) {
        const linkUrl = p.portfolio.startsWith('http') ? p.portfolio : `https://${p.portfolio}`;
        contactParts.push({
          icon: 'globe',
          text: 'Portfolio',
          link: linkUrl,
          isLink: true,
        });
      }

      if (contactParts.length > 0) {
        doc.font('Times-Roman').fontSize(10.5);
        const iconSize = 8.5;
        const iconGap = 3.5;
        let itemGap = 13;

        let totalLineWidth = 0;
        contactParts.forEach((cp, idx) => {
          totalLineWidth += iconSize + iconGap + doc.widthOfString(cp.text);
          if (idx < contactParts.length - 1) totalLineWidth += itemGap;
        });

        // Auto-scale gap if too wide
        if (totalLineWidth > contentWidth) {
          itemGap = 9;
          doc.fontSize(9.8);
          totalLineWidth = 0;
          contactParts.forEach((cp, idx) => {
            totalLineWidth += iconSize + iconGap + doc.widthOfString(cp.text);
            if (idx < contactParts.length - 1) totalLineWidth += itemGap;
          });
        }

        let currentX = leftMargin + Math.max(0, (contentWidth - totalLineWidth) / 2);
        const contactY = doc.y;

        contactParts.forEach((cp, idx) => {
          // Draw Vector Icon centered with text baseline
          drawVectorIcon(doc, cp.icon, currentX, contactY + 2.2, iconSize, '#000000');
          const textX = currentX + iconSize + iconGap;
          const textWidth = doc.widthOfString(cp.text);
          const lineHeight = doc.currentLineHeight();

          doc.fillColor('#000000').text(cp.text, textX, contactY, {
            underline: cp.isLink,
          });

          if (cp.link) {
            doc.link(currentX - 1, contactY - 1, textWidth + iconSize + iconGap + 2, lineHeight + 3, cp.link);
          }

          currentX += iconSize + iconGap + textWidth;
          if (idx < contactParts.length - 1) {
            currentX += itemGap;
          }
        });

        doc.y = contactY + doc.currentLineHeight() + 7;
      }

      // 3. SUMMARY SECTION
      // 3. SUMMARY SECTION
      if (b.summary) {
        renderSectionHeading('Summary');
        doc.font('Times-Roman').fontSize(10.5).fillColor('#000000').text(b.summary, leftMargin, doc.y, {
          width: contentWidth,
          align: 'justify',
          lineGap: 2.2,
        });
      }

      // 4. EDUCATION SECTION
      const educationList = b.education || [];
      if (educationList.length > 0) {
        renderSectionHeading('Education');
        
        educationList.forEach((edu) => {
          const startY = doc.y;
          // Line 1: Institution (Left, Bold) | Dates/Year (Right, Normal)
          doc.font('Times-Bold').fontSize(11).fillColor('#000000').text(edu.institution || '', leftMargin, startY, {
            width: contentWidth * 0.7,
            continued: false,
          });
          const dates = edu.dates || edu.graduationYear || '';
          doc.font('Times-Roman').fontSize(10.5).fillColor('#000000').text(dates, leftMargin, startY, {
            width: contentWidth,
            align: 'right',
          });

          // Line 2: Degree & CGPA (Left, Italic) | Location (Right, Italic)
          const degreeText = `${edu.degree || ''}${edu.gpa ? `, CGPA: ${edu.gpa}` : ''}`;
          const line2Y = doc.y;
          doc.font('Times-Italic').fontSize(10.5).fillColor('#000000').text(degreeText, leftMargin, line2Y, {
            width: contentWidth * 0.7,
            continued: false,
          });
          if (edu.location) {
            doc.font('Times-Italic').fontSize(10.5).fillColor('#000000').text(edu.location, leftMargin, line2Y, {
              width: contentWidth,
              align: 'right',
            });
          }
          doc.moveDown(0.35);
        });
      }

      // 5. EXPERIENCE SECTION
      const experienceList = b.experience || [];
      if (experienceList.length > 0) {
        renderSectionHeading('Experience');

        experienceList.forEach((exp) => {
          const startY = doc.y;
          // Line 1: Company (Left, Bold) | Dates (Right, Normal)
          doc.font('Times-Bold').fontSize(11).fillColor('#000000').text(exp.company || '', leftMargin, startY, {
            width: contentWidth * 0.7,
            continued: false,
          });
          const dates = exp.dates || `${exp.startDate || ''} – ${exp.endDate || 'Present'}`;
          doc.font('Times-Roman').fontSize(10.5).fillColor('#000000').text(dates, leftMargin, startY, {
            width: contentWidth,
            align: 'right',
          });

          // Line 2: Role (Left, Italic) | Location (Right, Italic)
          const line2Y = doc.y;
          doc.font('Times-Italic').fontSize(10.5).fillColor('#000000').text(exp.role || '', leftMargin, line2Y, {
            width: contentWidth * 0.7,
            continued: false,
          });
          if (exp.location) {
            doc.font('Times-Italic').fontSize(10.5).fillColor('#000000').text(exp.location, leftMargin, line2Y, {
              width: contentWidth,
              align: 'right',
            });
          }

          // Bullets
          const bullets = exp.bullets || (exp.description ? [exp.description] : []);
          bullets.forEach((bText) => {
            if (bText && bText.trim()) {
              doc.font('Times-Roman').fontSize(10.5).fillColor('#000000').text(`•  ${bText.trim()}`, leftMargin + 8, doc.y, {
                width: contentWidth - 8,
                align: 'justify',
                lineGap: 2.2,
              });
            }
          });
          doc.moveDown(0.35);
        });
      }

      // 6. PROJECTS SECTION (Clickable Live link & GitHub Repo icons/links)
      const projectList = b.projects || [];
      if (projectList.length > 0) {
        renderSectionHeading('Projects');

        projectList.forEach((proj) => {
          const startY = doc.y;
          const projName = proj.name || 'Project Name';

          doc.font('Times-Bold').fontSize(11).fillColor('#000000');
          const nameWidth = doc.widthOfString(projName);
          doc.text(projName, leftMargin, startY);

          let projX = leftMargin + nameWidth + 5;

          // Clickable External Link Icon for Live Demo
          if (proj.liveUrl) {
            const liveLink = proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`;
            drawVectorIcon(doc, 'externalLink', projX, startY + 2.5, 8.5, '#000000');
            doc.link(projX - 1, startY - 1, 11, 13, liveLink);
            projX += 13;
          }

          // Clickable GitHub Icon for Code Repo
          const repo = proj.repoUrl || proj.githubUrl;
          if (repo) {
            const repoLink = repo.startsWith('http') ? repo : `https://${repo}`;
            drawVectorIcon(doc, 'github', projX, startY + 2.5, 8.5, '#000000');
            doc.link(projX - 1, startY - 1, 11, 13, repoLink);
            projX += 14;
          }

          // Tech stack with proper space and pipe
          const techList = proj.techStack?.length ? proj.techStack.join(', ') : (proj.technologies || '');
          const techStr = techList ? ` | ${techList}` : '';

          if (techStr) {
            doc.font('Times-Italic').fontSize(10.5).fillColor('#000000').text(techStr, projX + 2, startY);
          }

          // Date on right
          const projDates = proj.dates || `${proj.startDate || ''} – ${proj.endDate || ''}`.replace(/^ – | – $/g, '');
          if (projDates) {
            doc.font('Times-Roman').fontSize(10.5).fillColor('#000000').text(projDates, leftMargin, startY, {
              width: contentWidth,
              align: 'right',
            });
          }

          doc.y = startY + doc.currentLineHeight() + 2;

          // Project Bullets
          const projBullets = proj.bullets || (proj.description ? [proj.description] : []);
          projBullets.forEach((bText) => {
            if (bText && bText.trim()) {
              doc.font('Times-Roman').fontSize(10.5).fillColor('#000000').text(`•  ${bText.trim()}`, leftMargin + 8, doc.y, {
                width: contentWidth - 8,
                align: 'justify',
                lineGap: 2.2,
              });
            }
          });
          doc.moveDown(0.35);
        });
      }

      // 7. SKILLS SECTION
      const cats = b.skillsCategories || {};
      const hasCategories = cats.languages || cats.frameworks || cats.databases || cats.tools || cats.softSkills;
      
      if (hasCategories || (b.skills && b.skills.length > 0)) {
        renderSectionHeading('Skills');

        if (hasCategories) {
          if (cats.languages) {
            doc.font('Times-Bold').fontSize(10.5).fillColor('#000000').text('Languages: ', leftMargin, doc.y, { continued: true });
            doc.font('Times-Roman').fontSize(10.5).text(cats.languages, { lineGap: 2.0 });
          }
          if (cats.frameworks) {
            doc.font('Times-Bold').fontSize(10.5).fillColor('#000000').text('Frameworks & Libraries: ', leftMargin, doc.y, { continued: true });
            doc.font('Times-Roman').fontSize(10.5).text(cats.frameworks, { lineGap: 2.0 });
          }
          if (cats.databases) {
            doc.font('Times-Bold').fontSize(10.5).fillColor('#000000').text('Databases: ', leftMargin, doc.y, { continued: true });
            doc.font('Times-Roman').fontSize(10.5).text(cats.databases, { lineGap: 2.0 });
          }
          if (cats.tools) {
            doc.font('Times-Bold').fontSize(10.5).fillColor('#000000').text('Developer Tools: ', leftMargin, doc.y, { continued: true });
            doc.font('Times-Roman').fontSize(10.5).text(cats.tools, { lineGap: 2.0 });
          }
          if (cats.softSkills) {
            doc.font('Times-Bold').fontSize(10.5).fillColor('#000000').text('Soft Skills: ', leftMargin, doc.y, { continued: true });
            doc.font('Times-Roman').fontSize(10.5).text(cats.softSkills, { lineGap: 2.0 });
          }
        } else if (b.skills && b.skills.length > 0) {
          doc.font('Times-Roman').fontSize(10.5).fillColor('#000000').text(b.skills.join(', '), leftMargin, doc.y, {
            width: contentWidth,
            lineGap: 2.2,
          });
        }
      }

      // 8. RELEVANT COURSEWORK SECTION
      const courseworkList = b.coursework || [];
      if (courseworkList.length > 0) {
        renderSectionHeading('Relevant Coursework');
        
        const colWidth = contentWidth / 4;
        const startY = doc.y;
        courseworkList.forEach((item, idx) => {
          const col = idx % 4;
          const row = Math.floor(idx / 4);
          const itemX = leftMargin + (col * colWidth);
          const itemY = startY + (row * 16);
          doc.font('Times-Roman').fontSize(10.5).fillColor('#000000').text(`•  ${item}`, itemX, itemY, {
            width: colWidth - 4,
          });
        });
        doc.y = startY + Math.ceil(courseworkList.length / 4) * 16 + 4;
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
          const itemY = startY + (row * 16);
          const text = typeof item === 'string' ? item : item.name || '';
          doc.font('Times-Roman').fontSize(10.5).fillColor('#000000').text(`•  ${text}`, itemX, itemY, {
            width: colWidth - 6,
          });
        });
        doc.y = startY + Math.ceil(certList.length / 2) * 16 + 4;
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
