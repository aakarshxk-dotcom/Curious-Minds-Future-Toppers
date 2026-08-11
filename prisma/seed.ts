import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/auth'

async function main() {
  console.log('🌱 Seeding FUTURE TOPPERS database...\n')

  // ─── Clean existing data (reverse dependency order) ───
  console.log('🗑️  Cleaning existing data...')
  await db.chatMessage.deleteMany()
  await db.courseProgress.deleteMany()
  await db.enrollment.deleteMany()
  await db.notification.deleteMany()
  await db.review.deleteMany()
  await db.video.deleteMany()
  await db.chapter.deleteMany()
  await db.course.deleteMany()
  await db.galleryItem.deleteMany()
  await db.faculty.deleteMany()
  await db.liveSession.deleteMany()
  await db.payment.deleteMany()
  await db.contactMessage.deleteMany()
  await db.user.deleteMany()
  console.log('✅ Existing data cleaned\n')

  // ─── 1. Create Users (upsert to handle re-runs safely) ───
  console.log('👤 Creating users...')

  const adminPassword = hashPassword('admin123')
  const studentPassword = hashPassword('student123')

  const admin = await db.user.upsert({
    where: { email: 'admin@futuretoppers.in' },
    update: {},
    create: {
      email: 'admin@futuretoppers.in',
      password: adminPassword,
      name: 'FUTURE TOPPERS Admin',
      role: 'admin',
      isVerified: true,
    },
  })

  const student = await db.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      email: 'student@demo.com',
      password: studentPassword,
      name: 'Rahul Kumar',
      phone: '9876543210',
      role: 'student',
      isVerified: true,
    },
  })

  const rahul = await db.user.upsert({
    where: { email: 'rahul@test.com' },
    update: {},
    create: {
      email: 'rahul@test.com',
      password: studentPassword,
      name: 'Rahul Sharma',
      phone: '9876543211',
      role: 'student',
      isVerified: true,
    },
  })

  const priya = await db.user.upsert({
    where: { email: 'priya@test.com' },
    update: {},
    create: {
      email: 'priya@test.com',
      password: studentPassword,
      name: 'Priya Kumari',
      phone: '9876543212',
      role: 'student',
      isVerified: true,
    },
  })

  const amit = await db.user.upsert({
    where: { email: 'amit@test.com' },
    update: {},
    create: {
      email: 'amit@test.com',
      password: studentPassword,
      name: 'Amit Patel',
      phone: '9876543213',
      role: 'student',
      isVerified: true,
    },
  })

  console.log(`  ✅ Admin:    ${admin.email}`)
  console.log(`  ✅ Student:  ${student.email}`)
  console.log(`  ✅ Student:  ${rahul.email}`)
  console.log(`  ✅ Student:  ${priya.email}`)
  console.log(`  ✅ Student:  ${amit.email}\n`)

  // ─── 2. Create Courses ───
  console.log('📚 Creating courses...')

  const mathClass10 = await db.course.create({
    data: {
      title: 'Complete Mathematics for Class 10',
      description:
        'Master all Class 10 mathematics topics including real numbers, polynomials, quadratic equations, arithmetic progressions, triangles, coordinate geometry, trigonometry, circles, and statistics. Perfect for CBSE/ICSE board exam preparation with solved examples and practice problems.',
      thumbnail: 'https://placehold.co/800x450/10b981/white?text=Class+10+Maths',
      price: 0,
      category: 'Maths',
      status: 'published',
      level: 'beginner',
      duration: '35 hours',
      featured: true,
    },
  })

  const scienceMastery = await db.course.create({
    data: {
      title: 'Science Mastery - Physics & Chemistry',
      description:
        'Comprehensive science course covering physics (light, electricity, magnetic effects of current) and chemistry (chemical reactions, acids & bases, metals & non-metals, carbon compounds). Designed for Class 10 students preparing for board exams.',
      thumbnail: 'https://placehold.co/800x450/3b82f6/white?text=Science+Mastery',
      price: 499,
      category: 'Science',
      status: 'published',
      level: 'beginner',
      duration: '40 hours',
      featured: false,
    },
  })

  const englishGrammar = await db.course.create({
    data: {
      title: 'English Grammar Pro',
      description:
        'Build rock-solid English grammar skills. Covers parts of speech, tenses, active & passive voice, direct & indirect speech, clauses, determiners, and more. Includes writing practice with essays, letters, and comprehension passages.',
      thumbnail: 'https://placehold.co/800x450/f59e0b/white?text=English+Grammar+Pro',
      price: 299,
      category: 'English',
      status: 'published',
      level: 'beginner',
      duration: '25 hours',
      featured: false,
    },
  })

  const advCalculus = await db.course.create({
    data: {
      title: 'Advanced Mathematics - Calculus',
      description:
        'Deep dive into calculus covering limits, continuity, derivatives, integration, and differential equations. Ideal for Class 11-12 students and competitive exam aspirants (JEE/NEET). Includes numerical methods and applications.',
      thumbnail: 'https://placehold.co/800x450/8b5cf6/white?text=Advanced+Calculus',
      price: 999,
      category: 'Maths',
      status: 'published',
      level: 'advanced',
      duration: '55 hours',
      featured: false,
    },
  })

  const courses = [mathClass10, scienceMastery, englishGrammar, advCalculus]

  courses.forEach((c) => {
    console.log(`  ✅ "${c.title}" — ₹${c.price} (${c.category})`)
  })
  console.log()

  // ─── 3. Create Chapters & Videos ───
  console.log('📖 Creating chapters and videos...')

  type ChapterData = {
    title: string
    desc: string
    videos: { title: string; duration: number }[]
  }

  const chaptersByCourse: Record<string, ChapterData[]> = {
    [mathClass10.id]: [
      {
        title: 'Real Numbers & Polynomials',
        desc: 'Euclid\'s division lemma, fundamental theorem of arithmetic, and polynomial operations',
        videos: [
          { title: 'Euclid\'s Division Lemma', duration: 900 },
          { title: 'Fundamental Theorem of Arithmetic', duration: 1200 },
          { title: 'Polynomials - Zeros & Coefficients', duration: 1500 },
        ],
      },
      {
        title: 'Quadratic Equations',
        desc: 'Solving quadratic equations by factorisation, completing the square, and the quadratic formula',
        videos: [
          { title: 'Introduction to Quadratic Equations', duration: 800 },
          { title: 'Solving by Factorisation', duration: 1100 },
          { title: 'Quadratic Formula & Nature of Roots', duration: 1400 },
        ],
      },
      {
        title: 'Arithmetic Progressions',
        desc: 'Understanding sequences, nth term formula, and sum of n terms',
        videos: [
          { title: 'What is an AP?', duration: 700 },
          { title: 'Nth Term of an AP', duration: 1000 },
          { title: 'Sum of N Terms', duration: 1200 },
        ],
      },
    ],
    [scienceMastery.id]: [
      {
        title: 'Chemical Reactions & Equations',
        desc: 'Types of chemical reactions, balancing equations, and everyday chemistry',
        videos: [
          { title: 'Types of Chemical Reactions', duration: 1100 },
          { title: 'Balancing Chemical Equations', duration: 900 },
          { title: 'Corrosion & Rancidity', duration: 800 },
        ],
      },
      {
        title: 'Acids, Bases & Salts',
        desc: 'Properties, indicators, pH scale, and chemical reactions of acids and bases',
        videos: [
          { title: 'Properties of Acids & Bases', duration: 1000 },
          { title: 'pH Scale & Indicators', duration: 1200 },
          { title: 'Salts & Their Preparation', duration: 1100 },
        ],
      },
      {
        title: 'Light - Reflection & Refraction',
        desc: 'Laws of reflection, mirror formula, lens formula, and optical phenomena',
        videos: [
          { title: 'Reflection of Light', duration: 1300 },
          { title: 'Mirror Formula & Magnification', duration: 1500 },
          { title: 'Refraction through Lenses', duration: 1400 },
        ],
      },
    ],
    [englishGrammar.id]: [
      {
        title: 'Parts of Speech & Tenses',
        desc: 'Nouns, pronouns, verbs, adjectives, and all 12 tenses',
        videos: [
          { title: 'Nouns, Pronouns & Articles', duration: 1000 },
          { title: 'Verbs & Adjectives', duration: 900 },
          { title: 'All 12 Tenses Made Easy', duration: 1500 },
        ],
      },
      {
        title: 'Voice & Speech',
        desc: 'Active vs passive voice, direct vs indirect speech transformations',
        videos: [
          { title: 'Active and Passive Voice', duration: 1200 },
          { title: 'Direct and Indirect Speech', duration: 1100 },
        ],
      },
    ],
    [advCalculus.id]: [
      {
        title: 'Limits & Continuity',
        desc: 'Intuitive understanding of limits, epsilon-delta definition, and continuity',
        videos: [
          { title: 'Intuition Behind Limits', duration: 1200 },
          { title: 'Evaluating Limits - Algebraic Methods', duration: 1400 },
          { title: 'Continuity & Differentiability', duration: 1600 },
        ],
      },
      {
        title: 'Differential Calculus',
        desc: 'Derivatives, differentiation rules, and applications',
        videos: [
          { title: 'First Principles of Differentiation', duration: 1500 },
          { title: 'Product & Quotient Rules', duration: 1300 },
          { title: 'Chain Rule & Implicit Differentiation', duration: 1700 },
        ],
      },
      {
        title: 'Integral Calculus',
        desc: 'Indefinite & definite integrals, methods of integration, and applications',
        videos: [
          { title: 'Indefinite Integration Basics', duration: 1400 },
          { title: 'Methods of Integration', duration: 1800 },
          { title: 'Definite Integration & Area Under Curves', duration: 1600 },
        ],
      },
    ],
  }

  const allVideos: { id: string; courseId: string }[] = []
  let totalChapters = 0
  let totalVideos = 0

  // Track the first video of each course for freePreview
  const firstVideoOfCourse = new Set<string>()

  for (const [courseId, chapters] of Object.entries(chaptersByCourse)) {
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i]
      const chapter = await db.chapter.create({
        data: {
          title: ch.title,
          description: ch.desc,
          order: i + 1,
          courseId,
        },
      })
      totalChapters++

      for (let j = 0; j < ch.videos.length; j++) {
        const v = ch.videos[j]
        // First video of the first chapter of each course is free preview
        const isFirstVideoOfCourse = i === 0 && j === 0
        if (isFirstVideoOfCourse) {
          firstVideoOfCourse.add(courseId)
        }

        const video = await db.video.create({
          data: {
            title: v.title,
            duration: v.duration,
            freePreview: isFirstVideoOfCourse,
            order: j + 1,
            chapterId: chapter.id,
            courseId,
          },
        })
        allVideos.push({ id: video.id, courseId })
        totalVideos++
      }
    }
  }

  console.log(`  ✅ ${totalChapters} chapters and ${totalVideos} videos created across ${courses.length} courses`)
  console.log(`  ✅ First video of each course set as freePreview: true\n`)

  // ─── 4. Create Faculty ───
  console.log('👨‍🏫 Creating faculty members...')
  const facultyData = [
    {
      name: 'Dr. Vikram Sharma',
      title: 'Head of Department - Mathematics',
      bio: 'Ph.D. in Mathematics from IIT Patna with 15+ years of teaching experience. Specializes in making complex mathematical concepts simple and engaging for students.',
      photo: 'https://placehold.co/400x400/10b981/white?text=VS',
      subjects: 'Mathematics, Advanced Mathematics',
      experience: '15+ years',
      order: 1,
    },
    {
      name: 'Prof. Priya Singh',
      title: 'Senior Science Faculty',
      bio: 'M.Sc. in Chemistry from BITS Pilani. Known for her interactive teaching style and practical approach to science education. Published researcher in science pedagogy.',
      photo: 'https://placehold.co/400x400/3b82f6/white?text=PS',
      subjects: 'Science, Chemistry',
      experience: '12+ years',
      order: 2,
    },
    {
      name: 'Mr. Arun Kumar',
      title: 'English Language Expert',
      bio: 'CELTA certified English language trainer with expertise in communication skills. Trained 5000+ students in spoken and written English across Bihar.',
      photo: 'https://placehold.co/400x400/f59e0b/white?text=AK',
      subjects: 'English, Communication Skills',
      experience: '10+ years',
      order: 3,
    },
  ]

  await db.faculty.createMany({ data: facultyData })
  console.log(`  ✅ ${facultyData.length} faculty members created\n`)

  // ─── 5. Create Gallery Items ───
  console.log('🖼️  Creating gallery items...')
  const galleryData = [
    {
      title: 'Campus Overview',
      description: 'Our modern learning environment at Kankarbagh, Patna',
      imageUrl: 'https://placehold.co/800x600/10b981/white?text=Campus+Overview',
      type: 'photo',
      order: 1,
    },
    {
      title: 'Interactive Classroom',
      description: 'Students engaged in our interactive learning sessions',
      imageUrl: 'https://placehold.co/800x600/3b82f6/white?text=Interactive+Classroom',
      type: 'photo',
      order: 2,
    },
    {
      title: 'Science Lab',
      description: 'Hands-on experiments in our well-equipped science laboratory',
      imageUrl: 'https://placehold.co/800x600/f59e0b/white?text=Science+Laboratory',
      type: 'photo',
      order: 3,
    },
    {
      title: 'Student Achievements',
      description: 'Our students celebrating their academic achievements',
      imageUrl: 'https://placehold.co/800x600/8b5cf6/white?text=Student+Achievements',
      type: 'photo',
      order: 4,
    },
  ]

  await db.galleryItem.createMany({ data: galleryData })
  console.log(`  ✅ ${galleryData.length} gallery items created\n`)

  // ─── 6. Create Live Sessions ───
  console.log('📡 Creating live sessions...')

  const now = new Date()
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const endedSession = await db.liveSession.create({
    data: {
      title: 'Doubt Clearing Session - Mathematics',
      description: 'Live doubt clearing session for Class 10 Mathematics. Students asked questions on quadratic equations and arithmetic progressions.',
      courseId: mathClass10.id,
      teacherId: admin.id,
      channelId: 'live-doubt-maths-' + Date.now(),
      thumbnail: 'https://placehold.co/800x450/10b981/white?text=Doubt+Clearing+Maths',
      status: 'ended',
      startTime: twoDaysAgo,
      endTime: new Date(twoDaysAgo.getTime() + 90 * 60 * 1000),
      viewerCount: 42,
    },
  })

  const scheduledSession = await db.liveSession.create({
    data: {
      title: 'Calculus Masterclass - Introduction to Limits',
      description: 'Join Dr. Vikram Sharma for an exciting introduction to limits and continuity. Perfect for students starting their calculus journey.',
      courseId: advCalculus.id,
      teacherId: admin.id,
      channelId: 'live-calculus-masterclass-' + Date.now(),
      thumbnail: 'https://placehold.co/800x450/8b5cf6/white?text=Calculus+Masterclass',
      status: 'scheduled',
      startTime: threeDaysFromNow,
      viewerCount: 0,
    },
  })

  // Add some chat messages to the ended session
  await db.chatMessage.createMany({
    data: [
      { sessionId: endedSession.id, userId: student.id, userName: 'Rahul Kumar', message: 'How do we solve x² - 5x + 6 = 0 by completing the square?' },
      { sessionId: endedSession.id, userId: rahul.id, userName: 'Rahul Sharma', message: 'Can you explain the nth term formula for AP again?' },
      { sessionId: endedSession.id, userId: admin.id, userName: 'Dr. Vikram Sharma', message: 'Great questions! Let me explain step by step...' },
      { sessionId: endedSession.id, userId: priya.id, userName: 'Priya Kumari', message: 'This session is very helpful, thank you sir!' },
    ],
  })

  console.log(`  ✅ Ended session:   "${endedSession.title}" (${endedSession.viewerCount} viewers)`)
  console.log(`  ✅ Scheduled:       "${scheduledSession.title}" (starts ${scheduledSession.startTime?.toLocaleDateString()})`)
  console.log(`  ✅ Chat messages:   4 messages in ended session\n`)

  // ─── 7. Enroll demo students in various courses ───
  console.log('📝 Creating enrollments...')

  type EnrollmentInput = { userId: string; courseId: typeof courses[0]; status: string }
  const enrollments: EnrollmentInput[] = [
    // Student (Rahul Kumar) enrolled in all 4 courses
    { userId: student.id, courseId: mathClass10, status: 'active' },
    { userId: student.id, courseId: scienceMastery, status: 'active' },
    { userId: student.id, courseId: englishGrammar, status: 'active' },
    { userId: student.id, courseId: advCalculus, status: 'active' },
    // Rahul Sharma enrolled in Maths and Science
    { userId: rahul.id, courseId: mathClass10, status: 'active' },
    { userId: rahul.id, courseId: scienceMastery, status: 'active' },
    { userId: rahul.id, courseId: advCalculus, status: 'active' },
    // Priya enrolled in Maths, Science, English
    { userId: priya.id, courseId: mathClass10, status: 'active' },
    { userId: priya.id, courseId: scienceMastery, status: 'active' },
    { userId: priya.id, courseId: englishGrammar, status: 'active' },
    // Amit enrolled in English and Advanced Calculus
    { userId: amit.id, courseId: englishGrammar, status: 'active' },
    { userId: amit.id, courseId: advCalculus, status: 'active' },
  ]

  const createdEnrollments = await Promise.all(
    enrollments.map((e) =>
      db.enrollment.create({
        data: { userId: e.userId, courseId: e.courseId.id, status: e.status },
      })
    )
  )

  // Create payments for paid courses
  const paymentData = createdEnrollments
    .filter((en) => {
      const course = courses.find((c) => c.id === en.courseId)
      return course && course.price > 0
    })
    .map((en, idx) => {
      const course = courses.find((c) => c.id === en.courseId)!
      return {
        userId: en.userId,
        courseId: en.courseId,
        amount: course.price,
        status: 'completed',
        method: idx % 2 === 0 ? 'upi' : 'card',
        transactionId: `TXN_${String(idx + 1).padStart(4, '0')}`,
      }
    })

  await db.payment.createMany({ data: paymentData })

  console.log(`  ✅ ${createdEnrollments.length} enrollments created`)
  console.log(`  ✅ ${paymentData.length} payments recorded\n`)

  // ─── 8. Create Course Progress for demo student ───
  console.log('📊 Creating progress entries...')

  // Student progress in Mathematics Class 10
  const mathVideos = allVideos.filter((v) => v.courseId === mathClass10.id)
  const scienceVideos = allVideos.filter((v) => v.courseId === scienceMastery.id)
  const englishVideos = allVideos.filter((v) => v.courseId === englishGrammar.id)
  const calcVideos = allVideos.filter((v) => v.courseId === advCalculus.id)

  const progressData = [
    // Math Class 10 - completed 5 videos, 1 in progress
    ...mathVideos.slice(0, 5).map((v) => ({
      userId: student.id,
      courseId: mathClass10.id,
      videoId: v.id,
      completed: true,
      watchTime: 0,
    })),
    { userId: student.id, courseId: mathClass10.id, videoId: mathVideos[5]?.id, completed: false, watchTime: 450 },

    // Science - completed 3 videos
    ...scienceVideos.slice(0, 3).map((v) => ({
      userId: student.id,
      courseId: scienceMastery.id,
      videoId: v.id,
      completed: true,
      watchTime: 0,
    })),

    // English - completed 2 videos, 1 in progress
    ...englishVideos.slice(0, 2).map((v) => ({
      userId: student.id,
      courseId: englishGrammar.id,
      videoId: v.id,
      completed: true,
      watchTime: 0,
    })),
    { userId: student.id, courseId: englishGrammar.id, videoId: englishVideos[2]?.id, completed: false, watchTime: 300 },

    // Rahul Sharma progress in Math
    ...mathVideos.slice(0, 3).map((v) => ({
      userId: rahul.id,
      courseId: mathClass10.id,
      videoId: v.id,
      completed: true,
      watchTime: 0,
    })),

    // Priya progress in Science
    ...scienceVideos.slice(0, 4).map((v) => ({
      userId: priya.id,
      courseId: scienceMastery.id,
      videoId: v.id,
      completed: true,
      watchTime: 0,
    })),
  ].filter((p) => p.videoId) // Remove entries with undefined videoId

  await db.courseProgress.createMany({ data: progressData })
  console.log(`  ✅ ${progressData.length} progress entries created\n`)

  // ─── 9. Create Reviews ───
  console.log('⭐ Creating reviews...')

  const reviewsData = [
    {
      userId: student.id,
      courseId: mathClass10.id,
      rating: 5,
      comment: 'Excellent mathematics course! All concepts are explained so clearly. My marks improved from 60% to 92% in just 3 months. Highly recommended for all Class 10 students!',
      status: 'approved',
    },
    {
      userId: rahul.id,
      courseId: scienceMastery.id,
      rating: 5,
      comment: 'The Science Mastery course is amazing. The practical experiments and visual explanations make learning so much fun. The chemistry section on acids and bases was particularly well done.',
      status: 'approved',
    },
    {
      userId: priya.id,
      courseId: mathClass10.id,
      rating: 4,
      comment: 'Very good course for building mathematical foundations. The quadratic equations section was excellent. Wish there were more practice problems with solutions.',
      status: 'approved',
    },
    {
      userId: amit.id,
      courseId: englishGrammar.id,
      rating: 5,
      comment: 'Mr. Arun Kumar is an exceptional English teacher. My grammar and writing skills have improved dramatically. The tenses section was a game-changer for me!',
      status: 'approved',
    },
    {
      userId: student.id,
      courseId: scienceMastery.id,
      rating: 4,
      comment: 'Great course for understanding physics and chemistry concepts. The light chapter with mirror and lens formulas was very well explained.',
      status: 'approved',
    },
    {
      userId: rahul.id,
      courseId: advCalculus.id,
      rating: 5,
      comment: 'Best calculus course I have ever taken. Dr. Sharma makes limits and derivatives feel so intuitive. Perfect for JEE preparation!',
      status: 'approved',
    },
  ]

  await db.review.createMany({ data: reviewsData })
  console.log(`  ✅ ${reviewsData.length} reviews created (all approved)\n`)

  // ─── 10. Create Notifications ───
  console.log('🔔 Creating notifications...')

  const notificationsData = [
    {
      userId: student.id,
      title: 'Welcome to FUTURE TOPPERS!',
      message: 'Thank you for joining FUTURE TOPPERS! Start exploring our courses and begin your learning journey today.',
      type: 'info',
      read: false,
    },
    {
      userId: student.id,
      title: 'Calculus Masterclass Scheduled',
      message: 'A live Calculus Masterclass has been scheduled! Join Dr. Vikram Sharma for an exciting introduction to limits and continuity.',
      type: 'live',
      read: false,
    },
    {
      userId: rahul.id,
      title: 'Welcome to FUTURE TOPPERS!',
      message: 'Welcome aboard! Explore our free Mathematics course for Class 10 and start learning today.',
      type: 'info',
      read: true,
    },
    {
      userId: priya.id,
      title: 'New Live Session Coming Up',
      message: 'Don\'t miss the Calculus Masterclass happening this week. Register now to secure your spot!',
      type: 'live',
      read: false,
    },
  ]

  await db.notification.createMany({ data: notificationsData })
  console.log(`  ✅ ${notificationsData.length} notifications created\n`)

  // ─── Summary ───
  console.log('═'.repeat(55))
  console.log('✅ Seed completed successfully!')
  console.log('═'.repeat(55))
  console.log(`
📋 Summary of seeded data:
  👤 Users:           5 (1 admin, 4 demo students)
  📚 Courses:         4 (1 free, 3 paid)
  📖 Chapters:        ${totalChapters}
  🎬 Videos:          ${totalVideos} (first video per course = free preview)
  👨‍🏫 Faculty:         ${facultyData.length}
  🖼️  Gallery Items:   ${galleryData.length}
  📡 Live Sessions:   2 (1 ended, 1 scheduled)
  💬 Chat Messages:   4
  📝 Enrollments:     ${createdEnrollments.length}
  💰 Payments:        ${paymentData.length}
  ⭐ Reviews:         ${reviewsData.length} (all approved)
  🔔 Notifications:   ${notificationsData.length}
  📊 Progress:        ${progressData.length} entries

🔑 Login credentials:
  Admin:        admin@futuretoppers.in / admin123
  Student:      student@demo.com / student123
  Rahul:        rahul@test.com / student123
  Priya:        priya@test.com / student123
  Amit:         amit@test.com / student123
`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

