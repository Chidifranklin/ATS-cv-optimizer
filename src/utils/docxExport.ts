import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { StructuredCV } from '../types';

export async function generateDocxBlob(cv: StructuredCV): Promise<Blob> {
  const children: Paragraph[] = [];

  // Helper for Section Heading
  const createSectionHeading = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          color: '333333',
          space: 4,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 24, // 12pt font
          font: 'Calibri',
          color: '1A365D',
        }),
      ],
    });
  };

  // 1. Contact Info Header
  const contact = cv.contactInfo;
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: contact.fullName,
          bold: true,
          size: 36, // 18pt font
          font: 'Calibri',
          color: '0F172A',
        }),
      ],
    })
  );

  const contactDetailsStr = [
    contact.location,
    contact.phone,
    contact.email,
    contact.linkedin,
    contact.github,
    contact.website,
  ]
    .filter(Boolean)
    .join('  |  ');

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 180 },
      children: [
        new TextRun({
          text: contactDetailsStr,
          size: 20, // 10pt
          font: 'Calibri',
          color: '475569',
        }),
      ],
    })
  );

  // 2. Professional Summary
  if (cv.professionalSummary) {
    children.push(createSectionHeading('Professional Summary'));
    children.push(
      new Paragraph({
        spacing: { before: 60, after: 180 },
        children: [
          new TextRun({
            text: cv.professionalSummary,
            size: 21, // 10.5pt
            font: 'Calibri',
            color: '1E293B',
          }),
        ],
      })
    );
  }

  // 3. Work Experience
  if (cv.workExperience && cv.workExperience.length > 0) {
    children.push(createSectionHeading('Work Experience'));

    for (const exp of cv.workExperience) {
      // Header line: Job Title - Company | Location ... Dates
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: exp.jobTitle,
              bold: true,
              size: 22,
              font: 'Calibri',
              color: '0F172A',
            }),
            new TextRun({
              text: `  —  ${exp.company}`,
              bold: true,
              size: 22,
              font: 'Calibri',
              color: '334155',
            }),
            ...(exp.location
              ? [
                  new TextRun({
                    text: ` (${exp.location})`,
                    size: 20,
                    font: 'Calibri',
                    color: '64748B',
                  }),
                ]
              : []),
            new TextRun({
              text: `\t${exp.startDate} – ${exp.endDate}`,
              bold: true,
              size: 20,
              font: 'Calibri',
              color: '475569',
            }),
          ],
        })
      );

      // Bullets
      if (exp.bullets && exp.bullets.length > 0) {
        for (const bullet of exp.bullets) {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 30, after: 30 },
              children: [
                new TextRun({
                  text: bullet,
                  size: 21,
                  font: 'Calibri',
                  color: '1E293B',
                }),
              ],
            })
          );
        }
      }
    }
  }

  // 4. Skills
  if (cv.skills && cv.skills.length > 0) {
    children.push(createSectionHeading('Technical & Professional Skills'));

    for (const skCategory of cv.skills) {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: `${skCategory.category}: `,
              bold: true,
              size: 21,
              font: 'Calibri',
              color: '0F172A',
            }),
            new TextRun({
              text: skCategory.skills.join(', '),
              size: 21,
              font: 'Calibri',
              color: '334155',
            }),
          ],
        })
      );
    }
  }

  // 5. Education
  if (cv.education && cv.education.length > 0) {
    children.push(createSectionHeading('Education'));

    for (const edu of cv.education) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22,
              font: 'Calibri',
              color: '0F172A',
            }),
            ...(edu.fieldOfStudy
              ? [
                  new TextRun({
                    text: ` in ${edu.fieldOfStudy}`,
                    bold: true,
                    size: 22,
                    font: 'Calibri',
                    color: '0F172A',
                  }),
                ]
              : []),
            new TextRun({
              text: `  —  ${edu.institution}`,
              size: 21,
              font: 'Calibri',
              color: '334155',
            }),
            new TextRun({
              text: `\t${edu.graduationYear}`,
              bold: true,
              size: 20,
              font: 'Calibri',
              color: '475569',
            }),
          ],
        })
      );
      if (edu.honors) {
        children.push(
          new Paragraph({
            spacing: { before: 20, after: 40 },
            children: [
              new TextRun({
                text: `Honors: ${edu.honors}`,
                italics: true,
                size: 20,
                font: 'Calibri',
                color: '64748B',
              }),
            ],
          })
        );
      }
    }
  }

  // 6. Projects
  if (cv.projects && cv.projects.length > 0) {
    children.push(createSectionHeading('Projects'));

    for (const proj of cv.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 20 },
          children: [
            new TextRun({
              text: proj.title,
              bold: true,
              size: 22,
              font: 'Calibri',
              color: '0F172A',
            }),
            ...(proj.technologies && proj.technologies.length > 0
              ? [
                  new TextRun({
                    text: ` | Technologies: ${proj.technologies.join(', ')}`,
                    italics: true,
                    size: 20,
                    font: 'Calibri',
                    color: '475569',
                  }),
                ]
              : []),
          ],
        })
      );
      children.push(
        new Paragraph({
          spacing: { before: 20, after: 60 },
          children: [
            new TextRun({
              text: proj.description,
              size: 21,
              font: 'Calibri',
              color: '1E293B',
            }),
          ],
        })
      );
    }
  }

  // 7. Certifications
  if (cv.certifications && cv.certifications.length > 0) {
    children.push(createSectionHeading('Certifications & Licenses'));

    for (const cert of cv.certifications) {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: `${cert.name} `,
              bold: true,
              size: 21,
              font: 'Calibri',
              color: '0F172A',
            }),
            new TextRun({
              text: `— ${cert.issuer}`,
              size: 21,
              font: 'Calibri',
              color: '334155',
            }),
            ...(cert.year
              ? [
                  new TextRun({
                    text: ` (${cert.year})`,
                    size: 20,
                    font: 'Calibri',
                    color: '64748B',
                  }),
                ]
              : []),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
