/**
 * Test Data Seeding Script
 * 
 * Creates 25 tutor profiles and 25 student profiles for testing
 * 
 * Usage: npx ts-node prisma/seed-test-data.ts
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Sample data
const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English", 
  "Bahasa Melayu", "History", "Geography", "Economics", "Accounting",
  "Business Studies", "Computer Science", "Additional Mathematics",
  "Science", "Literature", "Art", "Music", "Physical Education"
];

const locations = [
  "Kuala Lumpur", "Petaling Jaya", "Subang Jaya", "Shah Alam",
  "Bangsar", "Damansara", "Mont Kiara", "Ampang", "Cheras",
  "Puchong", "Klang", "Cyberjaya", "Putrajaya", "Seremban",
  "Johor Bahru", "Penang", "Ipoh", "Malacca", "Kota Kinabalu",
  "Kuching"
];

const educations = [
  "Bachelor of Science, University of Malaya",
  "Master of Engineering, Universiti Teknologi Malaysia",
  "Bachelor of Education, Universiti Putra Malaysia",
  "PhD in Mathematics, University of Cambridge",
  "Bachelor of Arts, Harvard University",
  "Master of Science, MIT",
  "Bachelor of Computer Science, Stanford University",
  "PhD in Physics, Oxford University",
  "Bachelor of Commerce, London School of Economics",
  "Master of Business Administration, INSEAD"
];

const bios = [
  "Experienced tutor with 10+ years helping students achieve excellent results",
  "Passionate educator specializing in exam preparation and study techniques",
  "Former school teacher turned private tutor, patient and understanding",
  "University lecturer offering advanced level tutoring",
  "Young, energetic tutor with modern teaching methods",
  "Bilingual tutor fluent in English and Bahasa Melayu",
  "Special education expert with experience with diverse learning needs",
  "Award-winning teacher with proven track record",
  "Online tutoring specialist with digital teaching tools",
  "Exam marker with inside knowledge of grading criteria"
];

const gradeLevels = [
  "Form 1", "Form 2", "Form 3", "Form 4", "Form 5",
  "Year 7", "Year 8", "Year 9", "Year 10", "Year 11",
  "SPM", "IGCSE O-Levels", "A-Levels", "Foundation", "Diploma"
];

const schools = [
  "SMK Bukit Bintang", "SMK Damansara Jaya", "SMK Subang Jaya",
  "SMK Shah Alam", "SMK Cheras", "SMK Puchong Utama",
  "SMK Bandar Utama", "SMK Taman Tun Dr Ismail", "SMK Sri Hartamas",
  "SMK Victoria Institution", "SMK St. John's Institution",
  "Taylor's College", "Sunway College", "INTI International College",
  "UCSI University", "Asia Pacific University"
];

const goals = [
  "Improve grades from C to A in SPM",
  "Prepare for university entrance exams",
  "Master difficult topics in Mathematics",
  "Build confidence in public speaking",
  "Develop better study habits",
  "Get scholarship-ready results",
  "Overcome exam anxiety",
  "Learn effective time management",
  "Improve understanding of complex concepts",
  "Achieve target scores for university admission"
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomName(): string {
  const firstNames = [
    "Ahmad", "Siti", "Mohamed", "Nur", "Muhammad", "Aisyah",
    "Abdul", "Farah", "Ibrahim", "Mariam", "Hassan", "Zarith",
    "Omar", "Sofia", "Yusof", "Amira", "Khalid", "Nadia",
    "Zain", "Layla", "Rashid", "Hana", "Karim", "Maya"
  ];
  
  const lastNames = [
    "Ibrahim", "Ahmad", "Mohamed", "Hassan", "Omar", "Ali",
    "Rahman", "Hussein", "Mahmoud", "Yusuf", "Khalid", "Saad",
    "Abdullah", "Bakar", "Chong", "Lim", "Tan", "Ng",
    "Wong", "Lee", "Singh", "Kumar", "Patel", "Shah"
  ];
  
  return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
}

function generateRandomEmail(name: string, domain: string): string {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  const randomNum = Math.floor(Math.random() * 1000);
  return `${cleanName}${randomNum}@${domain}`;
}

async function main() {
  console.log("Creating test data...");

  // Create 25 tutors
  console.log("Creating 25 tutor profiles...");
  for (let i = 0; i < 25; i++) {
    const name = generateRandomName();
    const email = generateRandomEmail(name, "testmail.com");
    const passwordHash = await bcrypt.hash("Password123!", 12);
    
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        name,
        password_hash: passwordHash,
        role: "TUTOR",
        is_verified: Math.random() > 0.3, // 70% verified
        is_active: true,
        updated_at: new Date(),
      },
    });

    const tutorSubjects = getRandomElements(subjects, Math.floor(Math.random() * 3) + 2);
    const hourlyRate = Math.floor(Math.random() * 80) + 30; // RM30-RM110

    await prisma.tutorProfile.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        bio: getRandomElement(bios),
        education: getRandomElement(educations),
        subjects: tutorSubjects,
        hourly_rate: hourlyRate,
        location: getRandomElement(locations),
        experience: Math.floor(Math.random() * 15) + 1, // 1-15 years
        qualifications: ["Bachelor Degree", "Teaching Certificate", "Professional Certification"],
        is_verified: Math.random() > 0.4, // 60% verified
        average_rating: Math.random() * 2 + 3, // 3.0-5.0
        total_reviews: Math.floor(Math.random() * 50),
        total_students: Math.floor(Math.random() * 100) + 10,
        total_hours: Math.floor(Math.random() * 500) + 50,
        is_online: Math.random() > 0.5,
        availability: {
          weekdays: true,
          weekends: Math.random() > 0.3,
          evenings: Math.random() > 0.4,
          mornings: Math.random() > 0.6
        },
        updated_at: new Date(),
      },
    });

    // Create some tutor posts
    if (Math.random() > 0.5) {
      await prisma.tutorPost.create({
        data: {
          id: crypto.randomUUID(),
          tutor_id: user.id,
          title: `Expert ${getRandomElement(tutorSubjects)} Tutoring`,
          description: `Professional tutoring for ${getRandomElement(tutorSubjects)}. ${getRandomElement(bios)}`,
          subject: getRandomElement(tutorSubjects),
          level: getRandomElement(["SPM", "IGCSE", "A-Levels", "University"]),
          hourly_rate: hourlyRate,
          mode: getRandomElement(["Online", "Offline", "Hybrid"]),
          location: getRandomElement(locations),
          availability: {
            schedule: "Flexible",
            responseTime: "Within 2 hours"
          },
          is_active: true,
          views: Math.floor(Math.random() * 200),
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within last 30 days
          updated_at: new Date(),
        },
      });
    }
  }

  // Create 25 students
  console.log("Creating 25 student profiles...");
  for (let i = 0; i < 25; i++) {
    const name = generateRandomName();
    const email = generateRandomEmail(name, "studentmail.com");
    const passwordHash = await bcrypt.hash("Password123!", 12);
    
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

    const studentSubjects = getRandomElements(subjects, Math.floor(Math.random() * 4) + 1);

    await prisma.studentProfile.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        grade: getRandomElement(gradeLevels),
        school: getRandomElement(schools),
        subjects: studentSubjects,
        goals: getRandomElement(goals),
        location: getRandomElement(locations),
        budget: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 30 : null, // RM30-RM130 or null
        preferredMode: getRandomElement(["Online", "Offline", "Flexible"]),
        updated_at: new Date(),
      },
    });

    // Create some tuition requests
    if (Math.random() > 0.4) {
      const requestSubjects = getRandomElements(studentSubjects, Math.min(2, studentSubjects.length));
      
      await prisma.tuitionRequest.create({
        data: {
          id: crypto.randomUUID(),
          studentId: user.id,
          title: `Need help with ${requestSubjects.join(" & ")}`,
          description: `Looking for an experienced tutor for ${requestSubjects.join(" and ")}. ${getRandomElement(goals)}.`,
          subject: requestSubjects[0]!,
          level: getRandomElement(["SPM", "IGCSE", "Form 4", "Form 5"]),
          mode: getRandomElement(["Online", "Offline", "Flexible"]),
          location: getRandomElement(locations),
          budget: Math.random() > 0.5 ? Math.floor(Math.random() * 80) + 30 : null,
          duration: Math.floor(Math.random() * 4) + 1, // 1-4 hours per session
          schedule: {
            preferredDays: getRandomElements(["Weekdays", "Weekends", "Saturday", "Sunday"], 2),
            preferredTime: getRandomElement(["Morning", "Afternoon", "Evening", "Flexible"])
          },
          status: getRandomElement(["OPEN", "IN_PROGRESS", "CLOSED"]),
          createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Random within last 14 days
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log("✅ Test data creation completed!");
  console.log("Created:");
  console.log("- 25 tutor profiles with posts");
  console.log("- 25 student profiles with tuition requests");
  console.log("\nLogin credentials (password: Password123! for all):");
  
  const tutors = await prisma.user.findMany({ 
    where: { role: "TUTOR" },
    select: { email: true, name: true },
    take: 5
  });
  
  const students = await prisma.user.findMany({ 
    where: { role: "STUDENT" },
    select: { email: true, name: true },
    take: 5
  });
  
  console.log("\nSample Tutors:");
  tutors.forEach(tutor => console.log(`- ${tutor.name}: ${tutor.email}`));
  
  console.log("\nSample Students:");
  students.forEach(student => console.log(`- ${student.name}: ${student.email}`));
}

main()
  .catch((e) => {
    console.error("Error creating test data:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
