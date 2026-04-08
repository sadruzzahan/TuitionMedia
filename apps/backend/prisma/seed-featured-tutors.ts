/**
 * Featured Tutors Seed Script
 *
 * Creates 8 realistic Bangladesh tutors with is_premium = true so they appear
 * as "Featured" on the landing page and tutor browse page.
 *
 * Usage: npx ts-node -r tsconfig-paths/register prisma/seed-featured-tutors.ts
 * Or via package.json script: pnpm seed:featured
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FEATURED_TUTORS = [
  {
    name: "Dr. Rafiqul Islam",
    email: "rafiqul.islam.tutor@tuitionmedia.com",
    phone: "01711000001",
    bio: "BUET graduate with a PhD in Applied Mathematics. 12 years of experience coaching SSC, HSC, and university-level students. Specialises in making complex calculus and mechanics concepts simple and intuitive.",
    education: "PhD in Applied Mathematics, BUET",
    subjects: ["Mathematics", "Physics", "Higher Mathematics"],
    hourly_rate: 800,
    experience: 12,
    division: "Dhaka",
    areas: ["Dhanmondi", "Mirpur", "Mohammadpur"],
    gender: "Male",
    grade_levels: ["SSC", "HSC", "University", "A-Level"],
    teaching_mode: "both",
    available_days: ["Friday", "Saturday", "Sunday"],
    qualifications: ["PhD Applied Mathematics (BUET)", "BSc Engineering (BUET)", "National Science Olympiad Gold Medal"],
    is_verified: true,
    is_premium: true,
    average_rating: 4.9,
    total_reviews: 47,
    total_students: 183,
    total_hours: 2100,
  },
  {
    name: "Fatema Begum",
    email: "fatema.begum.tutor@tuitionmedia.com",
    phone: "01711000002",
    bio: "MA in English Literature from Dhaka University. Former lecturer at Viqarunnisa Noon College. I help students master English grammar, composition, and literature with patience and clarity.",
    education: "MA English Literature, University of Dhaka",
    subjects: ["English", "Bangla", "Literature"],
    hourly_rate: 500,
    experience: 8,
    division: "Dhaka",
    areas: ["Mirpur", "Pallabi", "Kafrul"],
    gender: "Female",
    grade_levels: ["Primary", "JSC", "SSC", "HSC"],
    teaching_mode: "home",
    available_days: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    qualifications: ["MA English Literature (DU)", "BEd (DU)", "IELTS 8.0"],
    is_verified: true,
    is_premium: true,
    average_rating: 4.8,
    total_reviews: 32,
    total_students: 97,
    total_hours: 860,
  },
  {
    name: "Nasrin Akhter",
    email: "nasrin.akhter.tutor@tuitionmedia.com",
    phone: "01711000003",
    bio: "Software engineer at a top tech firm by day, passionate ICT and Programming tutor by evening. I teach Python, C++, web development, and the ICT board curriculum for SSC/HSC in a practical, project-based way.",
    education: "BSc Computer Science & Engineering, BUET",
    subjects: ["ICT", "Programming", "Mathematics", "Computer Science"],
    hourly_rate: 700,
    experience: 5,
    division: "Dhaka",
    areas: ["Gulshan", "Banani", "Baridhara", "Uttara"],
    gender: "Female",
    grade_levels: ["SSC", "HSC", "University", "O-Level", "A-Level"],
    teaching_mode: "online",
    available_days: ["Friday", "Saturday"],
    qualifications: ["BSc CSE (BUET)", "Google Certified Cloud Developer"],
    is_verified: true,
    is_premium: true,
    average_rating: 4.9,
    total_reviews: 19,
    total_students: 54,
    total_hours: 310,
  },
  {
    name: "Mizanur Rahman",
    email: "mizanur.rahman.tutor@tuitionmedia.com",
    phone: "01711000004",
    bio: "Chartered accountant with 15 years of corporate experience. I break down Accounting and Economics into real-world examples that students actually remember. Excellent track record for board exam preparation.",
    education: "MBA (Finance), IBA, University of Dhaka",
    subjects: ["Accounting", "Economics", "Business Studies", "Finance"],
    hourly_rate: 1000,
    experience: 15,
    division: "Dhaka",
    areas: ["Gulshan", "Tejgaon", "Motijheel", "Banani"],
    gender: "Male",
    grade_levels: ["SSC", "HSC", "University", "BCS", "O-Level", "A-Level"],
    teaching_mode: "both",
    available_days: ["Friday", "Saturday", "Sunday"],
    qualifications: ["MBA Finance (IBA-DU)", "CA (ICAB)", "CFA Level II"],
    is_verified: true,
    is_premium: true,
    average_rating: 4.8,
    total_reviews: 63,
    total_students: 241,
    total_hours: 3800,
  },
  {
    name: "Karim Hossain",
    email: "karim.hossain.tutor@tuitionmedia.com",
    phone: "01711000005",
    bio: "Biology and Chemistry specialist based in Sylhet. MBBS doctor who loves teaching. I prepare students for SSC, HSC, and medical entrance exams. My approach focuses on conceptual understanding and diagram mastery.",
    education: "MBBS, Sylhet MAG Osmani Medical College",
    subjects: ["Biology", "Chemistry", "Physics", "Medical Admission"],
    hourly_rate: 600,
    experience: 6,
    division: "Sylhet",
    areas: ["Sylhet Sadar", "Zindabazar", "Amberkhana"],
    gender: "Male",
    grade_levels: ["SSC", "HSC", "Medical Admission", "A-Level"],
    teaching_mode: "both",
    available_days: ["Thursday", "Friday", "Saturday"],
    qualifications: ["MBBS (Sylhet MAG Osmani Medical College)", "Medical Admission Coaching Specialist"],
    is_verified: true,
    is_premium: true,
    average_rating: 4.7,
    total_reviews: 28,
    total_students: 76,
    total_hours: 520,
  },
  {
    name: "Shirin Sultana",
    email: "shirin.sultana.tutor@tuitionmedia.com",
    phone: "01711000006",
    bio: "Physics and Mathematics tutor in Rajshahi with a passion for nurturing young scientists. Former assistant professor at Rajshahi College. My calm and structured teaching style has helped hundreds pass SSC and HSC with A+.",
    education: "MSc Physics, University of Rajshahi",
    subjects: ["Physics", "Mathematics", "Science"],
    hourly_rate: 450,
    experience: 9,
    division: "Rajshahi",
    areas: ["Rajshahi City", "Shaheb Bazar", "Uposhohor"],
    gender: "Female",
    grade_levels: ["Primary", "JSC", "SSC", "HSC"],
    teaching_mode: "home",
    available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"],
    qualifications: ["MSc Physics (RU)", "BSc Physics (RU)", "10 years academic teaching"],
    is_verified: false,
    is_premium: true,
    average_rating: 4.6,
    total_reviews: 14,
    total_students: 38,
    total_hours: 420,
  },
  {
    name: "Mahmudul Hasan",
    email: "mahmudul.hasan.tutor@tuitionmedia.com",
    phone: "01711000007",
    bio: "BCS cadre (Education) and IELTS specialist. I have helped over 300 students crack the BCS written exam and achieve IELTS scores of 7+. My sessions are highly structured and focus on exam strategy, not just content.",
    education: "MA Linguistics, Chittagong University",
    subjects: ["English", "Bangla", "BCS Preparation", "IELTS", "General Knowledge"],
    hourly_rate: 650,
    experience: 10,
    division: "Chittagong",
    areas: ["Chittagong City", "Agrabad", "Nasirabad", "Halishahar"],
    gender: "Male",
    grade_levels: ["HSC", "University", "BCS", "IELTS"],
    teaching_mode: "both",
    available_days: ["Friday", "Saturday", "Sunday"],
    qualifications: ["MA Linguistics (CU)", "BCS Cadre (Education)", "IELTS 8.5"],
    is_verified: true,
    is_premium: true,
    average_rating: 4.8,
    total_reviews: 41,
    total_students: 128,
    total_hours: 1560,
  },
  {
    name: "Tasneem Chowdhury",
    email: "tasneem.chowdhury.tutor@tuitionmedia.com",
    phone: "01711000008",
    bio: "O-Level and A-Level specialist with Cambridge International experience. Educated in Dhaka and the UK. I teach Mathematics, Further Mathematics, and Physics for Cambridge, Edexcel, and IB students across Bangladesh.",
    education: "BSc Mathematics, University of Manchester (UK)",
    subjects: ["Mathematics", "Further Mathematics", "Physics", "Statistics"],
    hourly_rate: 1200,
    experience: 7,
    division: "Dhaka",
    areas: ["Gulshan", "Baridhara", "Bashundhara", "Uttara"],
    gender: "Female",
    grade_levels: ["O-Level", "A-Level", "IGCSE", "IB"],
    teaching_mode: "online",
    available_days: ["Monday", "Wednesday", "Friday", "Saturday"],
    qualifications: ["BSc Mathematics (University of Manchester)", "Cambridge A-Level Examiner", "IB Diploma Holder"],
    is_verified: true,
    is_premium: true,
    average_rating: 4.9,
    total_reviews: 22,
    total_students: 61,
    total_hours: 580,
  },
];

async function main() {
  console.log("Seeding featured tutors for TuitionMedia...");

  const passwordHash = await bcrypt.hash("TuitionMedia2026!", 12);
  let created = 0;
  let skipped = 0;

  for (const tutorData of FEATURED_TUTORS) {
    const existing = await prisma.user.findUnique({ where: { email: tutorData.email } });
    if (existing) {
      await prisma.tutorProfile.update({
        where: { user_id: existing.id },
        data: { is_premium: true },
      });
      console.log(`  ↻ Already exists, updated to premium: ${tutorData.name}`);
      skipped++;
      continue;
    }

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: tutorData.email,
        name: tutorData.name,
        phone: tutorData.phone,
        password_hash: passwordHash,
        role: "TUTOR",
        is_verified: tutorData.is_verified,
        is_active: true,
        updated_at: new Date(),
      },
    });

    await prisma.tutorProfile.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        bio: tutorData.bio,
        education: tutorData.education,
        subjects: tutorData.subjects,
        hourly_rate: tutorData.hourly_rate,
        experience: tutorData.experience,
        division: tutorData.division,
        areas: tutorData.areas,
        gender: tutorData.gender,
        grade_levels: tutorData.grade_levels,
        teaching_mode: tutorData.teaching_mode,
        available_days: tutorData.available_days,
        qualifications: tutorData.qualifications,
        is_verified: tutorData.is_verified,
        is_profile_public: true,
        is_premium: tutorData.is_premium,
        average_rating: tutorData.average_rating,
        total_reviews: tutorData.total_reviews,
        total_students: tutorData.total_students,
        total_hours: tutorData.total_hours,
        is_online: false,
        updated_at: new Date(),
      },
    });

    console.log(`  ✓ Created featured tutor: ${tutorData.name} (${tutorData.division})`);
    created++;
  }

  console.log(`\nDone! Created ${created} new tutors, updated ${skipped} existing tutors.`);
  console.log("All featured tutors have is_premium = true and will appear on the landing page.");
  console.log("\nLogin password for all seeded tutors: TuitionMedia2026!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
