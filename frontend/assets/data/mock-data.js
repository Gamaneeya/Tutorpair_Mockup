/**
 * TutorPair SAMPLE DATA — edit this file to change the demo's starting content.
 * No UI, HTML, or CSS edits are required to change names, subjects, scores or prices.
 * The browser stores demo actions in localStorage; use the Reset demo button to reload these defaults.
 */
export const mockData = {
  people: {
    student: { id: 's01', name: 'Nicha', fullName: 'Nicha P.', grade: 'M.4', initials: 'NP', goal: 'Improve Mathematics from 72% to 85%' },
    parent: { id: 'p01', name: 'Khun Som', fullName: 'Somchai P.', linkedStudentId: 's01' },
    tutor: { id: 't01', name: 'P’Mew', fullName: 'P’Mew Anong', subject: 'Mathematics', verified: true },
    admin: { id: 'a01', name: 'Admin', fullName: 'TutorPair Admin' }
  },
  tutors: [
    {id:'t01', name:'P’Mew Anong', initials:'MA', subject:'Mathematics', grades:['M.4','M.5','M.6'], rate:450, rating:4.9, reviews:186, match:98, accent:'violet', university:'Chulalongkorn University', tagline:'Visual examples, patient explanations and guided practice.', availability:['Tue 18:00','Thu 17:00','Sat 10:00'], type:'1-on-1'},
    {id:'t02', name:'P’Beam Thanat', initials:'BT', subject:'Mathematics', grades:['M.1','M.2','M.3','M.4','M.5','M.6'], rate:420, rating:4.8, reviews:94, match:94, accent:'orange', university:'Mahidol University', tagline:'Structured learning plans and clear weekly practice.', availability:['Wed 18:00','Fri 19:00'], type:'1-on-1'},
    {id:'t03', name:'P’Fern Nalinee', initials:'FN', subject:'Physics', grades:['M.4','M.5','M.6'], rate:480, rating:4.9, reviews:102, match:91, accent:'teal', university:'KMITL', tagline:'Turn difficult concepts into simple, real-life examples.', availability:['Mon 17:30','Sat 13:00'], type:'1-on-1'}
  ],
  student: {
    activeCourses:2, completedLessons:6, totalLessons:8, latestQuiz:7, quizTotal:10,
    course: {id:'c01',title:'M.4 Mathematics Foundations', subject:'Mathematics', tutorId:'t01', sessions:8, completed:6, price:3600, schedule:'Thu 17:00–18:00', nextTopic:'Graph transformations'},
    quizHistory:[{label:'Baseline',value:40},{label:'Lesson 2',value:50},{label:'Lesson 4',value:60},{label:'Lesson 6',value:70}],
    skills:[{name:'Quadratic equations',score:85},{name:'Graph interpretation',score:68},{name:'Factorization',score:82},{name:'Word problems',score:45}],
    homework:[{name:'Factorization practice set',due:'Friday',done:false},{name:'Review graph transformation notes',due:'Thursday',done:true}],
    goal:85
  },
  groupClasses: [
    {id:'g01',title:'M.4 Math Exam Booster',subject:'Mathematics',grade:'M.4',schedule:'Sat · 10:00–11:30',duration:'4 weeks · 8 lessons',capacity:4,byos:2,platform:0,price:1500,tutorId:'t01',summary:'Practice school worksheets and build confidence before the exam.'},
    {id:'g02',title:'Physics Problem-Solving Pod',subject:'Physics',grade:'M.5',schedule:'Sun · 13:00–14:30',duration:'4 weeks · 8 lessons',capacity:3,byos:1,platform:1,price:1800,tutorId:'t03',summary:'Small-group Physics practice, discussion and guided exercises.'}
  ],
  latestNote: {id:'n01',studentId:'s01',student:'Nicha P.',subject:'Mathematics',topic:'Quadratic equations',session:6,level:'Developing',score:7,total:10,strength:'Can factor simple quadratic equations independently.',improve:'Needs more practice with word problems.',next:'Complete 5 practice questions before Thursday.',updated:'Today · 18:10'},
  lessonNotes: [],
  notifications: [
    {id:'m01',type:'Lesson summary',subject:'Mathematics',title:'Your child’s learning update is ready',date:'Today · 18:10',status:'Preview'},
    {id:'m02',type:'Schedule reminder',subject:'Mathematics',title:'Next Mathematics lesson: Thursday at 17:00',date:'Yesterday · 09:00',status:'Preview'}
  ],
  line: {connected:false, lessons:true, weekly:true, reminders:false},
  requests: [
    {id:'r01',student:'Kanya S.',grade:'M.4',subject:'Mathematics',goal:'Prepare for school midterm',budget:450,when:'Thu 18:00',status:'New'},
    {id:'r02',student:'Napat T.',grade:'M.3',subject:'Science',goal:'Strengthen foundations',budget:350,when:'Tue 17:00',status:'New'}
  ],
  earnings: [{label:'M.4 Mathematics (TutorPair)',total:3600,commission:432,source:'TutorPair'}, {label:'BYOS group students',total:3000,commission:0,source:'BYOS'}],
  admin: {pendingTutors:12,refundRequests:5,activeStudents:384,monthlyGMV:248000}
};
