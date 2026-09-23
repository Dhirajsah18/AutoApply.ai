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

      // Standard A4 document with 40pt margins for clean, balanced academic layout
      const doc = new PDFDocument({
        margin: 40,
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
      const leftMargin = 40;
      const rightMargin = pageWidth - 40;
      const contentWidth = rightMargin - leftMargin;

      // Helper function for section headings with generous, professional spacing
      const renderSectionHeading = (title) => {
        doc.y += 10;
        doc.font('Times-Bold').fontSize(11).fillColor('#000000').text(title.toUpperCase(), leftMargin, doc.y, {
          characterSpacing: 0.5,
        });
        const y = doc.y + 2;
        doc.moveTo(leftMargin, y).lineTo(rightMargin, y).lineWidth(0.6).strokeColor('#222222').stroke();
        doc.y = y + 6;
      };

      // Helper function to render bullet points with strictly aligned hanging indent
      // The bullet dot sits in the gutter; all lines of text align at leftMargin + 14
      const renderFormattedPdfBullet = (bulletText) => {
        const clean = bulletText.trim().replace(/^[-•–]\s*/, '');
        if (!clean) return;

        const bulletSymbol = '•';
        const bulletIndent = 14;
        const bulletSymbolX = leftMargin + 3;
        const textX = leftMargin + bulletIndent;
        const textWidth = contentWidth - bulletIndent;
        const startY = doc.y;

        // Draw the bullet point in the gutter (will never wrap under)
        doc.font('Times-Roman').fontSize(10).fillColor('#000000').text(bulletSymbol, bulletSymbolX, startY, {
          lineBreak: false,
        });

        const segments = clean.split(/(\*\*.*?\*\*)/g);

        if (segments.length === 1) {
          doc.font('Times-Roman').fontSize(10).fillColor('#111827').text(clean, textX, startY, {
            width: textWidth,
            align: 'left',
            lineGap: 2.8,
          });
          doc.y += 3;
          return;
        }

        segments.forEach((seg, sIdx) => {
          if (!seg) return;
          const isLast = sIdx === segments.length - 1;
          const isBold = seg.startsWith('**') && seg.endsWith('**') && seg.length > 4;
          const text = isBold ? seg.slice(2, -2) : seg;

          if (sIdx === 0) {
            doc.font(isBold ? 'Times-Bold' : 'Times-Roman').fontSize(10).fillColor('#111827').text(text, textX, startY, {
              continued: !isLast,
              width: textWidth,
              align: 'left',
              lineGap: 2.8,
            });
          } else {
            doc.font(isBold ? 'Times-Bold' : 'Times-Roman').fontSize(10).text(text, {
              continued: !isLast,
              lineGap: 2.8,
            });
          }
        });

        doc.y += 3;
      };

      // 1. CANDIDATE NAME (Clean, Distinguished Serif Heading)
      const rawName = (p.fullName || 'Candidate Name').trim();
      doc.font('Times-Bold').fontSize(22).fillColor('#000000').text(rawName.toUpperCase(), leftMargin, 40, {
        align: 'center',
        characterSpacing: 1.0,
      });
      doc.y += 4;

      // 2. CONTACT DETAILS LINE (Centered with clean separators and clickable links)
      const contactParts = [];
      if (p.phone) {
        contactParts.push({
          text: p.phone,
          link: `tel:${p.phone.replace(/[^0-9+]/g, '')}`,
          isLink: false,
        });
      }
      if (p.email) {
        contactParts.push({
          text: p.email,
          link: `mailto:${p.email}`,
          isLink: true,
        });
      }
      if (p.linkedin) {
        const linkUrl = p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`;
        contactParts.push({
          text: 'LinkedIn',
          link: linkUrl,
          isLink: true,
        });
      }
      if (p.github) {
        const linkUrl = p.github.startsWith('http') ? p.github : `https://${p.github}`;
        contactParts.push({
          text: 'GitHub',
          link: linkUrl,
          isLink: true,
        });
      }
      if (p.portfolio) {
        const linkUrl = p.portfolio.startsWith('http') ? p.portfolio : `https://${p.portfolio}`;
        contactParts.push({
          text: 'Portfolio',
          link: linkUrl,
          isLink: true,
        });
      }

      if (contactParts.length > 0) {
        doc.font('Times-Roman').fontSize(10);
        const separator = '  |  ';
        const sepWidth = doc.widthOfString(separator);

        let totalWidth = 0;
        contactParts.forEach((cp, idx) => {
          totalWidth += doc.widthOfString(cp.text);
          if (idx < contactParts.length - 1) totalWidth += sepWidth;
        });

        let currentX = leftMargin + Math.max(0, (contentWidth - totalWidth) / 2);
        const contactY = doc.y;

        contactParts.forEach((cp, idx) => {
          const textWidth = doc.widthOfString(cp.text);
          const lineHeight = doc.currentLineHeight();

          doc.fillColor(cp.isLink ? '#1d4ed8' : '#222222').text(cp.text, currentX, contactY, {
            underline: cp.isLink,
          });

          if (cp.link) {
            doc.link(currentX, contactY, textWidth, lineHeight, cp.link);
          }

          currentX += textWidth;
          if (idx < contactParts.length - 1) {
            doc.fillColor('#777777').text(separator, currentX, contactY);
            currentX += sepWidth;
          }
        });

        doc.y = contactY + doc.currentLineHeight() + 8;
      }

      // 3. SUMMARY SECTION
      if (b.summary) {
        renderSectionHeading('Summary');
        doc.font('Times-Roman').fontSize(10).fillColor('#111827').text(b.summary, leftMargin, doc.y, {
          width: contentWidth,
          align: 'justify',
          lineGap: 2.8,
        });
        doc.y += 3;
      }

      // 4. EDUCATION SECTION
      const educationList = b.education || [];
      if (educationList.length > 0) {
        renderSectionHeading('Education');

        educationList.forEach((edu) => {
          const startY = doc.y;
          // Line 1: Institution (Left, Bold) | Dates/Year (Right, Normal)
          doc.font('Times-Bold').fontSize(10.5).fillColor('#000000').text(edu.institution || '', leftMargin, startY, {
            width: contentWidth * 0.7,
            continued: false,
          });
          const dates = edu.dates || edu.graduationYear || '';
          doc.font('Times-Roman').fontSize(10).fillColor('#000000').text(dates, leftMargin, startY, {
            width: contentWidth,
            align: 'right',
          });

          // Line 2: Degree & CGPA (Left, Italic) | Location (Right, Italic)
          const degreeText = `${edu.degree || ''}${edu.gpa ? `, CGPA: ${edu.gpa}` : ''}`;
          const line2Y = doc.y + 1.5;
          doc.font('Times-Italic').fontSize(10).fillColor('#333333').text(degreeText, leftMargin, line2Y, {
            width: contentWidth * 0.7,
            continued: false,
          });
          if (edu.location) {
            doc.font('Times-Italic').fontSize(10).fillColor('#555555').text(edu.location, leftMargin, line2Y, {
              width: contentWidth,
              align: 'right',
            });
          }
          doc.y = line2Y + doc.currentLineHeight() + 5;
        });
      }

      // 5. EXPERIENCE SECTION
      const experienceList = b.experience || [];
      if (experienceList.length > 0) {
        renderSectionHeading('Experience');

        experienceList.forEach((exp) => {
          const startY = doc.y;
          // Line 1: Company (Left, Bold) | Dates (Right, Normal)
          doc.font('Times-Bold').fontSize(10.5).fillColor('#000000').text(exp.company || '', leftMargin, startY, {
            width: contentWidth * 0.7,
            continued: false,
          });
          const dates = exp.dates || `${exp.startDate || ''} – ${exp.endDate || 'Present'}`;
          doc.font('Times-Roman').fontSize(10).fillColor('#000000').text(dates, leftMargin, startY, {
            width: contentWidth,
            align: 'right',
          });

          // Line 2: Role (Left, Italic) | Location (Right, Italic)
          const line2Y = doc.y + 1.5;
          doc.font('Times-Italic').fontSize(10).fillColor('#333333').text(exp.role || '', leftMargin, line2Y, {
            width: contentWidth * 0.7,
            continued: false,
          });
          if (exp.location) {
            doc.font('Times-Italic').fontSize(10).fillColor('#555555').text(exp.location, leftMargin, line2Y, {
              width: contentWidth,
              align: 'right',
            });
          }

          doc.y = line2Y + doc.currentLineHeight() + 3;

          // Experience Bullets
          const bullets = exp.bullets || (exp.description ? [exp.description] : []);
          bullets.forEach((bText) => {
            if (bText && bText.trim()) {
              renderFormattedPdfBullet(bText);
            }
          });
          doc.y += 4;
        });
      }

      // 6. PROJECTS SECTION
      const projectList = b.projects || [];
      if (projectList.length > 0) {
        renderSectionHeading('Projects');

        projectList.forEach((proj) => {
          const startY = doc.y;
          const projName = proj.name || 'Project Name';

          doc.font('Times-Bold').fontSize(10.5).fillColor('#000000');
          const nameWidth = doc.widthOfString(projName);
          doc.text(projName, leftMargin, startY);

          let projX = leftMargin + nameWidth;

          // Clickable text links for Live Demo & GitHub Code if available
          if (proj.liveUrl) {
            const liveLink = proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`;
            const linkText = ' [Live Demo]';
            doc.font('Times-Roman').fontSize(9.5).fillColor('#1d4ed8').text(linkText, projX, startY + 0.5, { underline: true });
            doc.link(projX, startY, doc.widthOfString(linkText), 12, liveLink);
            projX += doc.widthOfString(linkText);
          }

          const repo = proj.repoUrl || proj.githubUrl;
          if (repo) {
            const repoLink = repo.startsWith('http') ? repo : `https://${repo}`;
            const repoText = ' [Code]';
            doc.font('Times-Roman').fontSize(9.5).fillColor('#1d4ed8').text(repoText, projX, startY + 0.5, { underline: true });
            doc.link(projX, startY, doc.widthOfString(repoText), 12, repoLink);
            projX += doc.widthOfString(repoText);
          }

          // Tech stack with separator
          const techList = proj.techStack?.length ? proj.techStack.join(', ') : (proj.technologies || '');
          if (techList) {
            doc.font('Times-Italic').fontSize(10).fillColor('#333333').text(` | ${techList}`, projX + 2, startY);
          }

          // Date on right
          const projDates = proj.dates || `${proj.startDate || ''} – ${proj.endDate || ''}`.replace(/^ – | – $/g, '');
          if (projDates) {
            doc.font('Times-Roman').fontSize(10).fillColor('#000000').text(projDates, leftMargin, startY, {
              width: contentWidth,
              align: 'right',
            });
          }

          doc.y = startY + doc.currentLineHeight() + 3;

          // Project Bullets
          const projBullets = proj.bullets || (proj.description ? [proj.description] : []);
          projBullets.forEach((bText) => {
            if (bText && bText.trim()) {
              renderFormattedPdfBullet(bText);
            }
          });
          doc.y += 4;
        });
      }

      // 7. SKILLS SECTION
      const cats = b.skillsCategories || {};
      const hasCategories = cats.languages || cats.frameworks || cats.databases || cats.tools || cats.softSkills;

      if (hasCategories || (b.skills && b.skills.length > 0)) {
        renderSectionHeading('Skills');

        const renderSkillCategory = (label, value) => {
          if (!value) return;
          doc.font('Times-Bold').fontSize(10).fillColor('#000000').text(`${label}: `, leftMargin, doc.y, {
            continued: true,
          });
          doc.font('Times-Roman').fontSize(10).fillColor('#222222').text(value, {
            lineGap: 2.6,
          });
          doc.y += 2.5;
        };

        if (hasCategories) {
          renderSkillCategory('Languages', cats.languages);
          renderSkillCategory('Frameworks & Libraries', cats.frameworks);
          renderSkillCategory('Databases', cats.databases);
          renderSkillCategory('Developer Tools', cats.tools);
          renderSkillCategory('Soft Skills', cats.softSkills);
        } else if (b.skills && b.skills.length > 0) {
          doc.font('Times-Roman').fontSize(10).fillColor('#000000').text(b.skills.join(', '), leftMargin, doc.y, {
            width: contentWidth,
            lineGap: 2.6,
          });
        }
      }

      // 8. RELEVANT COURSEWORK SECTION
      const courseworkList = b.coursework || [];
      if (courseworkList.length > 0) {
        renderSectionHeading('Relevant Coursework');
        const courseworkStr = courseworkList.join('  •  ');
        doc.font('Times-Roman').fontSize(10).fillColor('#222222').text(courseworkStr, leftMargin, doc.y, {
          width: contentWidth,
          lineGap: 2.6,
        });
        doc.y += 4;
      }

      // 9. CERTIFICATIONS SECTION
      const certList = b.certifications || [];
      if (certList.length > 0) {
        renderSectionHeading('Certifications');
        const certStr = certList.map((c) => (typeof c === 'string' ? c : c.name || '')).filter(Boolean).join('  •  ');
        doc.font('Times-Roman').fontSize(10).fillColor('#222222').text(certStr, leftMargin, doc.y, {
          width: contentWidth,
          lineGap: 2.6,
        });
        doc.y += 4;
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
