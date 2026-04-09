/**
 * Bangladesh Seed Script
 * Populates the database with Bangladeshi tutor profiles and student tuition requests
 */

const { PrismaClient } = require('../../../node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_typescript@5.6.3__typescript@5.6.3/node_modules/@prisma/client');
const bcrypt = require('../../../node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

const DIVISIONS = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet", "Rangpur", "Barisal", "Mymensingh"];

const AREAS_BY_DIVISION = {
  Dhaka: ["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara", "Bashundhara", "Mohammadpur", "Rampura", "Badda", "Tejgaon", "Motijheel", "Shahbag", "Wari", "Old Dhaka"],
  Chittagong: ["Agrabad", "GEC Circle", "Nasirabad", "Panchlaish", "Halishahar", "Khulshi", "Anderkilla", "Kotwali", "Bakalia", "Chawkbazar"],
  Rajshahi: ["Boalia", "Motihar", "Shah Makhdum", "Rajpara", "Paba", "Godagari"],
  Khulna: ["Sonadanga", "Khalishpur", "Daulatpur", "Khan Jahan Ali", "Rupsha", "Boyra"],
  Sylhet: ["Zindabazar", "Ambarkhana", "Shibganj", "Laldighirpar", "Bandarbazar", "Uposhohor"],
  Rangpur: ["Guptapara", "Mahiganj", "Shapla Chottar", "Lalbag", "Dhap", "Khamar"],
  Barisal: ["Natullabad", "Sadar", "Chawkbazar", "Airport Road", "Rupatali"],
  Mymensingh: ["Ganginarpar", "Mashkanda", "Akua", "Sheshmore", "Notun Bazar"],
};

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "Bangla", "History", "Geography", "Economics", "Accounting",
  "Business Studies", "Computer Science", "Higher Mathematics",
  "ICT", "Agriculture", "Home Science", "General Science",
  "Islamic Studies", "Civics", "Social Science"
];

const GRADE_LEVELS = [
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "SSC", "HSC", "Alim", "Dakhil", "JSC", "Degree", "Honours"
];

const TEACHING_MODES = ["Online", "Offline", "Both"];
const AVAILABLE_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const EDUCATIONS = [
  "B.Sc in Mathematics, University of Dhaka",
  "M.Sc in Physics, Bangladesh University of Engineering and Technology (BUET)",
  "B.Ed, Teachers Training College, Dhaka",
  "M.Sc in Chemistry, Rajshahi University",
  "B.Sc in Computer Science, BUET",
  "MBA, University of Dhaka",
  "B.Sc in Biology, Chittagong University",
  "M.Phil in English, University of Dhaka",
  "B.A (Hons) in Bangla, Jahangirnagar University",
  "M.Sc in Economics, Dhaka University",
  "B.Sc Engineering, KUET",
  "M.Sc in Mathematics, Sylhet Agricultural University",
  "B.Sc in Microbiology, NSU",
  "M.B.A, IBA, University of Dhaka",
  "B.Sc in Physics, SUST",
];

const BIOS = [
  "Experienced tutor with over 8 years of teaching Mathematics and Physics to SSC and HSC students. My students consistently achieve A+ grades.",
  "Passionate about making Chemistry easy to understand. I use visual aids and practical examples to help students grasp difficult concepts.",
  "Former school teacher with 12 years of experience. I specialize in helping students overcome exam anxiety and build strong foundations.",
  "BUET graduate offering expert tutoring in Higher Mathematics and Physics. I have helped over 150 students get into top universities.",
  "English language specialist. I focus on grammar, writing skills, and spoken English to prepare students for exams and real life.",
  "Young and energetic tutor who connects with students. I use modern techniques and digital tools to make learning fun and effective.",
  "Dedicated tutor focusing on SSC preparation. I provide detailed notes, practice papers, and weekly assessments for all my students.",
  "Experienced HSC tutor for Science group. I have an excellent track record with students getting GPA 5.00 consistently.",
  "Patient and methodical tutor for students struggling with Mathematics. I break down complex topics into simple, easy-to-follow steps.",
  "Expert in Biology and Chemistry with 7 years of experience. I specialize in medical admission preparation and HSC board exams.",
  "Professional tutor offering comprehensive support for JSC, SSC, and HSC students across multiple subjects.",
  "Qualified teacher with strong knowledge of the Bangladesh national curriculum. I offer tailored lessons based on each student's needs.",
  "Results-driven tutor with a passion for Economics and Accounting. My students have achieved excellent results in board exams.",
  "Computer Science and ICT specialist. I make technology fun and accessible for students at all levels.",
  "Dedicated Bangla and English tutor helping students improve their language skills and score high in board examinations.",
];

const QUALIFICATIONS_POOL = [
  ["B.Sc (Honours)", "M.Sc", "BED", "10+ Years Experience"],
  ["BUET Graduate", "5 Years Teaching Experience", "Board Exam Specialist"],
  ["University of Dhaka Graduate", "Certified Teacher", "Exam Paper Setter"],
  ["Honours Graduate", "Teaching Certificate", "Home Tutor"],
  ["Masters Graduate", "Subject Specialist", "100+ Students Taught"],
];

const TUTOR_MALE_NAMES = [
  "Mohammad Rakibul Islam", "Abdullah Al Mamun", "Md. Farhan Ahmed",
  "Tanvir Hassan", "Rafiqul Islam", "Mahmudul Hasan", "Sohel Rana",
  "Imran Hossain", "Ariful Islam", "Nazrul Islam", "Jahangir Alam",
  "Kamal Uddin", "Rezaul Karim", "Shafiqul Islam", "Omar Faruk",
  "Mujibur Rahman", "Habibur Rahman", "Shahadat Hossain",
];

const TUTOR_FEMALE_NAMES = [
  "Fatema Begum", "Sumaiya Akter", "Nasrin Sultana", "Shahnaz Parvin",
  "Roksana Khanam", "Tamanna Islam", "Sabrina Yasmin", "Nusrat Jahan",
  "Meherunnahar Begum", "Sadia Islam", "Umme Habiba", "Dilruba Yeasmin",
];

const STUDENT_MALE_NAMES = [
  "Rifat Hossain", "Sakib Ahmed", "Raihan Islam", "Nahid Hassan",
  "Tahmid Rahman", "Asif Iqbal", "Jubayer Ahmed", "Minhaj Uddin",
  "Shadman Sakib", "Adib Hasan", "Touhid Islam", "Rafi Uddin",
];

const STUDENT_FEMALE_NAMES = [
  "Lamia Akter", "Tasnia Islam", "Fariha Noor", "Maliha Rahman",
  "Anika Sultana", "Ishrat Jahan", "Sidratul Muntaha", "Tahsin Akter",
  "Maisha Khanam", "Fahmida Begum", "Nadia Islam", "Sinthia Akter",
  "Sumaiya Parvin",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple(arr, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeEmail(name, suffix) {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.');
  return `${clean}${randomInt(1, 999)}@${suffix}`;
}

// randomuser.me portrait URLs — 70 male + 45 female
const MALE_AVATARS = Array.from({ length: 70 }, (_, i) => `https://randomuser.me/api/portraits/men/${i + 1}.jpg`);
const FEMALE_AVATARS = Array.from({ length: 45 }, (_, i) => `https://randomuser.me/api/portraits/women/${i + 1}.jpg`);

let maleAvatarIdx = 0;
let femaleAvatarIdx = 0;

function getMaleAvatar() {
  return MALE_AVATARS[maleAvatarIdx++ % MALE_AVATARS.length];
}
function getFemaleAvatar() {
  return FEMALE_AVATARS[femaleAvatarIdx++ % FEMALE_AVATARS.length];
}

const TUITION_REQUEST_TITLES = [
  "Need an experienced {subject} tutor for {level}",
  "Looking for a {subject} teacher for my child ({level})",
  "Urgent: {subject} home tutor required for {level} student",
  "Searching for a qualified {subject} tutor for {level} exam prep",
  "Home tutor needed for {subject} — {level} student",
  "Want a dedicated {subject} tutor to help improve grades in {level}",
  "Require {subject} tutoring help for upcoming {level} board exam",
];

const TUITION_REQUEST_DESCRIPTIONS = [
  "My {child} is currently in {level} and needs extra help with {subject}. We prefer {mode} tutoring sessions of about {hours} hours per week. Looking for someone patient and experienced with the Bangladesh national curriculum.",
  "Searching for a qualified {subject} tutor who can help prepare for the {level} board examination. We need someone available on {days}. Budget is around ৳{budget} per month.",
  "Our {child} struggles with {subject} and we want to get them back on track before the exams. Preferably someone with experience in {level} students and familiar with board exam patterns.",
  "Need an experienced {subject} tutor for {level} preparation. The student is dedicated but needs guidance on tough topics and practice problems. {mode} sessions preferred.",
  "Looking for a capable tutor to help our {child} in {subject}. The student has upcoming {level} exams and needs focused preparation. Sessions should be {hours} hours per sitting.",
];

const STUDENT_GOALS = [
  "Achieve GPA 5.00 in SSC",
  "Pass the medical admission test",
  "Get into BUET or a top engineering university",
  "Improve grades from failing to passing",
  "Score A+ in all subjects in HSC",
  "Master difficult chapters in Higher Mathematics",
  "Build confidence and reduce exam anxiety",
  "Learn English fluently for future studies abroad",
  "Prepare thoroughly for board examinations",
  "Improve understanding of Science subjects",
];

function formatRequestTitle(subject, level) {
  const template = pick(TUITION_REQUEST_TITLES);
  return template.replace("{subject}", subject).replace("{level}", level);
}

function formatRequestDescription(subject, level, mode) {
  const template = pick(TUITION_REQUEST_DESCRIPTIONS);
  const child = pick(["child", "son", "daughter", "sibling"]);
  const days = pickMultiple(["weekdays", "weekends", "Saturdays", "Sundays", "evenings"], 1, 2).join(" and ");
  const budget = pick([800, 1000, 1200, 1500, 2000, 2500, 3000]);
  const hours = pick([1, 1.5, 2]);
  return template
    .replace("{child}", child)
    .replace("{level}", level)
    .replace("{subject}", subject)
    .replace("{mode}", mode)
    .replace("{days}", days)
    .replace("{budget}", budget)
    .replace("{hours}", hours);
}

async function main() {
  console.log("🇧🇩 Starting Bangladesh data seeding...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // ─── Create 30 tutors ────────────────────────────────────────────────────────
  console.log("\n📚 Creating 30 tutor profiles...");
  const tutorIds = [];

  const allTutorNames = [...TUTOR_MALE_NAMES, ...TUTOR_FEMALE_NAMES];
  const shuffledTutorNames = [...allTutorNames].sort(() => Math.random() - 0.5).slice(0, 30);

  for (let i = 0; i < 30; i++) {
    const name = shuffledTutorNames[i];
    const isMale = TUTOR_MALE_NAMES.includes(name);
    const email = makeEmail(name, "tutormail.bd");
    const gender = isMale ? "Male" : "Female";
    const avatarUrl = isMale ? getMaleAvatar() : getFemaleAvatar();

    const division = pick(DIVISIONS);
    const areas = pickMultiple(AREAS_BY_DIVISION[division] || ["Sadar"], 1, 3);
    const subjects = pickMultiple(SUBJECTS, 2, 4);
    const gradeLevels = pickMultiple(GRADE_LEVELS, 2, 4);
    const teachingMode = pick(TEACHING_MODES);
    const availableDays = pickMultiple(AVAILABLE_DAYS, 3, 5);
    const experience = randomInt(1, 15);
    const hourlyRate = pick([300, 400, 500, 600, 700, 800, 1000, 1200, 1500]);
    const isVerified = Math.random() > 0.35;
    const isPremium = Math.random() > 0.8;
    const avgRating = Math.random() > 0.3 ? parseFloat((Math.random() * 1.5 + 3.5).toFixed(2)) : null;
    const totalReviews = avgRating ? randomInt(3, 60) : 0;

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        name,
        avatar_url: avatarUrl,
        password_hash: passwordHash,
        role: "TUTOR",
        is_verified: isVerified,
        is_active: true,
        updated_at: new Date(),
      },
    });

    await prisma.tutorProfile.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        bio: pick(BIOS),
        education: pick(EDUCATIONS),
        subjects,
        hourly_rate: hourlyRate,
        division,
        areas,
        experience,
        grade_levels: gradeLevels,
        teaching_mode: teachingMode,
        available_days: availableDays,
        qualifications: pick(QUALIFICATIONS_POOL),
        is_verified: isVerified,
        is_premium: isPremium,
        is_profile_public: true,
        average_rating: avgRating,
        total_reviews: totalReviews,
        total_students: randomInt(5, 120),
        total_hours: randomInt(20, 800),
        is_online: Math.random() > 0.4,
        gender,
        updated_at: new Date(),
      },
    });

    tutorIds.push(user.id);
    process.stdout.write(`  ✓ ${name}\n`);
  }

  // ─── Create 25 students with tuition requests ─────────────────────────────
  console.log("\n🎓 Creating 25 student profiles with tuition requests...");

  const allStudentNames = [...STUDENT_MALE_NAMES, ...STUDENT_FEMALE_NAMES];
  const shuffledStudentNames = [...allStudentNames].sort(() => Math.random() - 0.5).slice(0, 25);

  for (let i = 0; i < 25; i++) {
    const name = shuffledStudentNames[i];
    const email = makeEmail(name, "studentmail.bd");
    const division = pick(DIVISIONS);
    const areas = pickMultiple(AREAS_BY_DIVISION[division] || ["Sadar"], 1, 2);
    const subjects = pickMultiple(SUBJECTS, 1, 3);
    const grade = pick(GRADE_LEVELS);
    const budget = pick([500, 800, 1000, 1200, 1500, 2000, 2500, null]);
    const mode = pick(["Online", "Offline", "Both"]);

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        name,
        password_hash: passwordHash,
        role: "STUDENT",
        is_verified: false,
        is_active: true,
        updated_at: new Date(),
      },
    });

    await prisma.studentProfile.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        grade,
        subjects,
        goals: pick(STUDENT_GOALS),
        preferredMode: mode,
        division,
        areas,
        updated_at: new Date(),
      },
    });

    // Create 1-2 tuition requests per student
    const requestCount = Math.random() > 0.4 ? 2 : 1;
    for (let r = 0; r < requestCount; r++) {
      const reqSubject = pick(subjects);
      const reqLevel = grade;
      const reqMode = mode;
      const status = pick(["OPEN", "OPEN", "OPEN", "IN_PROGRESS", "CLOSED"]);

      await prisma.tuitionRequest.create({
        data: {
          studentId: user.id,
          title: formatRequestTitle(reqSubject, reqLevel),
          description: formatRequestDescription(reqSubject, reqLevel, reqMode),
          subjects: pickMultiple(subjects, 1, subjects.length),
          level: reqLevel,
          mode: reqMode,
          division,
          area: areas[0],
          budget: budget ? budget : null,
          duration: pick([1, 1, 2, 3]),
          schedule: {
            preferredDays: pickMultiple(["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], 2, 3),
            preferredTime: pick(["Morning", "Afternoon", "Evening", "Flexible"]),
          },
          status,
          createdAt: new Date(Date.now() - randomInt(0, 20) * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      });
    }

    process.stdout.write(`  ✓ ${name}\n`);
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  const tutorCount = await prisma.tutorProfile.count();
  const studentCount = await prisma.studentProfile.count();
  const requestCount = await prisma.tuitionRequest.count();

  console.log("\n✅ Seeding complete!");
  console.log(`   Tutors:           ${tutorCount}`);
  console.log(`   Students:         ${studentCount}`);
  console.log(`   Tuition Requests: ${requestCount}`);
  console.log("\n   All accounts password: Password123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
