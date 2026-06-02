import puppeteer from "puppeteer";
import { supabase } from "../lib/supabase";
import { AppError } from "../lib/errors";

interface SchoolInfo {
  name: string;
  city: string;
  state: string;
}

interface StudentRow {
  name: string;
  class_grade: string;
  gender: string;
  medium: string;
  mobile: string;
  schools: SchoolInfo | SchoolInfo[] | null;
}

interface MarkRow {
  subject: string;
  marks: number;
  total_marks: number;
  exam_term: string;
}

interface TeacherAssessmentRow {
  curiosity: number;
  communication: number;
  leadership: number;
  persistence: number;
  creativity: number;
  observation_note: string | null;
}

interface CareerInfo {
  title: string;
  cluster: string;
  salary_range: string;
  growth_trend: string;
  entry_path: string;
  description: string;
}

interface CareerMatchRow {
  match_score: number;
  rank: number;
  reasoning: string;
  careers: CareerInfo | CareerInfo[] | null;
}

interface ReportHtmlInput {
  studentInitials: string;
  student: StudentRow;
  marks: MarkRow[];
  avgMarks: number;
  grade: string;
  strongestSubject: MarkRow;
  weakestSubject: MarkRow;
  assessment: TeacherAssessmentRow | null;
  careerMatches: CareerMatchRow[];
  actionPlan: string[];
  reportId: string;
  generatedDate: string;
}

function unwrapCareer(
  careers: CareerInfo | CareerInfo[] | null
): CareerInfo | null {
  if (!careers) return null;
  return Array.isArray(careers) ? careers[0] ?? null : careers;
}

function formatSchool(schools: StudentRow["schools"]): string {
  if (!schools) return "N/A";
  const school = Array.isArray(schools) ? schools[0] : schools;
  if (!school) return "N/A";
  return `${school.name}, ${school.city}, ${school.state}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function gradeFromAverage(avgMarks: number): string {
  if (avgMarks >= 90) return "A+";
  if (avgMarks >= 80) return "A";
  if (avgMarks >= 70) return "B+";
  if (avgMarks >= 60) return "B";
  if (avgMarks >= 50) return "C";
  return "D";
}

function buildActionPlan(
  weakestSubject: MarkRow | null,
  topCareer: CareerInfo | null
): string[] {
  const actionPlan: string[] = [];

  if (weakestSubject && weakestSubject.marks < 60) {
    actionPlan.push(
      `Focus on improving ${weakestSubject.subject} from ${weakestSubject.marks} to 70+ in next semester. Dedicate 30 minutes daily to practice.`
    );
  }

  if (topCareer) {
    if (
      topCareer.title.includes("Engineer") ||
      topCareer.title.includes("Scientist")
    ) {
      actionPlan.push(
        "Start learning basic programming. Free resources: CodeWithHarry on YouTube (Hindi). Build one small project by next year."
      );
      actionPlan.push(
        "Choose Science stream (PCM) in Class 11. Mathematics and Computer Science are essential."
      );
    } else if (
      topCareer.title.includes("Doctor") ||
      topCareer.title.includes("Nurse")
    ) {
      actionPlan.push(
        "Choose Science stream (PCB) in Class 11. Biology is the most important subject for medical careers."
      );
      actionPlan.push(
        "Start NEET preparation from Class 11. Target score: 600+ for government medical college admission."
      );
    } else {
      actionPlan.push(
        `Research more about ${topCareer.title} career path. Talk to people working in this field.`
      );
      actionPlan.push(`Focus on the entry path: ${topCareer.entry_path}`);
    }
  }

  actionPlan.push(
    "Participate in school competitions related to your interest areas to build confidence and practical skills."
  );

  actionPlan.push(
    `Parents: Support your child's interest in ${topCareer?.title || "their chosen field"}. This career offers ${topCareer?.salary_range || "good"} salary with ${topCareer?.growth_trend || "stable"} growth.`
  );

  return actionPlan;
}

export function generateReportHTML(input: ReportHtmlInput): string {
  const {
    studentInitials,
    student,
    marks,
    avgMarks,
    grade,
    strongestSubject,
    weakestSubject,
    assessment,
    careerMatches,
    actionPlan,
    reportId,
    generatedDate,
  } = input;

  const schoolLabel = escapeHtml(formatSchool(student.schools));
  const marksRows = marks
    .map(
      (mark) => `
      <tr>
        <td>${escapeHtml(mark.subject)}</td>
        <td>${escapeHtml(mark.exam_term)}</td>
        <td>${mark.marks} / ${mark.total_marks}</td>
        <td>${Math.round((mark.marks / mark.total_marks) * 100)}%</td>
      </tr>`
    )
    .join("");

  const careerCards = careerMatches
    .map((match) => {
      const career = unwrapCareer(match.careers);
      if (!career) return "";
      const medal =
        match.rank === 1 ? "1st" : match.rank === 2 ? "2nd" : "3rd";
      return `
      <div class="career-card ${match.rank === 1 ? "featured" : ""}">
        <div class="career-header">
          <span class="rank-badge">${medal} Match</span>
          <span class="match-score">${match.match_score}% match</span>
        </div>
        <h3>${escapeHtml(career.title)}</h3>
        <p class="meta">${escapeHtml(career.cluster)} · ${escapeHtml(career.growth_trend)} growth · ${escapeHtml(career.salary_range)}</p>
        <p class="desc">${escapeHtml(career.description)}</p>
        <p class="entry"><strong>Entry path:</strong> ${escapeHtml(career.entry_path)}</p>
        <p class="reason"><strong>Why this matches:</strong> ${escapeHtml(match.reasoning)}</p>
      </div>`;
    })
    .join("");

  const assessmentSection = assessment
    ? `
    <section class="section">
      <h2>Teacher Assessment</h2>
      <div class="traits">
        ${[
          ["Curiosity", assessment.curiosity],
          ["Communication", assessment.communication],
          ["Leadership", assessment.leadership],
          ["Persistence", assessment.persistence],
          ["Creativity", assessment.creativity],
        ]
          .map(
            ([label, score]) => `
          <div class="trait">
            <div class="trait-label">${label}</div>
            <div class="trait-bar"><div class="trait-fill" style="width:${(Number(score) / 5) * 100}%"></div></div>
            <div class="trait-score">${score}/5</div>
          </div>`
          )
          .join("")}
      </div>
      ${
        assessment.observation_note
          ? `<p class="note"><strong>Teacher note:</strong> ${escapeHtml(assessment.observation_note)}</p>`
          : ""
      }
    </section>`
    : "";

  const actionItems = actionPlan
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CareerLens Report ${escapeHtml(reportId)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.5;
    }
    .page { padding: 0; }
    .header {
      background: linear-gradient(135deg, #0a0f1e 0%, #1a1040 100%);
      color: #f9fafb;
      padding: 28px 32px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .brand { font-size: 22px; font-weight: 700; color: #00d4ff; }
    .report-meta { text-align: right; font-size: 11px; color: #9ca3af; }
    .student-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 20px;
    }
    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #00d4ff;
      color: #0a0f1e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
    }
    .student-name { font-size: 24px; font-weight: 700; }
    .student-sub { color: #9ca3af; margin-top: 4px; }
    .section { margin-bottom: 22px; page-break-inside: avoid; }
    .section h2 {
      font-size: 16px;
      color: #0a0f1e;
      border-bottom: 2px solid #00d4ff;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .stat {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }
    .stat-label { font-size: 10px; color: #6b7280; text-transform: uppercase; }
    .stat-value { font-size: 20px; font-weight: 700; color: #00b8db; margin-top: 4px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 8px 10px;
      text-align: left;
    }
    th { background: #111827; color: #f9fafb; font-size: 11px; }
    tr:nth-child(even) { background: #f9fafb; }
    .career-card {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .career-card.featured {
      border-color: #f5a623;
      background: #fffbeb;
    }
    .career-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .rank-badge {
      background: #00d4ff;
      color: #0a0f1e;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
    }
    .match-score { color: #00b8db; font-weight: 700; }
    .career-card h3 { font-size: 15px; margin-bottom: 4px; }
    .meta { color: #6b7280; font-size: 11px; margin-bottom: 8px; }
    .desc, .entry, .reason { margin-top: 6px; font-size: 11px; }
    .traits { display: grid; gap: 8px; }
    .trait { display: grid; grid-template-columns: 100px 1fr 40px; gap: 8px; align-items: center; }
    .trait-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 999px;
      overflow: hidden;
    }
    .trait-fill { height: 100%; background: #00d4ff; border-radius: 999px; }
    .note { margin-top: 10px; padding: 10px; background: #f3f4f6; border-radius: 8px; }
    .action-plan { padding-left: 18px; }
    .action-plan li { margin-bottom: 8px; }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <div class="brand">CareerLens</div>
        <div class="report-meta">
          <div>Report ID: ${escapeHtml(reportId)}</div>
          <div>Generated: ${escapeHtml(generatedDate)}</div>
        </div>
      </div>
      <div class="student-row">
        <div class="avatar">${escapeHtml(studentInitials)}</div>
        <div>
          <div class="student-name">${escapeHtml(student.name)}</div>
          <div class="student-sub">
            Class ${escapeHtml(String(student.class_grade))} · ${escapeHtml(student.gender)} · ${escapeHtml(student.medium)} medium<br/>
            ${schoolLabel} · ${escapeHtml(student.mobile)}
          </div>
        </div>
      </div>
    </div>

    <section class="section">
      <h2>Academic Summary</h2>
      <div class="stats">
        <div class="stat"><div class="stat-label">Average Marks</div><div class="stat-value">${avgMarks}%</div></div>
        <div class="stat"><div class="stat-label">Overall Grade</div><div class="stat-value">${grade}</div></div>
        <div class="stat"><div class="stat-label">Strongest</div><div class="stat-value" style="font-size:14px">${escapeHtml(strongestSubject.subject)} (${strongestSubject.marks})</div></div>
        <div class="stat"><div class="stat-label">Needs Focus</div><div class="stat-value" style="font-size:14px">${escapeHtml(weakestSubject.subject)} (${weakestSubject.marks})</div></div>
      </div>
    </section>

    <section class="section">
      <h2>Subject Marks</h2>
      <table>
        <thead>
          <tr><th>Subject</th><th>Exam Term</th><th>Score</th><th>Percentage</th></tr>
        </thead>
        <tbody>${marksRows}</tbody>
      </table>
    </section>

    ${assessmentSection}

    <section class="section">
      <h2>Top Career Matches</h2>
      ${careerCards || "<p>No career matches available.</p>"}
    </section>

    <section class="section">
      <h2>Personalized Action Plan</h2>
      <ul class="action-plan">${actionItems}</ul>
    </section>

    <div class="footer">
      CareerLens · AI-powered career guidance for Class 6–12 students · Confidential student report
    </div>
  </div>
</body>
</html>`;
}

async function renderPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function generateStudentReport(studentId: string): Promise<{
  pdf: Buffer;
  reportId: string;
  filename: string;
}> {
  const [studentResult, marksResult, assessmentResult, careerMatchesResult] =
    await Promise.all([
      supabase
        .from("students")
        .select(
          "name, class_grade, gender, medium, mobile, schools(name, city, state)"
        )
        .eq("id", studentId)
        .single(),

      supabase
        .from("marks")
        .select("subject, marks, total_marks, exam_term")
        .eq("student_id", studentId),

      supabase
        .from("teacher_assessments")
        .select(
          "curiosity, communication, leadership, persistence, creativity, observation_note"
        )
        .eq("student_id", studentId)
        .maybeSingle(),

      supabase
        .from("career_matches")
        .select(
          "match_score, rank, reasoning, careers(title, cluster, salary_range, growth_trend, entry_path, description)"
        )
        .eq("student_id", studentId)
        .order("rank"),
    ]);

  if (studentResult.error || !studentResult.data) {
    throw new AppError(studentResult.error?.message ?? "Student not found", 404);
  }

  if (marksResult.error) {
    throw new AppError(marksResult.error.message, 500);
  }

  if (assessmentResult.error) {
    throw new AppError(assessmentResult.error.message, 500);
  }

  if (careerMatchesResult.error) {
    throw new AppError(careerMatchesResult.error.message, 500);
  }

  const marks = (marksResult.data ?? []) as MarkRow[];

  if (marks.length === 0) {
    throw new AppError(
      "Please enter your marks before generating a report.",
      400
    );
  }

  const careerMatches = (careerMatchesResult.data ?? []) as CareerMatchRow[];

  if (careerMatches.length === 0) {
    throw new AppError(
      "Please complete the career quiz before generating a report.",
      400
    );
  }

  const student = studentResult.data as StudentRow;
  const assessment = (assessmentResult.data as TeacherAssessmentRow | null) ?? null;

  const avgMarks = Math.round(
    marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length
  );
  const grade = gradeFromAverage(avgMarks);
  const sortedMarks = [...marks].sort((a, b) => b.marks - a.marks);
  const strongestSubject = sortedMarks[0];
  const weakestSubject = sortedMarks[sortedMarks.length - 1];

  const reportId = `CL-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const generatedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const studentInitials = student.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const topCareer = unwrapCareer(careerMatches[0]?.careers ?? null);
  const actionPlan = buildActionPlan(weakestSubject, topCareer);

  const htmlContent = generateReportHTML({
    studentInitials,
    student,
    marks,
    avgMarks,
    grade,
    strongestSubject,
    weakestSubject,
    assessment,
    careerMatches,
    actionPlan,
    reportId,
    generatedDate,
  });

  const pdf = await renderPdf(htmlContent);
  const filename = `CareerLens-Report-${reportId}.pdf`;

  return { pdf, reportId, filename };
}
