// Edit this file when replacing the sample people, lessons, prices, or catalog.
// No real identities, payments, or LINE messages are stored in this demo.
export const GOALS = [
  {value:'school-grade',label:'Improve school grades'},
  {value:'exam-prep',label:'Prepare for a school exam'},
  {value:'homework',label:'Understand homework / worksheets'},
  {value:'foundation',label:'Build subject foundations'}
];
export const COURSE_FOCUS = ['Midterm exam','Final exam','Quiz preparation','Homework support','Concept review'];
export const CATALOG = {
  tutors: [
    {id:'t01', name:'P’Mew Anong', initials:'MA', color:'lavender', subject:'Mathematics', grades:['M.3','M.4','M.5','M.6'], topics:['Algebra','Functions','Word Problems'], price:450, levels:['foundation','intermediate'], pace:['slow','medium'], approach:['step','practice'], interaction:['encouraging'], schedule:['thu','sat'], formats:['one','group'], quality:94, faculty:'Faculty of Science',gpaHonors:'3.70 · honors',rating:4.9,ratingCount:34,verifiedHours:428,renewalRate:76,demoVideoUrl:'/assets/demo/math-sample.mp4', university:'Chulalongkorn University', experience:'4 years tutoring', about:'Clear, patient explanations with guided problem-solving and weekly goals.', verified:true,approvedScopes:[{subject:'Mathematics',grades:['M.3','M.4','M.5','M.6'],status:'approved'}],offerings:[{id:'o-t01',subject:'Mathematics',grades:['M.3','M.4','M.5','M.6'],goalType:null,price:450,schedule:['thu','sat'],formats:['one','group'],published:true}],preferences:{detail:1,practice:2,dialogue:2,guidance:1,atmosphere:2,formality:3,flexibility:2,energy:3,motivation:5},goals:['school-grade', 'exam-prep', 'foundation']},
    {id:'t02', name:'P’Beam Thanat', initials:'BT', color:'peach', subject:'Mathematics', grades:['M.1','M.2','M.3','M.4','M.5','M.6'], topics:['Algebra','Geometry','Functions','Word Problems'], price:390, levels:['foundation','intermediate','advanced'], pace:['medium','fast'], approach:['practice','step'], interaction:['independent','encouraging'], schedule:['thu','tue'], formats:['one'], quality:87, faculty:'Faculty of Engineering',gpaHonors:'3.55',rating:4.8,ratingCount:21,verifiedHours:236,renewalRate:61,demoVideoUrl:'/assets/demo/math-sample.mp4', university:'Mahidol University', experience:'3 years tutoring', about:'Structured homework, practice sets, and a steady focus on exam readiness.', verified:true,approvedScopes:[{subject:'Mathematics',grades:['M.1','M.2','M.3','M.4','M.5','M.6'],status:'approved'}],offerings:[{id:'o-t02',subject:'Mathematics',grades:['M.1','M.2','M.3','M.4','M.5','M.6'],goalType:null,price:390,schedule:['thu','tue'],formats:['one'],published:true}],preferences:{detail:3,practice:1,dialogue:3,guidance:2,atmosphere:4,formality:2,flexibility:2,energy:4,motivation:3},goals:['school-grade', 'homework', 'exam-prep']},
    {id:'t03', name:'P’Ploy Wiriya', initials:'PW', color:'mint', subject:'Mathematics', grades:['M.3','M.4','M.5'], topics:['Algebra','Functions','Geometry'], price:480, levels:['foundation','intermediate'], pace:['slow','medium'], approach:['concept','step'], interaction:['encouraging'], schedule:['thu','sun'], formats:['one','group'], quality:90, faculty:'Faculty of Education',gpaHonors:'3.81 · honors',rating:4.9,ratingCount:41,verifiedHours:532,renewalRate:82,demoVideoUrl:'/assets/demo/math-sample.mp4', university:'Thammasat University', experience:'5 years tutoring', about:'Builds confidence by connecting ideas to easy-to-follow examples.', verified:true,approvedScopes:[{subject:'Mathematics',grades:['M.3','M.4','M.5'],status:'approved'}],offerings:[{id:'o-t03',subject:'Mathematics',grades:['M.3','M.4','M.5'],goalType:null,price:480,schedule:['thu','sun'],formats:['one','group'],published:true}],preferences:{detail:2,practice:4,dialogue:1,guidance:2,atmosphere:1,formality:4,flexibility:4,energy:4,motivation:5},goals:['school-grade', 'foundation', 'homework']},
    {id:'t04', name:'P’Arun Pat', initials:'AP', color:'sky', subject:'Mathematics', grades:['M.4','M.5','M.6'], topics:['Functions','Word Problems','Algebra'], price:500, levels:['intermediate','advanced'], pace:['medium','fast'], approach:['practice','concept'], interaction:['independent'], schedule:['mon','tue','thu','sat'], formats:['one'], quality:89, faculty:'Faculty of Engineering',gpaHonors:'3.45',rating:4.7,ratingCount:18,verifiedHours:124,renewalRate:54,demoVideoUrl:'/assets/demo/math-sample.mp4', university:'KMUTT', experience:'2 years tutoring', about:'Challenge-driven teaching for students aiming to master difficult questions.', verified:true,approvedScopes:[{subject:'Mathematics',grades:['M.4','M.5','M.6'],status:'approved'}],offerings:[{id:'o-t04',subject:'Mathematics',grades:['M.4','M.5','M.6'],goalType:null,price:500,schedule:['mon','tue','thu','sat'],formats:['one'],published:true}],preferences:{detail:4,practice:1,dialogue:3,guidance:4,atmosphere:5,formality:2,flexibility:2,energy:4,motivation:2},goals:['exam-prep', 'school-grade']},
    {id:'t05', name:'P’Fern Nalinee', initials:'FN', color:'lavender', subject:'Physics', grades:['M.4','M.5','M.6'], topics:['Mechanics','Waves','Electricity'], price:460, levels:['foundation','intermediate'], pace:['slow','medium'], approach:['concept','step'], interaction:['encouraging'], schedule:['tue','sat'], formats:['one','group'], quality:91, faculty:'Faculty of Applied Science',gpaHonors:'3.76 · honors',rating:4.9,ratingCount:28,verifiedHours:317,renewalRate:73,demoVideoUrl:'/assets/demo/physics-sample.mp4', university:'KMITL', experience:'4 years tutoring', about:'Makes physics concepts intuitive before moving to exam practice.', verified:true,approvedScopes:[{subject:'Physics',grades:['M.4','M.5','M.6'],status:'approved'}],offerings:[{id:'o-t05',subject:'Physics',grades:['M.4','M.5','M.6'],goalType:null,price:460,schedule:['tue','sat'],formats:['one','group'],published:true}],preferences:{detail:2,practice:4,dialogue:2,guidance:1,atmosphere:3,formality:3,flexibility:3,energy:3,motivation:4},goals:['school-grade', 'foundation', 'exam-prep']},
    {id:'t06', name:'P’Jane Akarin', initials:'JA', color:'peach', subject:'English', grades:['M.1','M.2','M.3','M.4','M.5','M.6'], topics:['Grammar','Reading','Writing','Conversation'], price:420, levels:['foundation','intermediate','advanced'], pace:['slow','medium'], approach:['concept','practice'], interaction:['encouraging'], schedule:['thu','sun'], formats:['one','group'], quality:92, faculty:'Faculty of Humanities',gpaHonors:'3.67',rating:4.9,ratingCount:37,verifiedHours:481,renewalRate:79,demoVideoUrl:'/assets/demo/english-sample.mp4', university:'Chiang Mai University', experience:'6 years tutoring', about:'Improves school English using real examples and encouraging feedback.', verified:true,approvedScopes:[{subject:'English',grades:['M.1','M.2','M.3','M.4','M.5','M.6'],status:'approved'}],offerings:[{id:'o-t06',subject:'English',grades:['M.1','M.2','M.3','M.4','M.5','M.6'],goalType:null,price:420,schedule:['thu','sun'],formats:['one','group'],published:true}],preferences:{detail:2,practice:4,dialogue:1,guidance:2,atmosphere:1,formality:5,flexibility:4,energy:4,motivation:5},goals:['school-grade', 'homework', 'foundation']}
  ],
  groups: [
    {id:'g01',tutorId:'t01',name:'M.4 Math Grade Booster',subject:'Mathematics',grade:'M.4',topics:['Algebra','Functions','Word Problems'],schedule:'sat',capacity:4,byos:2,platform:0,price:1600,sessions:4,durationMinutes:60,description:'Small-group school worksheets and guided exam practice.'},
    {id:'g02',tutorId:'t05',name:'M.5 Physics Focus Pod',subject:'Physics',grade:'M.5',topics:['Mechanics','Waves'],schedule:'tue',capacity:3,byos:1,platform:1,price:1800,sessions:4,durationMinutes:60,description:'Practice with classmates at the same level.'}
  ]
};

export const SAMPLE = {
  students: {
    new: {id:'s-new',name:'New Student',grade:'M.4',request:null,course:null,lessonNotes:[],feedback:[]},
    returning: {id:'s-demo',name:'Nicha',grade:'M.4',request:{grade:'M.4',subject:'Mathematics',currentLevel:'foundation',currentGrade:'2.5',targetGrade:'3.5',goal:'Improve my next school mathematics grade',topics:['Algebra','Functions'],pace:'slow',approach:'step',interaction:'encouraging',goalType:'school-grade',courseFocus:'Midterm exam',schedule:['thu','sat'],budget:500,format:'one'},course:{id:'c100',tutorId:'t01',tutorName:'P’Mew Anong',subject:'Mathematics',title:'M.4 Mathematics Foundations',sessions:8,completed:6,price:3600,started:true,nextLesson:'Thursday · 17:00',source:'TutorPair'},lessonNotes:[{id:'ln1',topic:'Quadratic equations',engagement:2,homeworkChecked:true,strength:'Can factor simple quadratic expressions independently.',improve:'Needs additional practice on word problems.',homework:'Solve five word problems before the next lesson.',date:'Example · Session 6'}],feedback:[]}
  },
  tutors: {
    new: {id:'t-new',name:'New Tutor',profile:null,verificationStatus:'not_started',verification:null,subjectApprovals:[],roster:[],groups:[],sessionNotes:[],offerings:[]},
    returning: {id:'t-demo',name:'P’Mew',verificationStatus:'approved',subjectApprovals:[{subject:'Mathematics',grades:['M.3','M.4','M.5','M.6'],status:'approved'}],verification:{education:'Bachelor degree',subjectCheck:'passed',teachingDemo:'Approved demo example'},profile:{credentials:{institution:'Example university',experienceYears:'4',intro:'Patient explanations with school exam practice.'},subjects:['Mathematics'],grades:['M.3','M.4','M.5','M.6'],topics:['Algebra','Functions','Word Problems'],price:450,pace:['slow','medium'],approach:['step','practice'],interaction:['encouraging'],schedule:['thu','sat'],formats:['one','group']},roster:[{studentId:'s-demo',name:'Nicha',grade:'M.4',subject:'Mathematics',source:'TutorPair'},{studentId:'byos-01',name:'Mint',grade:'M.4',subject:'Mathematics',source:'BYOS'}],groups:['g01'],sessionNotes:[],offerings:[{id:'o-demo',subject:'Mathematics',grades:['M.4','M.5','M.6'],topics:['Algebra','Functions','Word Problems'],goalType:'school-grade',courseFocus:'Midterm exam',price:450,formats:['one','group'],schedule:['thu','sat'],published:true}]}
  },
  parents: {
    new: {id:'p-new',name:'New Parent',linkedStudentId:null,lineConnected:false},
    returning: {id:'p-demo',name:'Khun Som',linkedStudentId:'s-demo',lineConnected:true}
  }
};
export const DAYS = [
 {id:'mon',name:'Monday · 17:00–21:00'},
 {id:'wed',name:'Wednesday · 17:00–21:00'},
 {id:'fri',name:'Friday · 17:00–21:00'},
 {id:'tue',name:'Tuesday · 18:00–20:00'},
 {id:'thu',name:'Thursday · 17:00–20:00'},
 {id:'sat',name:'Saturday · 09:00–12:00'},
 {id:'sun',name:'Sunday · 13:00–17:00'}
];
export const SUBJECTS=['Mathematics','Science','Physics','Chemistry','Biology','English','Thai','Social Studies'];
export const GRADES=['M.1','M.2','M.3','M.4','M.5','M.6'];
export const TOPICS={Mathematics:['Algebra','Functions','Geometry','Word Problems'],Physics:['Mechanics','Waves','Electricity'],English:['Grammar','Reading','Writing','Conversation'],Science:['Scientific Methods','Energy','Living Systems'],Chemistry:['Atoms','Reactions','Moles'],Biology:['Cells','Genetics','Ecology'],Thai:['Reading','Writing','Grammar'], 'Social Studies':['History','Geography','Civics']};

// Returning tutor's course outline from the legacy app. This tracks completed objectives, not mastery.
export const SAMPLE_PLANS = {
 's-demo':[
  {id:'lp01',title:'Algebra foundations',completed:true},
  {id:'lp02',title:'Factorization exercises',completed:true},
  {id:'lp03',title:'Quadratic graphs',completed:false},
  {id:'lp04',title:'Applied word problems',completed:false}
 ]
};
